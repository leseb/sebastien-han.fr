---
title: "Ceph Jewel Preview: map RBD devices on NBD"
date: 2016-04-04 14:31:00
slug: ceph-jewel-preview-map-rbd-devices-on-nbd
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph Jewel Preview: map RBD devices on NBD](/images/ceph-jewel-rbd-ndb.jpg)

Another feature preview for Jewel.
NBD driver for RBD that allows librbd to present a kernel-level block device

<!--more-->

NBD has numerous advantages compare to the Kernel RBD drivers:

* RBD-KO developement and features have to go through the stable Kernel
* RBD-KO is catching up on librbd developement which takes time and effort
* NDB has been well integrated into the Kernel for many years and is part of most of nowadays kernels

The idea of rbd-nbd is to rely on the userspace implementation of librbd which is robust and stable by using the strong and well established NBD (Network Block Device) kernel module.

It is pretty simple to map a device with NDB:

```bash
$ sudo apt-get install -y rbd-nbd
$ sudo rbd create leseb -s 10G
$ sudo rbd-nbd map rbd/leseb
/dev/nbd0

$ sudo rbd-nbd list-mapped
/dev/nbd0
```

<br />

> TADA!
