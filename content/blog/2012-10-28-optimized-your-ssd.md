---
title: Optimized your SSD
date: 2012-10-29 11:12:00
slug: optimized-your-ssd
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Optimized your SSD](/images/ceph-ssh-optimization.jpg)

I would like to share with you readers some of the optimizations I made on the SSDs storing my Ceph Journals. This article has been placed into the ceph categorie, but it's more general best practices SSDs.

<!--more-->

See below (and briefly) some optimizations I made on my SSDs for my Ceph journal.

## Firmware updates

Look at your constructor website and see if there are any firmware updates available or firmware specific for your server.

## Over-provisioning

0ver-provisioning an SSD increases the performance and endurance of an SSD. For this there are 2 methods:

* HPA (Host Protected Area) with hdparm if the disk is direct-attached
* fdisk if the disk is attached to a RAID controller

Think about the partitioning scheme and SSD Alignment. **Don't** use everything! Keep free un-allocated sectors.

## Filesystem tuning

My journals are stored on XFS. By default and without any optimizations XFS performs well. I think XFS tuning is a bit overkill and the gain of performance is really low. As Donald Knuth said: *Premature optimization is the root of all evil.* But anyway you could do something like this while formatting the device:

```bash
$ sudo mkfs.xfs -f -i size=2048 /dev/<your-device>
```

Please note that using `-n size=64K` can lead to [severe problems](http://oss.sgi.com/pipermail/xfs/2016-February/047020.html) for systems underload.
For further reading, [see the XFS FAQ](http://xfs.org/index.php/XFS_FAQ#Q:_Performance:_mkfs.xfs_-n_size.3D64k_option).

## Mount options

For mounting my disks I usually use:

    rw,noexec,nodev,noatime,nodiratime,nobarrier

The options `noatime` and `nodiratime` **really** bring better performance.

## I/O Scheduler

The default I/O scheduler on Linux is usually `cfg` (Completely Fair Queuing) or `deadline` because they provide a clever I/O schedule which re-order the request according to the placement on the physical disk. Basically the seek time concept doesn't exist with an SSD. Why? Because there are only cells on an SSD. No drive, no arm to rotate, nothing to move and nothing to get closer to. This is why we don't to re-order intelligently all the I/O requests. A simple scheduler like NOOP which acts as a simple FIFO queue is fair enough.

Check your default I/O scheduler:

```bash
$ sudo cat /sys/block/<device-name>/queue/scheduler
noop deadline [cfq]
```

And change it for NOOP:

```
$ sudo echo noop > /sys/block/<device-name>/queue/scheduler
```

Make the changes persistent after reboot by editing `/etc/default/grub` (Ubuntu/Debian based system):

    GRUB_CMDLINE_LINUX_DEFAULT="quiet elevator=noop"

Then perform a grub update:

```bash
$ sudo update-grub2
Generating grub.cfg ...
Found linux image: /boot/vmlinuz-3.2.0-31-generic
Found initrd image: /boot/initrd.img-3.2.0-31-generic
Found memtest86+ image: /boot/memtest86+.bin
done
```

This will automatically set the I/O scheduler to `noop` during every boot sequence.

In order to give you a little insight, this is what I got from my SSD. The first test uses CFG and the second one NOOP I/O scheduler:

```bash
$ sudo for i in `seq 5`; do hdparm -Tt /dev/sde; done

/dev/sde:
Timing cached reads:   14742 MB in  2.00 seconds = 7378.23 MB/sec
Timing buffered disk reads: 720 MB in  3.00 seconds = 239.75 MB/sec

/dev/sde:
Timing cached reads:   15022 MB in  2.00 seconds = 7518.77 MB/sec
Timing buffered disk reads: 806 MB in  3.00 seconds = 268.29 MB/sec

/dev/sde:
Timing cached reads:   15028 MB in  2.00 seconds = 7522.97 MB/sec
Timing buffered disk reads: 756 MB in  3.00 seconds = 251.84 MB/sec

/dev/sde:
Timing cached reads:   15128 MB in  2.00 seconds = 7571.81 MB/sec
Timing buffered disk reads: 740 MB in  3.00 seconds = 246.33 MB/sec

/dev/sde:
Timing cached reads:   14850 MB in  2.00 seconds = 7432.17 MB/sec
Timing buffered disk reads: 826 MB in  3.00 seconds = 275.19 MB/sec

$ sudo echo noop > /sys/block/sde/queue/scheduler
$ sudo cat /sys/block/sde/queue/scheduler
[noop] deadline cfq
$ sudo for i in `seq 5`; do hdparm -Tt /dev/sde; done

/dev/sde:
Timing cached reads:   15142 MB in  2.00 seconds = 7578.35 MB/sec
Timing buffered disk reads: 856 MB in  3.00 seconds = 285.32 MB/sec

/dev/sde:
Timing cached reads:   15018 MB in  2.00 seconds = 7516.26 MB/sec
Timing buffered disk reads: 752 MB in  3.01 seconds = 250.14 MB/sec

/dev/sde:
Timing cached reads:   15090 MB in  2.00 seconds = 7552.20 MB/sec
Timing buffered disk reads: 778 MB in  3.01 seconds = 258.55 MB/sec

/dev/sde:
Timing cached reads:   14898 MB in  2.00 seconds = 7456.76 MB/sec
Timing buffered disk reads: 862 MB in  3.01 seconds = 286.78 MB/sec

/dev/sde:
Timing cached reads:   15234 MB in  2.00 seconds = 7625.15 MB/sec
Timing buffered disk reads: 674 MB in  3.01 seconds = 224.28 MB/sec
```

NOOP Scheduler brings better performance.

If for some reasons, the `deadline` scheduler performs better take a look at [those /proc parameter](http://www.kernel.org/doc/Documentation/block/deadline-iosched.txt) and perform an `echo 1 > /sys/block/sda/queue/iosched/fifo_batch`.

## Controller writeback cache

It seems to be a good practice as well to enable the writeback cache functionnality on your disk controller. For this check your controller configuration on your server.

<br />

> Feel free to bring your own tips and variant optimizations in the comment section below!
