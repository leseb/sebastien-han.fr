---
title: OpenStack and Backup
date: 2015-02-17 12:14:00
slug: openstack-and-backup
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack and Backup](/images/openstack-backup.jpg)

Doing backups in the Cloud is not an easy task.
In this article I will try to answer some frequently asked questions.

<!--more-->

<br />

# How to run your application in the Cloud?

## Based images

By following simple rules, we can achieve pretty decent backups.
The operating system of a virtual machine (and thus the Glance image) is immutable so no matter what happens to this instance it can be easily run again somewhere else.
All its attributes are kept in the base image (packages, configuration etc) so we can easily rebuild it.
By default, many Cloud providers (and OpenStack as well) assume that the ephemeral disk (representing the root filesystem) is not persistent.
Amazon goes even further by not ensuring survival to a reboot, so the user should keep an up to date image of its application.
It is then critical to insist on this aspect of the usage of the Cloud.
The root filesystem of the virtual machine **must not contain any important data**.
Important data can be categorized as application data for instance.

OpenStack is a bit different due to its ability to allow multi-backends to store virtual machine ephemeral disks.
For example, the following can be used:

* iSCSI LUN mapped to a compute host paired with LVM
* Ceph RBD
* Sheepdog
* GlusterFS
* NFS

The first three are network disks part of distributed storage solution.
The last two are not bond to OpenStack since they are network filesystem / distributed filesystem that can be mounted under `/var/lib/nova/instances/`.

Where the default is to store disk locally on the hypervisor it's possible to store them on shared storage and thus enjoying all the benefits of a shared storage backend such as easing live-migration process.
We only migrate the workload and not the virtual machine disk.

The **key element** of proper backups was explained in a recent article of mine thanks to the [QEMU guest agent](http://www.sebastien-han.fr/blog/2015/02/09/openstack-perform-consistent-snapshots-with-qemu-guest-agent/).
Thus the based image must only be configured with a QEMU guest agent running inside.
The article also answered the "how to backup" question.

<br />
<br />

# Backup levels

We can differentiate three levels of backup.
To illustrate this let's take a simple example where you want to backup a virtual machine running on a hypervisor backed by local storage.

1. Block level: `dd` or LVM snapshot
2. Filesystem level: rsync
3. Application level: SQL dump

## Block level

The main issue of this method is the inconsistency it brings.
Possibly under extremely bad circumstances a filesystem corruption.

Let me explain why, basically doing a `nova image-create` results in a `qemu-img` command that does the following:

```bash
$ qemu-img convert -O raw rbd:vms/9714d823-b321-4393-afef-71f462bc0ab8_disk:id=cinder:conf=/etc/ceph/ceph.conf /var/lib/nova/instances/snapshots/tmpCWxM2V/6f2677ffcddc42259527ed39071f5143
```

So we are basically scanning the entire device and we copy block by block to a RAW file.
While doing this, the filesystem is not frozen so we are likely to miss some filesystem transaction.
Ending up playing the journal every single time we boot a new instance from that image.


| PROS                                                 | CONS  |
|------------------------------------------------------|-------|
| Fast no interaction with the VM only the block layer | Really Inconsistent, the filesystem doesn’t know
| Fast recovery (just run a new VM)                    | Can’t be done live (cinder backup driver limitation)
| OpenStack integration with cinder-backup             | Inconsistent recovery state
| Can be scheduled by Ops (dirty CRON)                 |
| Non-intrusive                                        |
| Incremental block backups (cinder backup)            |


## File level

Example: BackupPC.

| PROS                                                  | CONS  |
|-------------------------------------------------------|-------|
| Fine grained control (can restore a file)             | Requires backup agent
| Space efficient (dedup and hardlinks)                 | Consumes bandwidth


## Application level

Example: Database backup.

| PROS                                                  | CONS  |
|-------------------------------------------------------|-------|
| Triggered by freeze hook script from QEMU agent       | Need orchestration (can be complex with DBs and multi-master setups)
| Consistent (application wise)                         |
| Autonomous                                            |

<br />

Ideally we will be using all the methods to bring the best backup experience.
So we will take best of each world.
We use block device backups because recovering an entire block is fast.
File based backup are important to restore a single file.
Application backups are vital while recovery from a large failure with the last dump.

<br />
<br />

# Backups

## What is NOT backup?

Common OpenStack functionality can be considered as backup but they are **not**.
Features like Nova snapshots and Cinder snapshots must not be understood as backup since they are usually store in the storage entity.
This is especially true for Ceph but false for default backend implementations (Filesystem for Glance and LVM snapshot for Cinder).
Snapshots are simply point in time images, same goes for Cinder but for data, you don't really want to treat your data like this.
So they should be more considered once again as based images with non-critical attributes (only packages and configuration).

## What is backup?

Everything that can be stored outside the main storage entity.
This means other servers potentially in other locations too.
First of all, it is crucial to understand the different backup methods available in OpenStack.

Wait... We don't have many options, in fact we only have one and since we only need to backup Cinder block data this one is enough.
It is provided by cinder-backup.
It has two backends to backup to: Ceph and Swift.
Obviously we will be using the Ceph one since the Ceph integration has been optimised to work with it.

## Cinder backup to the rescue!

The title says everything, **critical data must be placed on Cinder block devices**.
Once again this is a well know best practice from the Cloud world and public Cloud providers encourage this (Amazon with EBS).
So now, we know that **only** block devices attached and provided by Cinder should be backed up.

The way cinder backup works is fairly simple.
You just need to pick up one of your volume and then assign it as a source for your backup.
Havana brought the support of Ceph as a backend for Cinder backup.
Basically, the driver allows us to backup:

* within the same Ceph pool (not recommended since it's the same storage zone)
* backup between different Ceph pools (fine since this will be a different zone)
* backup between different clusters (for disaster recovery purpose, backup from datacenter 1 to datacenter 2)

The really good thing of this backend is that it brings a feature that was under discussion a couple of summit ago: the support of an incremental backup API.
Yes yes, if you perform a backup from a Ceph cluster to another, you get differential backups between the RBD images.
This is really cost-effective.
The backup driver also supports RBD stripes.

## Ideal backup scenario

Because some of the functions described are not implemented yet, you find what's missing in the next section:

1. Snapshot your Cinder volume. **implemented**
2. This triggers fs-freeze from the QEMU guest agent. **not implemented**
3. QEMU agent calls fs-freeze hook scripts, application is stopped and properly backed up. **only implemented via Nova snapshots**
4. Your snapshot is in a consistent state.
5. Backup your volume with Cinder backup.
6. Repeat steps 1,4 and 5 to get a new volume backup, this backup will be an incremental block one.

<br />
<br />

# Missing things and caveats

## What's missing?

We still lack of a proper support for Cinder snapshots with the QEMU guest agent.
Currently this only works for virtual machine root filesystem disks.
Also note that OpenStack doesn't call freeze and thaw automatically while performing Nova snapshot, this will land in Kilo.
Once this is done we only need the same for Cinder snapshots (this should be in Kilo too).

Live backup are not available, as mentioned earlier, you need to snapshot the volume and backup it.
However I believe that snapshotting and backuping make a lot of sense.
Some people might want to perform continuous live backups, even they don't get full consistency from it.
Moreover this workflow can't be automated nor scheduled, eventually this should be addressed by [Raksha](https://wiki.openstack.org/wiki/Raksha).

## Caveats

Assuming you are using Ceph to store Cinder volume and backup them to another cluster in another location, the bad new is this won't prevent you from corruption.
Indeed if something wrong occurs on the first cluster, the corruption will be replicated to the other cluster.

<br />
<br />

> This article is lengthy enough, I hope it was and will be useful.
If you haven't read it, I encourage you to read my [previous article](http://www.sebastien-han.fr/blog/2015/02/09/openstack-perform-consistent-snapshots-with-qemu-guest-agent/) about performing consistent snapshots in OpenStack.
As always comments and feedback are more than welcome.
