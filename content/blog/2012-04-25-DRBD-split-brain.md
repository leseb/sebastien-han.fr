---
title: DRBD split-brain in Pacemaker
date: 2012-04-25 17:28:00
slug: DRBD-split-brain
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

Working with DRBD it's not always easy, espacially when you add extra layer like pacemaker to bring high-availability to your platform. I've recently been through a weird issue with my high fault tolerance pacemaker cluster which is composed of 3 resources:

* IPaddr2
* LSB nfs-kernel
* DRBD

<!--more-->

I didn't checked the status of my plaform since I was busy, big mistake. I noticed that my DRBD replication was broken. It was a little bit confusing because I didn't have any issue with my pacemaker cluster. The virtual was still reacheable as the NFS share was. Every resources was running fine like so:

    ============
    Last updated: Tue Apr 24 17:06:53 2012
    Stack: openais
    Current DC: ha-node01 - partition with quorum
    Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
    2 Nodes configured, 2 expected votes
    2 Resources configured.
    ============

    Online: [ ha-node01 ha-node02 ]

     Resource Group: HAServices
         vip1       (ocf::heartbeat:IPaddr2):       Started ha-node01
         fs_nfs     (ocf::heartbeat:Filesystem):    Started ha-node01
         nfs        (lsb:nfs-kernel-server):        Started ha-node01
     Master/Slave Set: ms_drbd_nfs
         Masters: [ ha-node01 ]
         Slaves: [ ha-node02 ]

But when I tried to put my first node on `standby` to check the failover, things started getting bad:

    ============
    Last updated: Tue Apr 24 17:06:29 2012
    Stack: openais
    Current DC: ha-node01 - partition with quorum
    Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
    2 Nodes configured, 2 expected votes
    2 Resources configured.
    ============

    Node ha-node01: standby
    Online: [ ha-node02 ]

     Resource Group: HAServices
         vip1       (ocf::heartbeat:IPaddr2):       Started ha-node01
         fs_nfs     (ocf::heartbeat:Filesystem):    Stopped
         nfs        (lsb:nfs-kernel-server):        Stopped
     Master/Slave Set: ms_drbd_nfs
         Slaves: [ ha-node02 ha-node01 ]

Things became worst when I tried to manipulate DRBD while running Pacemaker:

    ============
    Last updated: Tue Apr 24 16:29:23 2012
    Stack: openais
    Current DC: ha-node01 - partition with quorum
    Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
    2 Nodes configured, 2 expected votes
    2 Resources configured.
    ============

    Online: [ ha-node01 ha-node02 ]

     Resource Group: HAServices
         vip1       (ocf::heartbeat:IPaddr2):       Started ha-node01
         fs_nfs     (ocf::heartbeat:Filesystem):    Stopped
         nfs        (lsb:nfs-kernel-server):        Stopped
     Master/Slave Set: ms_drbd_nfs
         drbd_nfs:0 (ocf::linbit:drbd):     Slave ha-node02 (unmanaged) FAILED
         drbd_nfs:1 (ocf::linbit:drbd):     Slave ha-node01 (unmanaged) FAILED

    Failed actions:
        drbd_nfs:1_demote_0 (node=ha-node01, call=68, rc=5, status=complete): not installed
        drbd_nfs:1_stop_0 (node=ha-node01, call=74, rc=5, status=complete): not installed
        fs_nfs_start_0 (node=ha-node02, call=33, rc=1, status=complete): unknown error
        drbd_nfs:0_monitor_15000 (node=ha-node02, call=45, rc=5, status=complete): not installed
        drbd_nfs:0_stop_0 (node=ha-node02, call=50, rc=5, status=complete): not installed

I started to be worried since the production deadline was coming very fast. I decided to look the state of my DRBD replication:

On the first node:

```bash
$ sudo cat /proc/drbd 
version: 8.3.7 (api:88/proto:86-91)
srcversion: EE47D8BF18AC166BE219757 
 0: cs:WFConnection ro:Primary/Unknown ds:UpToDate/DUnknown C r----
    ns:0 nr:0 dw:0 dr:200 al:0 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:b oos:239648
```

It seems that the resource tried to reach the second node but on the other one, the replication state was pretty bad:

    0: cs:StandAlone ro:Secondary/Unknown ds:Outdated/DUnknown   r----

I also checked the log:

    ha-node01 kernel: [526233.249739] block drbd0: helper command: /sbin/drbdadm split-brain minor-0
    ha-node-01 kernel: [526233.251425] block drbd0: helper command: /sbin/drbdadm split-brain minor-0 exit code 0 (0x0)
    ha-node01 kernel: [546110.634709] block drbd0: Split-Brain detected, dropping connection!

I was cleary in a split-brain situation and DRBD messed up my entire cluster. Since I didn't wanted to wipe off everything, I procided step by step and first stopped the corosync daemon on each node. Hopefully this situation is well known by DRBD and [documented](http://www.drbd.org/users-guide/s-resolve-split-brain.html), so I carefully followed the steps on the first node. But remember that Pacemaker is managing our DRBD resources so you have to stop it before trying to recover your cluster.

```bash
ha-node-02 ~ $ sudo service corosync stop
Stopping corosync daemon: corosync.
ha-node-02 ~ $ sudo drbdadm disconnect r0
ha-node-02 ~ $ sudo cat /proc/drbd 
 version: 8.3.7 (api:88/proto:86-91)
  srcversion: EE47D8BF18AC166BE219757 
    0: cs:Unconfigure

ha-node-01 ~ $ sudo service corosync stop
Stopping corosync daemon: corosync.
ha-node-01 ~ $ sudo drbdadm secondary r0
ha-node-01 ~ $ sudo cat /proc/drbd 
version: 8.3.7 (api:88/proto:86-91)
srcversion: EE47D8BF18AC166BE219757 
 0: cs:Unconfigured
ha-node-01 ~ $ sudo drbdadm -- --discard-my-data connect r0
ha-node-01 ~ $ sudo cat /proc/drbd 
version: 8.3.7 (api:88/proto:86-91)
srcversion: EE47D8BF18AC166BE219757 
 0: cs:WFConnection ro:Secondary/Unknown ds:Diskless/DUnknown C r----
   ns:0 nr:0 dw:0 dr:0 al:0 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:b oos:0
ha-node-01 ~ $ sudo service corosync start
Starting corosync daemon: corosync.
ha-node-01 ~ $ sudo service corosync restart 
Restarting corosync daemon: corosync.
```

After this, my DRBD replication was completely recovered:

```bash
ha-node-01 ~ $ sudo cat /proc/drbd 
version: 8.3.7 (api:88/proto:86-91)
srcversion: EE47D8BF18AC166BE219757 
0: cs:Connected ro:Secondary/Primary ds:UpToDate/UpToDate C r----
   ns:0 nr:0 dw:0 dr:0 al:0 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:b oos:0
```

I just restarted my corosync daemon and things backed to normal. Now I don't have any problems when I test my failover.

    ============
    Last updated: Tue Apr 24 17:05:54 2012
    Stack: openais
    Current DC: ha-node01 - partition with quorum
    Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
    2 Nodes configured, 2 expected votes
    2 Resources configured.
    ============

    Online: [ ha-node01 ha-node02 ]

     Resource Group: HAServices
         vip1       (ocf::heartbeat:IPaddr2):       Started ha-node02
         fs_nfs     (ocf::heartbeat:Filesystem):    Started ha-node02
         nfs        (lsb:nfs-kernel-server):        Started ha-node02
     Master/Slave Set: ms_drbd_nfs
         Masters: [ ha-node02 ]
         Slaves: [ ha-node01 ]

```bash
ha-node-01 ~ $ sudo crm node standby ha-node-02
```

    ============
    Last updated: Thu Apr 26 10:57:30 2012
    Stack: openais
    Current DC: saw-back-02 - partition with quorum
    Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
    2 Nodes configured, 2 expected votes
    2 Resources configured.
    ============

    Node ha-node-02: standby
    Online: [ ha-node-01 ]

     Resource Group: HAServices
         vip1       (ocf::heartbeat:IPaddr2):       Started ha-node-01
         fs_nfs     (ocf::heartbeat:Filesystem):    Started ha-node-01
         nfs        (lsb:nfs-kernel-server):        Started ha-node-01
     Master/Slave Set: ms_drbd_nfs
         Masters: [ ha-node-01 ]
         Stopped: [ drbd_nfs:0 ]

The logs can also confirm:

    kernel: [546691.539227] block drbd0: Split-Brain detected, manually solved. Sync from this node

Problem solved! And data saved!
