---
title: Real size of a Ceph RBD image
date: 2013-12-19 10:49:00
slug: real-size-of-a-ceph-rbd-image
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Real size of a Ceph RBD image](/images/real-size-rbd-image.jpg)

RBD images are thin-provisionned thus you don't always know the real size of the image.
Moreover, Ceph doesn't provide any simple facility to check the real size of an image.
This blog post took his inspiration from the [Ceph mailing list](http://permalink.gmane.org/gmane.comp.file-systems.ceph.user/3684).

<!--more-->

Create an image:

```bash
$ rbd create -s 1024 toto
```

The magic formula using block differential:

```bash
$ rbd diff rbd/toto | awk '{ SUM += $2 } END { print SUM/1024/1024 " MB" }'
0 MB
```

Further testing:

```bash
$ rbd map toto

$ rbd showmapped
id pool image snap device
2  rbd  toto  -    /dev/rbd1

$ dd if=/dev/zero of=/dev/rbd1 bs=1M count=10 oflag=direct
10+0 records in
10+0 records out
10485760 bytes (10 MB) copied, 6.91826 s, 1.5 MB/s
```

So we wrote 10M, we should get 10MB in the ouput :).

```bash
$ rbd diff rbd/toto | awk '{ SUM += $2 } END { print SUM/1024/1024 " MB" }'
10 MB
```

<br />

> Thanks to Olivier Bonvalet for the AWK command.
