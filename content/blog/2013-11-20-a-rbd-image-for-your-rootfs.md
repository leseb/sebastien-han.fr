---
title: A RBD image for your rootfs?
date: 2013-11-20 22:05:00
slug: a-rbd-image-for-your-rootfs
draft: true
categories: ["ceph"]
tags: []
---

![A RBD image for your rootfs?](/images/ceph-rbd-diskless-servers.jpg)

Diskless server?

<!--more-->


PXE + initrd + rbd map + kexec

Build your initrd image:

```bash
$ sudo apt-get install initramfs-tools -y
```

Some help here:

https://github.com/enovance/edeploy/blob/master/build/pxe.install
https://github.com/enovance/edeploy/blob/master/build/Makefile
http://www.kernelhub.org/?p=2&msg=365017
https://dracut.wiki.kernel.org/index.php/MainPage
