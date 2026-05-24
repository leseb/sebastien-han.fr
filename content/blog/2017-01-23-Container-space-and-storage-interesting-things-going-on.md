---
title: Container space and storage, interesting things going on
date: 2017-01-23 00:15:18
slug: Container-space-and-storage-interesting-things-going-on
draft: true
categories: ["containers"]
tags: ["containers", "ceph"]
---

![Title](/images/container-storage-futur.jpg)

Containers with the help of Kubernetes are moving at a drastic speed.
Even if Kubernetes has a flexible/pluggable architecture, it is not always easy to come up with the right interface to attach storage.
We are always trying to re-use existing technology as much as we can.
This is exactly  what this article is about: re-using the best of breed technology pieces we have and bring them to the container world.

<!--more-->

## I. TCMU

TCMU is a userspace implementation of TCM which is another name for LIO, an in-kernel iSCSI target.
Add userspace command handling brings numerous advantages such as enabling a larger variety of existing backends (e.g: Ceph and Gluster) without requiring any kernel code.
Obviously, this does not come without performance challenges when it comes to throughput and latency.

TCM has several "default" backstore available (file, block, pscsi), tcmu is just a new one that does the gateway between kernel and userspace.

## II. TCMU-QEMU

Bla

![Title](/images/tcmu-qemu.jpg)

## III. Container integration


<br />

> bla



http://linux-iscsi.org/wiki/Tcm_loop

/Users/leseb/Downloads/qemu-tcmu\ for\ Container\ Volume\ Interface.pdf
/Users/leseb/Downloads/Converging\ QEMU\ and\ TCMU\ for\ Container\ Storage.pdf
https://patchwork.kernel.org/patch/9412171/
https://pkalever.wordpress.com/2016/11/04/gluster-as-block-storage-with-qemu-tcmu/
/Users/leseb/Downloads/tcmu-bobw_0.pdf
https://www.kernel.org/doc/Documentation/target/tcmu-design.txt

