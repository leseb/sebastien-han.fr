---
title: Quick and efficient Ceph DevStacking
date: 2015-02-24 11:27:00
slug: quick-and-efficient-ceph-devstacking
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Quick and efficient Ceph DevStacking](/images/devstack.png)

Recently I built a little repository on github/ceph where I put two files to help you building your DevStack Ceph.

```bash
$ git clone https://git.openstack.org/openstack-dev/devstack
$ git clone https://github.com/ceph/ceph-devstack.git
$ cp ceph-devstack/local* devstack
$ cd devstack
$ ./stack.sh
```
<br />

> Happy DevStacking!

<!--more-->
