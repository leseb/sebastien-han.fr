---
title: "Ceph Jewel Preview: Ceph RBD mirroring"
date: 2016-03-28 10:43:00
slug: ceph-jewel-preview-ceph-rbd-mirroring
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph RBD mirroring](/images/ceph-rbd-mirroring.jpg)

The RBD mirroring feature will be available for the next stable Ceph release: Jewel.

<!--more-->

<br />

## I. Rationale

What we are trying to solve here or at least overcome is the default nature of Ceph being synchronous.
This implies that the Ceph block storage solution (called RBD) has trouble working decently over regions.
As a reminder, Ceph will only consider a write as complete when **all the replicas** of an object are written.
That's why setting up a stretched cluster across long distance is not generally a good idea since latencies are generally high.
The cluster would have to wait until all the writes are completed, it might take a considerable amount of time for the client to get its acknowledgement.

As a result, we need a mechanism that will allow us to replicated block devices between clusters stored in different regions.
Such method will help us for different purposes:

* Disaster recovery
* Global block device distribution

<br />

## II. Under the hood

![Ceph RBD mirror](/images/ceph-rbd-mirror.png)

### II.1. A new daemon

A new daemon: `rbd-mirror` will be responsible for synchronising images from one cluster to another.
The daemon will be configured on both sites and it will simultaneously connect to both local and remote clusters.
Primarily, with the Jewel release, there will be a one to one relationship between daemons where in the future this will expend to one to N.
So after Jewel, you will have the ability to configure one site with multiple backup target sites.

As a starting point, it will connect to the other Ceph cluster using a configuration file (to find the monitors), a user and a key.
Using the admin user for this is just fine.
The `rbd-mirror` daemons uses the cephx mechanism to authenticate with the monitors, usual and default method within Ceph.

In order to know each other, each daemon will have to register the other one, more precisely the other cluster.
This is set at the pool level with the command: `rbd mirror pool peer add`.
Peers info can be retrieved like so:

```bash
$ rbd mirror pool info
Enabled: true
Peers:
  UUID                                 NAME        CLIENT
    786b42ea-97eb-4b16-95f4-867f02b67289 ceph-remote client.admin
```

Later the UUID can be used to remove a peer if needed.

<br />

### II.2. The mirroring

![Ceph RBD mirror inside](/images/ceph-rbd-mirror-inside.png)

The RBD mirroring relies on two new RBD image features:

* journaling: enables journaling for every transaction on the image
* mirroring: which explicitly tells the `rbd-mirror` daemon to replicate this image

There will also be commands and librbd calls to enable/disable mirroring for individual images.
The journal maintains a list of record for all the transactions on the image.
It can be seen as another RBD image (a bunch of RADOS objects) that will live in the cluster.
In general, a write would first go to the journal, return to the client, and then be written to the underlying rbd image.
For performance reasons, this journal can sit on different pool from the image it is doing its journaling.
Currently there is one per journal per RBD image.
This will likely stay like this until we introduce consistency groups in Ceph.
For those of you who are not familiar with the concept, a consistency group is an entity that manages a bunch of volumes (ie: RBD images) where they can be treated as one.
This allows you to perform operations like snapshots on all the volumes present in the group.
With consistency groups you get the guarantee that all the volumes are in the same consistent state.
So when consistency groups will be available in Ceph we will use a single journal for all the RBD images part of this group.

So now, I know some of you are already thinking about this: "can I enable journaling on an existing image?"
Yes you can!
Ceph will simply take a snapshot of your image, do a RBD copy of the snapshot and will start journaling after that.
It is just a background task.

The mirroring can be enabled and disabled on an entire pool or per image basis.
If it enabled on a pool every images that have a journaling feature enabled will get replicated by the mirror agent.
This can be enabled with the command: `rbd mirror pool enable`.

To configure an image you can run the following:

```bash
$ rbd create rbd/leseb --image-feature exclusive-lock,journaling
```

The features can be activated on the fly using `rbd feature enable rbd/leseb exclusive-lock && rbd feature enable rbd/leseb journaling`

<br />

## III. Disaster recovery

Doing cross-sync replication is possible and it is even the default way it is implemented.
This means that **pools names across both locations must be the same**.
Thus images will get the exact same name on other cluster, this brings two challenges:

1. Using the same pool for your active data and backup (from the other site) can impact your performance
2. However, having the exact same pool name is definitely easier when performing a recovery. From an OpenStack perspective, you just need to populate database records with the volume ID.

Each image has a `mirroring_directory` object that contains tag about the location of the active site.
The images on the local site are promoted 'primary' (with `rbd mirror image promote`) and is writable where the backup images on the remote site hold a lock.
The lock means that this image can **not** be written (read-only mode) until it is promoted as primary and the primary demoted (with `rbd mirror image demote`).
So this is where the promotion and demotion functionnality comes in.
As soon as the backup image gets promoted primary, the original image will be promoted as secondary.
This means the synchronisation will happen on the other way (the backup location becomes primary and performs the synchronisation to the secondary site that was originally primary).

If the platform is affected by a split-brain situation, the `rbd-mirror` daemon will not attempt any sync, so you will have to find the good image by yourself.
Meaning you will have to manually force a resync from what you consider being the most up to date image. For this you can run `rbd mirror image resync`.

<br />

## IV. OpenStack implementation

For now, the mirroring feature requires running both environment on the same L2 segment.
So clusters can reach each others.
Later, a new daemon could be implemented, it might be called `mirroring-proxy`.
It will be responsible for relaying mirroring requests.
Here again, we will face two new challenges:

1. Using a relay mechanism with the help of a daemon will allow us to only expose this daemon to the outside world
2. Where using a daemon will likely create more contention

So, it is a bit of a balance between security and performance.

In terms of implementation, the daemon will likely require a dedicated server to operate as it needs a lot of bandwidth.
So a server with multiple network cards is ideal.
Unfortunately, the initial version of the rbd-mirroring daemon **will not have any high availability**.
The daemon will only be able to run once.
So when it comes to high availability of this daemons, the ability to run it multiple times on different servers in order to provide HA and offload will likely appear in a later Jewel release.

The RBD mirroring is extremely useful while trying to implement a disaster recovery scenario for OpenStack, here is a design example:

![OpenStack Multi-site with Ceph](/images/openstack-multisite-ceph-no-regions.png)


<br />

> If you want to learn more about RBD mirroring design, you can read [Josh Durgin's design draft discussion](http://www.spinics.net/lists/ceph-devel/msg24169.html) and the [pad from the Ceph Online Summit](http://pad.ceph.com/p/rbd_mirror_daemon).
