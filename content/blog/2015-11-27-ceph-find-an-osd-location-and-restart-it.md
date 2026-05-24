---
title: "Ceph: find an OSD location and restart it"
date: 2015-11-27 14:54:00
slug: ceph-find-an-osd-location-and-restart-it
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![](/images/ceph-find-osd-location-restart.jpg)

When you manage a large cluster, you do not always know where your OSD are located.
Sometimes you have issues with PG such as `unclean` or with OSDs such as slow requests.
While looking at your `ceph health detail` you only see where the PGs are acting or on which OSD you have slow requests.
Given that you might have tons of OSDs located on a lot of node, it is not straightforward to find and restart them.

<!--more-->

You will find bellow a simple script that can do this for you.
In this example, I want to restart all the `down` OSDs on an Ubuntu operating system.

```bash
#!/bin/bash

for down_osd in $(ceph osd tree | awk '/down/ {print $1}')
do
  host=$(ceph osd find $down_osd | awk -F\" '$2 ~ /host/ {print $4}')
  ssh $host restart ceph-osd id=$down_osd
done
```
<br />

> Yes the `awk` is ugly, if someone comes out with an easier/clearer alternative ;)
