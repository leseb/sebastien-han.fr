---
title: NFS over RBD
date: 2012-07-06 23:08:00
slug: nfs-over-rbd
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![NFS on RBD](/images/NFS-RBD.png)

Since CephFS is not most mature component in Ceph, you won't consider to use it on a production platform. In this article, I offer a possible solution to expose RBD to a shared filesystem.

<!--more-->

#I. Architecture

My choice was turned to NFS for a couple of reasons:

* Old but reliable
* Easy to setup
* Existing RA: exportfs and good support for the LSB agent

Overview of the infrastructure. For my own setup, I needed to map and export several pools. For examples you could have one pool for the customers data and one pool for storing your VMs (`/var/lib/nova/instances`). It's up to you.

![NFS over RBD Schéma](/images/NFS-RBD-schema.jpg)

<br />

#II. Prerequisites

Install Ceph client packages and the NFS server, this needs to be performed on **every nodes**:

```bash
$ sudo apt-get install ceph-common nfs-server -y
$ sudo echo "manual" > /etc/init/nfs-kernel-server.override
```

Nothing more, no `modprobe rbd`, nothing. Pacemaker will manage that for us :)

Create your RBD volumes:

```bash
$ rbd create share1 --size 2048
$ rbd create share2 --size 2048
```

You will need to map it somewhere in order to put a filesystem on it:

```bash
$ sudo modprobe rbd
$ sudo echo "172.17.1.4:6789,172.17.1.5:6789,172.17.1.7:6789 name=admin,secret=AQDVGc5P0LXzJhAA5C019tbdrgypFNXUpG2cqQ== rbd share1" > sudo tee /sys/bus/rbd/add
$ sudo mkfs.xfs /dev/rbd0
$ rbd unmap /dev/rbd0
```

And so on for `share2`.

In order to manage our RBD device we are going to use the RA written by Florian Haas for Ceph which map RBD device. You can have a look at it in the [Ceph Github](https://github.com/ceph/ceph/blob/master/src/ocf/rbd.in). Integrate the RA to Pacemaker:

```bash
$ sudo mkdir /usr/lib/ocf/resource.d/ceph
$ cd /usr/lib/ocf/resource.d/ceph/
$ wget https://raw.github.com/ceph/ceph/master/src/ocf/rbd.in
$ chmod +x rbd.in
```

Minor change to the resource agent. According to the [official OCF documentation](http://www.linux-ha.org/doc/dev-guides/_convenience_functions.html).

{{< gist leseb 3036311 >}}

The pull request is [waiting here](https://github.com/leseb/ceph/commit/3ab34c2e049570177c07b3563f55209590e48de1).
<br />

#III. Setup

##III.1. Common

This initial setup only containts 2 nodes so you need to setup Pacemaker according to this number.

```bash
$ sudo crm configure property stonith-enabled=false
$ sudo crm configure property no-quorum-policy=ignore
```

Of course if you plan to expand your active/active with a third node, you must unset the `no-quorum-policy`.

##III.2. Primitives

In order to make things really clear I will setup the primitive from *the bottom layer to the top*, something like:

1. Map the RBD device
2. Mount it!
3. Export it!
4. Reach it with the virtual IP address
5. Setup the NFS server

Note: for more comprehension and clarity I always name:

* the primitive with a `p_` prefix
* the group with a `g_` prefix
* the location rule with a `l_`
* and so on for every parameters

All the operation needs to be performed within the `crm` shell or simply `sudo crm configure` before every commands below. You can also do `sudo crm configure edit` and copy/paste.

First, map RBD:

```bash
primitive p_rbd_map_1 ocf:ceph:rbd.in \
        params user="admin" pool="rbd" name="share1" cephconf="/etc/ceph/ceph.conf" \
        op monitor interval="10s" timeout="20s"

primitive p_rbd_map_2 ocf:ceph:rbd.in \
        params user="admin" pool="rbd" name="share2" cephconf="/etc/ceph/ceph.conf" \
        op monitor interval="10s" timeout="20s"
```

Second, filesystem: 

```bash
primitive p_fs_rbd_1 ocf:heartbeat:Filesystem \
        params directory="/mnt/share1" fstype="xfs" device="/dev/rbd/rbd/share1" fast_stop="no" \
        op monitor interval="20s" timeout="40s" \
        op start interval="0" timeout="60s" \
        op stop interval="0" timeout="60s"

primitive p_fs_rbd_2 ocf:heartbeat:Filesystem \
        params directory="/mnt/share2" fstype="xfs" device="/dev/rbd/rbd/share2" fast_stop="no" \
        op monitor interval="20s" timeout="40s" \
        op start interval="0" timeout="60s" \
        op stop interval="0" timeout="60s"
```

Third, export directories:

```bash
primitive p_export_rbd_1 ocf:heartbeat:exportfs \
	params directory="/mnt/share1" clientspec="192.168.146.0/24" options="rw,async,no_subtree_check,no_root_squash" fsid="1" \
	op monitor interval="10s" timeout="20s" \
	op start interval="0" timeout="40s"

primitive p_export_rbd_2 ocf:heartbeat:exportfs \
	params directory="/mnt/share2" clientspec="192.168.146.0/24" options="rw,async,no_subtree_check,no_root_squash" fsid="2" \
	op monitor interval="10s" timeout="20s" \
	op start interval="0" timeout="40s"
```

Fourth, virtual IP addresses:

```bash
primitive p_vip_1 ocf:heartbeat:IPaddr \
        params ip="192.168.146.245" cidr_netmask="24" \
        op monitor interval="5"

primitive p_vip_2 ocf:heartbeat:IPaddr \
        params ip="192.168.146.246" cidr_netmask="24" \
        op monitor interval="5"
```

Fith, NFS server:

```bash
primitive p_nfs_server lsb:nfs-kernel-server \
	op monitor interval="10s" timeout="30s"

primitive p_rpcbind upstart:rpcbind \
	op monitor interval="10s" timeout="30s"
```

##III.3. Resources group and clone

Groups contain a set of resources that need to be located together, started sequentially and stopped in the reverse order. You need to create a group of resource for each NFS shared first and also for all the NFS dependencies services:

```bash
group g_rbd_share_1 p_rbd_map_1 p_fs_rbd_1 p_export_rbd_1 p_vip_1
group g_rbd_share_2 p_rbd_map_2 p_fs_rbd_2 p_export_rbd_2 p_vip_2
group g_nfs p_rpcbind p_nfs_server
```

Clones are resources that can be active on multiple hosts. We have to clone the NFS server, it will act as active/active. It means that the NFS daemon will be running/active on **both** nodes.

```bash
clone clo_nfs g_nfs \
	meta globally-unique="false" target-role="Started"
```

##III.4. Location rules

In this setup, each export must run on a specific server, **always**. The resource will always remain in its current location unless forced off because the node is no longer eligible to run the resource. These 2 contraints define a **Score** to determine the location relationship between both resources. Positive values indicate the resources should run on the same node. Setting the score to INFINITY forces the resources to run on the same node.

```bash
location l_g_rbd_share_1 g_rbd_share_1 inf: nfs1
location l_g_rbd_share_2 g_rbd_share_2 inf: nfs2
```

<br />

At the end, you should see something like this:

```bash
$ sudo crm_mon -1
============
Last updated: Mon Jul  2 07:19:40 2012
Last change: Mon Jul  2 04:07:15 2012 via crm_attribute on nfs1
Stack: openais
Current DC: nfs2 - partition with quorum
Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
2 Nodes configured, 2 expected votes
14 Resources configured.
============

Online: [ nfs1 nfs2 ]

 Resource Group: g_rbd_share_1
     p_rbd_map_1        (ocf::heartbeat:rbd.in):        Started nfs1
     p_fs_rbd_1 (ocf::heartbeat:Filesystem):    Started nfs1
     p_export_rbd_1     (ocf::heartbeat:exportfs):      Started nfs1
     p_vip_1    (ocf::heartbeat:IPaddr):        Started nfs1
 Resource Group: g_rbd_share_2
     p_rbd_map_2        (ocf::heartbeat:rbd.in):        Started nfs2
     p_fs_rbd_2 (ocf::heartbeat:Filesystem):    Started nfs2
     p_export_rbd_2     (ocf::heartbeat:exportfs):      Started nfs2
     p_vip_2    (ocf::heartbeat:IPaddr):        Started nfs2
 Clone Set: clo_nfs [g_nfs]
     Started: [ nfs1 nfs2 ]
```

<br />

>Conclusion: here we have a scalable architecture, we can add as many NFS server (clone)  as we need. This will expand the active/active mode. That was only one use case. You don't necessary need active/active mode. An active/passive mode should be enough if you only need to map one RBD volume.

