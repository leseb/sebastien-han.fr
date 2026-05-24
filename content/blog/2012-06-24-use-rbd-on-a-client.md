---
title: Use RBD on a client
date: 2012-06-24 09:42:00
slug: use-rbd-on-a-client
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Quick tip on Ceph. The linux kernel RBD (rados block device) driver allows striping a linux block device over multiple distributed object store data objects. The libceph module takes care of that.

<!--more-->

**Warning: Don't use rbd kernel driver on the osd server. Perhaps it will freeze the rbd client and your osd server.**

```bash
$ sudo apt-get install ceph-common
$ sudo modprobe rbd
```

Starting with rbd:

```bash
$ lsmod rbd
rbd                    28158  1 
libceph               129934  2 rbd,ceph
$ rbd create share --size 4096
$ rbd ls
share
```

With Cephx:

```bash
$ ceph-authtool --print-key /etc/ceph/keyring.admin
AQDVGc5P0LXzJhAA5C019tbdrgypFNXUpG2cqQ==
$ sudo echo "172.17.1.4:6789,172.17.1.5:6789,172.17.1.7:6789 name=admin,secret=AQDVGc5P0LXzJhAA5C019tbdrgypFNXUpG2cqQ== rbd share" | sudo tee /sys/bus/rbd/add
```

Here `rbd` is the default pool and `share` is the name of my device. You can easily get more information about your device, it should identified with the name `0`:

```bash
$ ls /sys/bus/rbd/devices/0/
client_id  create_snap  current_snap  major  name  pool  power  refresh  size  subsystem  uevent

$ grep "" /sys/bus/rbd/devices/0/*
/sys/bus/rbd/devices/0/client_id:client5279
grep: /sys/bus/rbd/devices/0/create_snap: Permission denied
/sys/bus/rbd/devices/0/current_snap:-
/sys/bus/rbd/devices/0/major:251
/sys/bus/rbd/devices/0/name:share
/sys/bus/rbd/devices/0/pool:rbd
grep: /sys/bus/rbd/devices/0/refresh: Permission denied
/sys/bus/rbd/devices/0/size:4294967296
/sys/bus/rbd/devices/0/uevent:DEVTYPE=rbd
```

A `/dev/` device should have been generated, now format the devive and put a filesystem on it:

```bash
$ sudo mkfs.xfs /dev/rbd0 
$ sudo mount /dev/rbd0 /mnt/
$ df -h | grep rbd
/dev/rbd0                            4.0G   33M  4.0G   1% /mnt
```

Now you can use it as a simple device or put NFS on it.
 
**/!\ Warning: make sure that [this bug](https://github.com/ceph/ceph-client/commit/32eec68d2f233e8a6ae1cd326022f6862e2b9ce3) does not affect your Ceph version before trying to remove a RBD device.**


This article was a simple introduction to the RBD device. Since I don't want to paraphrase the Ceph wiki, if you need more information [consult it the official wiki](http://ceph.com/docs/master/rbd/rbd-ko/).
