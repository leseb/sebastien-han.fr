---
title: Five useful new features from Ceph Infernalis
date: 2015-11-18 16:38:00
slug: five-useful-new-features-from-ceph-infernalis
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Five useful new feature from Ceph Infernalis](/images/ceph-infernalis-5-new-features.jpg)

Infernalis has just been released a couple of weeks ago and I have to admit that I am really impressed of the work that has been done.
So I am going to present you 5 really handy things that came out with this new release.

<!--more-->


## 1. Use units to create an image and for benchmark commands

Prior to this, the default unit was MB so we had to write the image size in consequence.

```bash
$ rbd create a -s 1G
```

<br />

## 2. Space used by an image

Since images are sparse and that discard is available for some virtualization [storage controllers](http://www.sebastien-han.fr/blog/2015/02/02/openstack-and-ceph-rbd-discard/) it is nice to have the ability to track the space used by an image.
Obviously using object-map is highly recommend here, as it will speed up the calculation time.

```
$ rbd du a
warning: fast-diff map is not enabled for a. operation may be slow.
NAME PROVISIONED USED
a          1024M    0

$ rbd -p rbd bench-write a --io-size 4096 --io-threads 1 --io-total 4096 --io-pattern rand
bench-write  io_size 4096 io_threads 1 bytes 4096 pattern rand
  SEC       OPS   OPS/SEC   BYTES/SEC
elapsed:     0  ops:        1  ops/sec:    83.42  bytes/sec: 341671.93

$ rbd du a
warning: fast-diff map is not enabled for a. operation may be slow.
NAME PROVISIONED  USED
a          1024M 4096k
```

<br />

## 3. OSD performance analyser

A new command that will connect to the daemon's socket and show some statistics.

```bash
$ ceph daemonperf osd.1
---objecter--- -----------osd-----------
writ read actv|recop rd   wr   lat  ops |
  0    0    0 |   0    0   53k 339   13
  0    0    0 |   0    0  753k 516  180
  0    0    0 |   0    0  843k 149  206
  0    0    0 |   0    0  507k  34  123
  0    0    0 |   0    0  630k  45  150
  0    0    0 |   0    0  626k  33  149
  0    0    0 |   0    0  573k  57  138
  0    0    0 |   0    0  172k  49   42
  0    0    0 |   0    0    0    0    0
  0    0    0 |   0    0    0    0    0
```

<br />

## 4. Enable and disable image feature on the fly

Quick example on how to enable object map after the image creation.

```bash
$ rbd create a -s 1G --image-feature exclusive-lock
$ rbd info a
rbd image 'a':
        size 1024 MB in 256 objects
        order 22 (4096 kB objects)
        block_name_prefix: rbd_data.856d51f8ceac
        format: 2
        features: exclusive-lock
        flags:

$ rbd feature enable a object-map
```

<br />

## 5. Default new images to format 2

Thanks to this, we do not need to specify the format during the image creation, nor add a new line into your `ceph.conf`.

<br />

> Enjoy!
