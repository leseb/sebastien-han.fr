---
title: Check if KVM has the support of Ceph
date: 2014-01-17 10:26:00
slug: check-if-kvm-has-the-support-of-ceph
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Check if KVM has the support of Ceph](/images/debian-ceph.png)

As you may know Ceph is not part of Debian Wheezy, thus QEMU-KVM was not compiled with the Ceph support (`--enable-rbd` with both `librbd` and `librados`).
This article is just a quick tip to detect if your QEMU-KVM has the support of Ceph.

<!--more-->

<br />

First check QEMU-KVM:

```bash
$ sudo qemu-system-x86_64 -drive format=?
Supported formats: vvfat vpc vmdk vhdx vdi sheepdog sheepdog sheepdog rbd raw host_cdrom host_floppy host_device file qed qcow2 qcow parallels nbd nbd nbd dmg tftp ftps ftp https http cow cloop bochs blkverify blkdebug
```

And look for `rbd` in the output!

Then QEMU-UTILS:

```bash
$ qemu-img -h
...
...
Supported formats: vvfat vpc vmdk vhdx vdi sheepdog sheepdog sheepdog rbd raw host_cdrom host_floppy host_device file qed qcow2 qcow parallels nbd nbd nbd dmg tftp ftps ftp https http cow cloop bochs blkverify blkdebug
```

And look for `rbd` in the output!

<br />

> That's it!
