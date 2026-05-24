---
title: Deploy a Ceph MDS server
date: 2013-05-13 16:15:00
slug: deploy-a-ceph-mds-server
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Deploy a Ceph MDS server](/images/ceph-setup-mds.jpg)

How-to quickly deploy a MDS server.

<!--more-->

Assuming that `/var/lib/ceph/mds/mds` is the mds data point.

Edit `ceph.conf` and add a MDS section like so:

    [mds]
      mds data = /var/lib/ceph/mds/mds.$id
      keyring = /var/lib/ceph/mds/mds.$id/mds.$id.keyring

    [mds.0]
      host = {hostname}

Create the authentication key (**only if you use cephX**):

```bash
$ sudo mkdir /var/lib/ceph/mds/mds.0
$ sudo ceph auth get-or-create mds.0 mds 'allow ' osd 'allow *' mon 'allow rwx' > /var/lib/ceph/mds/mds.0/mds.0.keyring
```

Eventually start the service

```bash
$ sudo service ceph start mds.0
=== mds.0 ===
Starting Ceph mds.0 on ceph...
starting mds.0 at :/0
```

Check the status of the cluster:

```bash
$ ceph -s
   health HEALTH_OK
   monmap e3: 1 mons at {1=192.168.251.100:6790/0}, election epoch 1, quorum 0 1
   osdmap e318: 2 osds: 2 up, 2 in
    pgmap v8214: 280 pgs: 280 active+clean; 3818 MB data, 9545 MB used, 10432 MB / 19978 MB avail
   mdsmap e70: 1/1/1 up {0=0=up:active}
```

Note if you want to add more MDSs, they will appear like this:

```bash
$ ceph -s
   health HEALTH_OK
   monmap e3: 1 mons at {1=192.168.251.100:6790/0}, election epoch 1, quorum 0 1
   osdmap e318: 2 osds: 2 up, 2 in
    pgmap v8214: 280 pgs: 280 active+clean; 3818 MB data, 9545 MB used, 10432 MB / 19978 MB avail
   mdsmap e70: 1/1/1 up {0=0=up:active}, 1 up:standby
```

<br />

> Easy, isn't it? FYI filesystem metadata live in RADOS cluster. So MDS servers are quite ephemeral daemons. Don't be surprised if you don't find anything (expect the MDS key) inside the mds data directory.
