---
title: "Ceph: find who's mapping a RBD device"
date: 2013-11-25 10:56:00
slug: ceph-find-whos-mapping-a-rbd-device
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: find who's mapping a RBD device](/images/ceph-whos-mapping-rbd.jpg)

Curious? Wanna know who has a RBD device mapped?

<!--more-->

<span class="text_quote">W </span> Update: **Since Ceph Infernalis there is a RBD command for that**

Simply run:

```bash
$ rbd status vms/2fcf7648-27d6-406f-bc92-b3f9d5ebe5f5_disk
Watchers:
        watcher=192.168.0.41:0/3263847771 client.15535 cookie=139998968390560
```

<br />

<span class="text_quote">W </span>Important note: **this method only works with the Emperor version of Ceph and above.**

Grab the image information:

```bash
$ rbd info boot
rbd image 'boot':
    size 10240 MB in 2560 objects
    order 22 (4096 kB objects)
    block_name_prefix: rb.0.89ee.2ae8944a
    format: 1
```

Then list the objects part of the pool and get the image header.
Eventually run:

```bash
$ rados -p rbd listwatchers boot.rbd
watcher=192.168.251.102:0/2550823152 client.35321 cookie=1
```

As we can see the machine: `192.168.251.102` has the device `boot` mapped.
