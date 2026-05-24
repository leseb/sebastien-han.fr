---
title: "Ceph: monitor store taking up a lot of space"
date: 2014-10-27 15:31:00
slug: ceph-mon-store-taking-up-a-lot-of-space
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph monitor store taking up a lot of space](/images/ceph-big-lvldb-ssts.jpg)

During some strange circonstances, the levelDB monitor store can start taking up a substancial amount of space.
Let quickly see how we can workaround that.

<!--more-->

The result is basically overgrown SSTS file from levelDB.
SST stands for Sorted String Table, which means that these files are responsable for indexing and storing key/value sets.
The only known workaround at this point in time is to add the following in your `[mon]` section from your `ceph.conf`:

    mon compact on start = true

Then restart your ceph-mon process, this will result in a major cleanup of these SST files.

Another quick tip to debug levelDB issue is to activate this option to get a full debug log:

    [osd]
    osd leveldb paranoid = true
    [osd.1]
    osd leveldb log = /var/log/ceph/osd/ceph-osd.1.log.leveldb

You can also compat it on the fly:

```bash
$ sudo ceph tell mon.{id} compact
```
