---
title: Ceph geo-replication (sort of)
date: 2013-01-28 20:09:00
slug: ceph-geo-replication-sort-of
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph geo-replication](/images/ceph-geo-replication.jpg)

It's fair to say that the geo-replication is one of the most requested feature by the community. This article is draft, a PoC about Ceph geo-replication.

**Disclaimer: yes this setup is tricky and I don't guarantee that this will work for you.**

<!--more-->

<br />

# I. The idea

The original idea came out from a discussion with a friend of mine Tomáš Šafranko. The problem was that wanted to deploy acccross two (really) close datacenters with very low latencies, but we got *only* 2 datacenters... Ceph monitors number has to be **uneven** in order to properly manage the membership. That's make the setup even harder, since there is no asynchronous mode at the moment, we just have to deal with this design. The ideal sceanario is to have 3 datacenters and each of them hosts one monitor, which means that your data are spread accross 3 datacenters as well. An another solution could be to store your data on 2 datacenters and use a VPS (close from your 2 DCs) as a monitor. Both scenarios were not possible, just because the VPS would have brought way more latencies. So we thought, thought and dug deeper and all of the sudden the Pacemaker idea came out. As far I'm concerned, I don't use Pacemaker to manage Ceph daemons, to be honest I'm a bit reluctant to use it. It's not that I don't trust it, it's just that I try to keep as much control as possible on my daemons. Moreover I'd liked to keep away the *Pacemakerized everything* syndrom. Beside of this, I have to admit that Pacemaker can be useful here as an *automatic restart solution* after a daemon crash for instance (this is the main purpose of current RAs). But let's be honest daemons don't crash for nothing, they just run and if they don't (crash) they probably have a good reason to behave like this (disk full or whatever). Basically if something goes wrong I prefer to act manually in this kind of situation, investigate and understand what happened. Anyway this can be a long debat and this is not the purpose of this introduction. Once again it's my own opinion, I like Pacemaker, I use it everyday, simply not for everything ;-).

The following drawing describes the Pacemaker idea, 2 monitors are fully actives on one location and a third one runs on one side of the cluster and then move back to the other DC if the latest fails. Sounds easy right?

<br />



                                                                ,-----------.
                                                                |  clients  |
                                                                `-----------'
                                                     ,---------.     |     ,---------.
                                                     | clients |     |     | clients |
                                                     `---------'     |     `---------'
                                                                \    |    /
                                                                 \ ,---. /
                                                                 ('     `)
                                                                (   WAN   )
                                                                 (.     ,)
                                                                 / `---' \
                                                                /         \
                                                     ,---------.           ,---------.
                                                     |  mon.0  |           |  mon.1  |
                                                     `---------'           `---------'
                                                          |                     |
                                                     ,---------.           ,---------.
                                                     |  osd.0  |           |  osd.1  |
                                                     `---------'           `---------'
                                                     |  osd.2  |           |  osd.3  |
                                                     `---------'           `---------'
                                                     |  osd.4  |           |  osd.5  |
                                                     `---------'           `---------'
                                                     |  .....  |           |  .....  |
                                                     `---------'           `---------'
                                                    Data Center 1         Data Center 2
                                                               \             /
                                                                \           /
                                                         ,-----------------------.
                                                         |     Floating mon.2    |
                                                         |     Active/Passive    |
                                                         |  Managed by Pacemaker |
                                                         `-----------------------'


<br />

# II. How-to

A bit of a technical overview:

* DRBD manages the Monitor data directory
* Pacemaker manages the Monitor daemon and his IP address

## II.1. DRBD setup

First install DRBD:

```bash
$ sudo apt-get install drbd-utils -y
```

```bash
$ sudo lvcreate vg00 -L 5G -n ceph-mon
Logical volume "ceph-mon" created

$ sudo mkfs.ext4 /dev/mapper/vg00-ceph--mon
...
...
```

DRBD resource configuration, create a new file in `/etc/drbd.d/mon.res` and append the following content:

    resource mon {
      device    /dev/drbd0;
      disk      /dev/mapper/vg00-ceph--mon;
      meta-disk internal;
      on floating-mon-01 {
        address   10.20.1.41:7790;
      }
      on floating-mon-02 {
        address   10.20.1.42:7790;
      }
    }


Check your configuration:

```bash
$ sudo drbdadm dump all
...
...
$ echo $?
0
```

Wipe off the content of the logical volume:

```bash
$ sudo dd if=/dev/zero of=/dev/mapper/vg00-ceph--mon bs=1M count=128
...
```

Bring up your resource:

```bash
$ sudo drbdadm -- --ignore-sanity-checks create-md mon
Writing meta data...
initializing activity log
NOT initialized bitmap
New drbd meta data block successfully created.
success
```

Activate the resource:

```bash
$ sudo modprobe drbd
$ sudo drbdadm up mon
```

Put one node as the primary:

```bash
$ sudo drbdadm -- --overwrite-data-of-peer primary mon
```

Now DRBD is syncing blocks, so simply wait until the sync is complete:

```bash
$ sudo cat /proc/drbd 
version: 8.3.11 (api:88/proto:86-96)
srcversion: 71955441799F513ACA6DA60 
 0: cs:SyncSource ro:Primary/Secondary ds:UpToDate/Inconsistent C r-----
    ns:69504 nr:0 dw:0 dr:70168 al:0 bm:4 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:5173180
    [>....................] sync'ed:  1.5% (5048/5116)Mfinish: 1:04:20 speed: 1,336 (1,284) K/sec
```

At the end you should have something like this:

    version: 8.3.11 (api:88/proto:86-96)
    srcversion: 71955441799F513ACA6DA60 
     0: cs:Connected ro:Primary/Secondary ds:UpToDate/UpToDate C r-----
        ns:5242684 nr:0 dw:0 dr:5243348 al:0 bm:320 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:0

Format your new device and perform a quick test:

```bash
$ sudo mkfs.ext4 /dev/drbd0
$ sudo mount /dev/drbd0 /mnt/
$ sudo drbd-overview 
  0:mon  Connected Primary/Secondary UpToDate/UpToDate C r----- /mnt ext4 5.0G 204M 4.6G 5% 
$ sudo umount /mnt
```

## II.2. Build the third monitor

Yes, for this we are about to build the third monitor from scratch:

```bash
$ sudo mkdir -p /srv/ceph/mon0
$ sudo mount /dev/drbd0 /srv/ceph/mon0
```

Retrieve the current monitor key from the cluster:

```bash
$ sudo ceph auth get mon. -o /tmp/monkey
exported keyring for mon.
```

Grab the current monitor map:

```bash
$ sudo ceph mon getmap -o /tmp/lamap
got latest monmap
```

Examine it (if you're curious):

```bash
$ sudo monmaptool --print /tmp/lamap
monmaptool: monmap file /tmp/lamap
epoch 6
fsid eb2efd30-64c7-4e8f-b2fd-81c2923e96cd
last_changed 2013-01-22 14:37:00.654689
created 2013-01-11 11:34:03.779220
0: 172.17.1.11:6789/0 mon.1
1: 172.17.1.12:6789/0 mon.2
```

Initialize the mon data directory:

```bash
$ sudo ceph-mon -i 0 --mkfs --monmap /tmp/lamap --keyring /tmp/monkey
...
...
```

Edit your `ceph.conf` on your `floating-mon-01` and add the third monitor:

    [mon.0]
        host = floating-mon-01
        mon addr = 172.17.1.100:6789

Eventually on `floating-mon-01`:

    [mon.0]
        host = floating-mon-02
        mon addr = 172.17.1.100:6789

For the other configuration files, the `host` flag doesn't really matter, it only matters for the node hosting the resource because this what the init script from ceph will read in the first place to manage the services. For the client, the only thing that matters is the IP address:

    [mon]
        mon data = /srv/ceph/mon$id
        mon osd down out interval = 60
    [mon.0]
        mon addr = 172.17.1.100:6789
    [mon.1]
        host = mon-02
        mon addr = 172.17.1.11:6789
    [mon.2]
        host = mon-03
        mon addr = 172.17.1.12:6789


## II.3. Pacemaker setup

First install Pacemaker:

```bash
$ sudo apt-get install pacemaker -y
```

Now log into the crm shell by typing `crm` within your current shell. Edit your cluster properties:

```bash
$ sudo crm configure edit
```

Put the following:

        stonith-enabled="false" \
        no-quorum-policy="ignore" \
        pe-warn-series-max="1000" \
        pe-input-series-max="1000" \
        pe-error-series-max="1000" \
        cluster-recheck-interval="5min"
rsc_defaults $id="rsc-options" \
        resource-stickiness="500"

### II.3.1. Cluster resources

DRBD resource:

```bash
primitive drbd_mon ocf:linbit:drbd \
        params drbd_resource="mon" \
        op start interval="0" timeout="90s" \
        op stop interval="0" timeout="180s" \
        op promote interval="0" timeout="180s" \
        op demote interval="0" timeout="180s" \
        op monitor interval="29s" role="Master" \
        op monitor interval="31s" role="Slave"
ms ms_drbd_mon drbd_mon \
        meta master-max="1" master-node-max="1" clone-max="2" clone-node-max="1" notify="true" target-role="Started"
colocation col_mon_on_drbd inf: g_ceph_mon ms_drbd_mon:Master
order ord_mon_after_drbd inf: ms_drbd_mon:promote g_ceph_mon:start
```

Filesystem resource:

```bash
primitive p_fs_mon ocf:heartbeat:Filesystem \
        params device="/dev/drbd/by-res/mon" directory="/srv/ceph/mon0" fstype="ext4" options="noatime,nodiratime" \
        op start interval="0" timeout="60s" \
        op stop interval="0" timeout="180s" \
        op monitor interval="60s" timeout="60s"
```

The monitor resource, note that the Ceph resource agent are a dependancie of the ceph package. You can easily find them in `/usr/lib/ocf/resource.d/ceph`:

```bash
primitive p_ceph_mon ocf:ceph:mon
    op start interval="0" timeout="60s" \
    op stop interval="0" timeout="180s" \
    op monitor interval="10s" timeout="30s"
```

Group all the resources together:

```bash
group g_ceph_mon p_fs_mon p_sym_mon_var p_sym_mon_etc p_vip_mon
```

### II.3.2. Final design

At the end, you should see:

    ============
    Last updated: Wed Jan 23 00:15:48 2013
    Last change: Wed Jan 23 00:15:48 2013 via cibadmin on floating-mon-01
    Stack: openais
    Current DC: floating-mon-01 - partition with quorum
    Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
    2 Nodes configured, 2 expected votes
    5 Resources configured.
    ============

    Online: [ floating-mon-01 floating-mon-02 ]

     Master/Slave Set: ms_drbd_mon [drbd_mon]
         Masters: [ floating-mon-01 ]
         Slaves: [ floating-mon-02 ]
     Resource Group: g_ceph_mon
         p_fs_mon   (ocf::heartbeat:Filesystem):    Started floating-mon-01
         p_vip_mon  (ocf::heartbeat:IPaddr2):       Started floating-mon-01
         p_ceph_mon (ocf::ceph:mon):        Started floating-mon-01


## II.4. CRUSH Map

The setup is the following:

* 2 Datacenter
* N OSDs, preferably an even number of OSDs on each location

Let say we want to end up with the following topolgy:

```bash
$ ceph osd tree
dumped osdmap tree epoch 621
# id    weight  type name   up/down reweight
-1  12  root default
-3  12      datacenter dc-1
-2  3           host ceph-01
0   1               osd.0   up  1
1   1               osd.1   up  1
-4  3           host ceph-02
2   1               osd.2   up  1
3   1               osd.3   up  1
-5            datacenter dc-2
-6  3           host ceph-03
4   1               osd.4   up  1
5   1               osd.5   up  1
-9  3           host ceph-04
5   1               osd.6   up  1
7   1               osd.7   up  1
```

Retrieve your CRUSH Map and fulfil it with all your hosts and locations:

```bash
$ ceph osd getcrushmap -o ma-crush-map
$ crushtool -d ma-crush-map -o ma-crush-map.txt
```

Your CRUSH Map:

    # begin crush map
    
    # devices
    device 0 osd.0
    device 1 osd.1
    device 2 osd.2
    device 3 osd.3
    device 3 osd.4
    device 3 osd.5
    device 3 osd.6
    device 3 osd.7
    
    # types
    type 0 osd
    type 1 host
    type 2 rack
    type 3 row
    type 4 room
    type 5 datacenter
    type 6 root
    
    # buckets
    host ceph-01 {
        id -2       # do not change unnecessarily
        # weight 2.000
        alg straw
        hash 0  # rjenkins1
        item osd.0 weight 1.000
        item osd.1 weight 1.000
    }
    host ceph-02 {
        id -4       # do not change unnecessarily
        # weight 2.000
        alg straw
        hash 0  # rjenkins1
        item osd.2 weight 1.000
        item osd.3 weight 1.000
    }
    host ceph-03 {
        id -6       # do not change unnecessarily
        # weight 2.000
        alg straw
        hash 0  # rjenkins1
        item osd.4 weight 1.000
        item osd.5 weight 1.000
    }   
    host ceph-04 {
        id -9       # do not change unnecessarily
        # weight 2.000
        alg straw
        hash 0  # rjenkins1
        item osd.6 weight 1.000
        item osd.7 weight 1.000
    } 
    datacenter dc-1 {
        id -3          # do not change unnecessarily
        # weight 2.000
        alg straw
        hash 0  # rjenkins1
        item ceph-01 weight 2.000
        item ceph-02 weight 2.000
    }
    datacenter dc-2 {
        id -5          # do not change unnecessarily
        # weight 2.000
        alg straw
        hash 0  # rjenkins1
        item ceph-03 weight 2.000
        item ceph-04 weight 2.000
    }
    
    # end crush map

<br />

### II.4.1 Add a bucket

Add a bucket for the DC:

    root default {
        id -1           # do not change unnecessarily
        # weight 4.000
        alg straw
        hash 0  # rjenkins1
        item dc-1 weight 2.000
        item dc-2 weight 2.000
    }

### II.4.2. Add a rule

Add a rule for the bucket nearly created:

    # rules
    rule dc {
        ruleset 0
        type replicated
        min_size 1
        max_size 10
        step take default
        step chooseleaf firstn 0 type datacenter
        step emit
    }

Eventually recompile and inject the new CRUSH map:

```bash
$ crushtool -c ma-crush-map.txt -o ma-nouvelle-crush-map
$ ceph osd setcrushmap -i ma-nouvelle-crush-map
```

Since we set the `rule dc` to `0`, every pool will by default use this one. Thus we don't to specify a `crush_ruleset` each time we create a pool :-).

<br />

# III. Break it!

In order to simulate a crash from one DC, the machines hosting the monitors on the active side (DC-1) have been shutdown, the resource migrated to DC-2. In the meantime a loop of `ceph -s` has been performed to check how long the interruption was.

    health HEALTH_OK
    monmap e7: 3 mons at {0=172.17.1.100:6789/0,1=172.17.1.11:6789/0,2=172.17.1.12:6789/0}, election epoch 16, quorum 0,1,2 0,1,2
    osdmap e142: 4 osds: 8 up, 8 in
    pgmap v20300: 1576 pgs: 1576 active+clean; 1300 MB data, 2776 MB used, 394 GB / 396 GB avail
    mdsmap e61: 1/1/1 up {0=0=up:active}
    
    real    0m0.011s
    user    0m0.004s
    sys 0m0.004s

    health HEALTH_WARN 1 mons down, quorum 0,2 0,1
    monmap e7: 3 mons at {0=172.17.1.100:6789/0,1=172.17.1.11:6789/0,2=172.17.1.12:6789/0}, election epoch 18, quorum 0,2 0,1
    osdmap e142: 8 osds: 8 up, 8 in
    pgmap v20300: 1576 pgs: 1576 active+clean; 1300 MB data, 2776 MB used, 394 GB / 396 GB avail
    mdsmap e61: 1/1/1 up {0=0=up:active}
    
    real    0m5.336s
    user    0m0.004s
    sys 0m0.004s
    
    health HEALTH_WARN 1 mons down, quorum 0,2 0,1
    monmap e7: 3 mons at {0=172.17.1.100:6789/0,1=172.17.1.11:6789/0,2=172.17.1.12:6789/0}, election epoch 18, quorum 0,2 0,1
    osdmap e142: 8 osds: 8 up, 8 in
    pgmap v20300: 1576 pgs: 1576 active+clean; 1300 MB data, 2776 MB used, 394 GB / 396 GB avail
    mdsmap e61: 1/1/1 up {0=0=up:active}
    
    real    0m0.011s
    user    0m0.000s
    sys 0m0.008s
    
    health HEALTH_WARN 1 mons down, quorum 0,2 0,1
    monmap e7: 3 mons at {0=172.17.1.100:6789/0,1=172.17.1.11:6789/0,2=172.17.1.12:6789/0}, election epoch 18, quorum 0,2 0,1
    osdmap e142: 8 osds: 8 up, 8 in
    pgmap v20300: 1576 pgs: 1576 active+clean; 1300 MB data, 2776 MB used, 394 GB / 396 GB avail
    mdsmap e61: 1/1/1 up {0=0=up:active}
    
    real    0m0.011s
    user    0m0.004s
    sys 0m0.004s

<br />

> As you can see results are quite encouraging since they showed around 5 seconds of downtime. Abiously this wasn't a real life scenario since no writes were running, even so I assume that these would have been delayed anyway. As a reminder **please** keep in mind that this setup was experimental, some of you might consider it. However it strongly recommend you to perform way more tests than I did. It was a first shot with a pretty encouraging outcome I believe. As always feel free to critic, comment and bring interesting discussions on the comments section. Of course such setup as a downside, notably on the directories that store monitor data, some files such the ones in `$mon_root/logm/` and `$mon_root/pgmap/` are actively changing, the failover might might lead to some weird issues... **So once again this needs to be heavily tested** ;-).
