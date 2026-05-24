---
title: Respawn a pacemaker cluster
date: 2012-04-26 12:03:00
slug: respawn-a-pacemaker-cluster
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

Issue type: pacemaker nfs/drbd cluster

* 6 posts all around the web
  * 2 deviant from my configuration
  * the rest.. **no answer**.

Seems legit.

<!--more-->

## My pacemaker setup

Architecture:

* 2 nodes
* pacemaker active/passive

```
# crm configure show
node ha-node01 \
	attributes standby="off"
node ha-node02 \
	attributes standby="on"
primitive drbd_nfs ocf:linbit:drbd \
	params drbd_resource="r0" \
	op monitor interval="15s"
primitive fs_nfs ocf:heartbeat:Filesystem \
	params device="/dev/drbd0" directory="/mnt/data/magento" fstype="ext3" \
	op start interval="0" timeout="60" \
	op stop interval="0" timeout="120"
primitive nfs lsb:nfs-kernel-server \
	op monitor interval="5s" \
	meta target-role="Started"
primitive vip1 ocf:heartbeat:IPaddr2 \
	params ip="172.18.34.63" nic="bond1.1034" \
	op monitor interval="5s"
group HAServices vip1 fs_nfs nfs \
	meta target-role="Started"
ms ms_drbd_nfs drbd_nfs \
	meta master-max="1" master-node-max="1" clone-max="2" clone-node-max="1" notify="true"
colocation ms-drbd-nfs-with-haservices inf: ms_drbd_nfs:Master HAServices
order fs-nfs-before-nfs inf: fs_nfs:start nfs:start
order ip-before-ms-drbd-nfs inf: vip1:start ms_drbd_nfs:promote
order ms-drbd-nfs-before-fs-nfs inf: ms_drbd_nfs:promote fs_nfs:start
property $id="cib-bootstrap-options" \
	dc-version="1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b" \
	cluster-infrastructure="openais" \
	expected-quorum-votes="2" \
	stonith-enabled="false" \
	no-quorum-policy="ignore" \
rsc_defaults $id="rsc-options" \
	resource-stickiness="100"
```

## General cluster status

Cluster status, the resource is running on the second node

```
============
Last updated: Wed Apr 25 11:40:11 2012
Stack: openais
Current DC: ha-node02 - partition with quorum
Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
2 Nodes configured, 2 expected votes
2 Resources configured.
============

Node ha-node02: standby
Online: [ ha-node01 ]

 Resource Group: HAServices
     vip1       (ocf::heartbeat:IPaddr2):       Started ha-node02
     fs_nfs     (ocf::heartbeat:Filesystem):    Started ha-node02
     nfs        (lsb:nfs-kernel-server):        Started ha-node02
 Master/Slave Set: ms_drbd_nfs
     Masters: [ ha-node02 ]
     Slaves: [ ha-node01 ]
```

When I tried to put the node which hold the resource in standby mode, things goes wrong

```
# crm node standby ha-node02
============
Last updated: Wed Apr 25 11:40:12 2012
Stack: openais
Current DC: ha-node02 - partition with quorum
Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
2 Nodes configured, 2 expected votes
2 Resources configured.
============

Node ha-node02: standby
Online: [ ha-node01 ]

 Resource Group: HAServices
     vip1       (ocf::heartbeat:IPaddr2):       Started ha-node01
     fs_nfs     (ocf::heartbeat:Filesystem):    Stopped
     nfs        (lsb:nfs-kernel-server):        Stopped
 Master/Slave Set: ms_drbd_nfs
     Slaves: [ ha-node01 ]
     Stopped: [ drbd_nfs:0 ]

Failed actions:
    fs_nfs_start_0 (node=ha-node01, call=14, rc=1, status=complete): unknown error
```

##What the logs said?

Corosync log:

```
ha-node02 lrmd: [23026]: WARN: For LSB init script, no additional parameters are needed.
ha-node02 pengine: [14834]: WARN: unpack_rsc_op: Processing failed op fs_nfs_start_0 on ha-node01: unknown error (1)
ha-node02 pengine: [14834]: WARN: common_apply_stickiness: Forcing fs_nfs away from ha-node01 after 1000000 failures (max=1000000)
```

##Solution: clean your resource!

Simply run this command and your cluster will go back to life. In my setup the incrimited resource is `fs_nfs`, so I ran:

```
crm resource cleanup fs_nfs
```
Extract from the cluster lab documentation:

>Cleanup resource status. Typically done after the resource has temporarily failed. If a node is omitted, cleanup on all nodes. If there are many nodes, the command may take a while.

Never give up!
