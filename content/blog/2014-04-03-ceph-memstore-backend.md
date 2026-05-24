---
title: "Ceph: real men use the memstore backend"
date: 2014-04-03 23:48:00
slug: ceph-memstore-backend
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: real men use the memstore backend](/images/ceph-memory-backend.jpg)

A simple in-memory backend that stores objects in RAM is available since version 0.76 and will land with Firefly.
Quick look at this new feature.

<!--more-->

<br />

<span class="text_quote">W </span> **DON'T DO THIS IN PRODUCTION**

<br />

The refactoring of `Filestore` brought a new way to store Ceph objects.
You do not need any disks, all the objects live in the memory of your server.
Obviously, this is extremely dangerous because if the server crashes or if the OSD process dies, you loose all the objects.
On the other hand, if you gracefully stop or restart your OSD process, all your objects will get written on your hard drive disk.

To configure it just append the following line into your `ceph.conf` file:

    osd objectstore = memstore
