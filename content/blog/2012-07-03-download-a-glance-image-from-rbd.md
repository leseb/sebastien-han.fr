---
title: Download a Glance image from RBD
date: 2012-07-03 14:41:00
slug: download-a-glance-image-from-rbd
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Quick tip.

If you want to download a glance image stored in a RBD backend.

<!--more-->

First choose the image you want to export:

```bash
$ nova image-list
+--------------------------------------+----------------------+--------+--------------------------------------+
|                  ID                  |         Name         | Status |                Server                |
+--------------------------------------+----------------------+--------+--------------------------------------+
| 60beab84-81a7-46d1-bb4a-19947937dfe3 | precise-ceph         | ACTIVE |                                      |
| e5d3c6dc-37b3-41e8-b375-987fe7935080 | cloud-pipe-template  | ACTIVE |                                      |
+--------------------------------------+----------------------+--------+--------------------------------------+
```

And export it with the following command:

```
$ rbd export --pool=images e5d3c6dc-37b3-41e8-b375-987fe7935080 cloud-pipe-template.img
writing 8388608 bytes at ofs 0
writing 8388608 bytes at ofs 8388608
writing 8388608 bytes at ofs 16777216
writing 8388608 bytes at ofs 25165824
writing 8388608 bytes at ofs 33554432
writing 8388608 bytes at ofs 67108864
writing 8388608 bytes at ofs 75497472
writing 8388608 bytes at ofs 83886080
writing 8388608 bytes at ofs 92274688
...
...
Exporting image: 100% complete...done.
```

Check your image size:

```bash
$ du -h cloud-pipe-template.img 
879M	cloud-pipe-template.img
```

Et voilà!
