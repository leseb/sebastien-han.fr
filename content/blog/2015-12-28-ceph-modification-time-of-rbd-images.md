---
title: "Ceph: Modification Time of RBD Images"
date: 2015-12-28 15:27:00
slug: ceph-modification-time-of-rbd-images
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: Modification Time of RBD Images](/images/ceph-rbd-mtime.gif)

Get the modification time of a RBD image.

<!--more-->

Each RADOS object does maintain a `mtime` that you can get via the RADOS tool.

```bash
$ sudo rbd create leseb -s 10240
$ sudo rbd info leseb
$ sudo rbd map leseb
/dev/rbd1
$ sudo mkfs.xfs /dev/rbd1
log stripe unit (4194304 bytes) is too large (maximum is 256KiB)
log stripe unit adjusted to 32KiB
meta-data=/dev/rbd1              isize=256    agcount=17, agsize=162816 blks
         =                       sectsz=512   attr=2, projid32bit=0
data     =                       bsize=4096   blocks=2621440, imaxpct=25
         =                       sunit=1024   swidth=1024 blks
naming   =version 2              bsize=4096   ascii-ci=0
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=8 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
$ sudo mount /dev/rbd1 /mnt
```

Now check the image properties, we are looking here for the `block_name_prefix` in order to identify the objects in RADOS:

```bash
$ sudo rbd info leseb
rbd image 'leseb':
        size 10240 MB in 2560 objects
        order 22 (4096 kB objects)
        block_name_prefix: rb.0.3b19.74b0dc51
        format: 1
```

Ok so this gives us: `rb.0.3b19.74b0dc51`.
Given that most of the filesystem structure is built from the start of the device we do not need to bother looking around for all the filesystem block.
The first block is enough, in a RADOS naming it is easy to find out that the first block will be named: `rbd/rb.0.3b19.74b0dc51.000000000000`.

Now let's look at the properties of that object:

```bash
$ sudo rados -p rbd stat rb.0.3b19.74b0dc51.000000000000
rbd/rb.0.3b19.74b0dc51.000000000000 mtime 2015-12-21 23:08:57.000000, size 131072
```

And oh suprise! This gives us the `mtime` of this object.
So basically everytime there is an operation on the filesystem 


For a block based application, this a bit more tricky because we do not know which blocks will be accessed.
So we have to go through all the objects and sort their `mtime`...

<br />

> ZA WARUDO! TOKI YO TOMARE!
