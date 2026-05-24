---
title: Ceph RBD objects placement
date: 2013-11-19 15:50:00
slug: ceph-rbd-objects-placement
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Quick script to evaluate the placement of the objects contained in a RBD image.

```bash
#!/bin/bash

# USAGE
# ./rbd-loc <pool> <image>

if [ -z ${1} ] || [ -z ${2} ];
then
    echo "USAGE: ./rbd-loc <pool> <image>"
    exit 1
fi

rbd_prefix=$(rbd -p ${1} info ${2} | grep block_name_prefix | awk '{print $2}')
for i in $(rados -p ${1} ls | grep ${rbd_prefix})
do
    ceph osd map ${1} ${i}
done
```

<!--more-->
