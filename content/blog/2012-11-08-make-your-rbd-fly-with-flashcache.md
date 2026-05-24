---
title: Make your RBD fly with flashcache
date: 2012-11-15 13:26:00
slug: make-your-rbd-fly-with-flashcache
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Make your RBD fly with bcache](/images/rbd-flashcache.jpg)

In this article, I will introduce the Block device cacher concept and the different solutions available. I will also (because it's the title of the article) explain how to increase the performance of an RBD device with the help of flashcache in a Ceph cluster.

<!--more-->

# I. Solutions available

## I.1. Flashcache

Flashcache is a block cache for Linux, built as a kernel module, using the Device Mapper. Flashcache supports writeback, writethrough and writearound caching modes.

Pros:

* Running in production at Facebook and I assume at some other places
* Built upon the device mapper

Cons:

* Developement rate, there are around 20 commit for the last 52 weeks. I put this in the pros section, but this could also mean that Flashcache is fairly stable and simply needs to be maintain, not actively.
* You can't attach more than one disk... Well the trick is to isolated with partitions. Basically segment your SSD with N partition where each partitions are dedicated to a device.

<span class="text_quote">K </span> Useful links:

* [Official website and download](https://github.com/facebook/flashcache/)
* [Official documentation](https://github.com/facebook/flashcache/blob/master/doc/flashcache-doc.txt)
* [System administration guide](https://github.com/facebook/flashcache/blob/master/doc/flashcache-sa-guide.txt)

## I.2. dm-cache

Dm-cache is a generic block-level disk cache for storage networking. It is built upon the Linux device-mapper, a generic block device virtualization infrastructure. It can be transparently plugged into a client of any storage system, including SAN, iSCSI and AoE, and supports dynamic customization for policy-guided optimizations.

Pros:

* Running in production at [CloudVPS](http://www.cloudvps.com/) and provides scalable virtual machine storage
* Built upon the device mapper

Cons:

* Only supports writethrough cache mode
* Same conclusion as Flashcache, there are around 35 commits over the past 52 weeks...

<span class="text_quote">K </span> Useful links:

* [Official website](http://visa.cs.fiu.edu/tiki/dm-cache)
* [Download](https://github.com/mingzhao/dm-cache)

## I.3. bcache

Bcache is a Linux kernel block layer cache. It allows one or more fast disk drives such as flash-based solid state drives (SSDs) to act as a cache for one or more slower hard disk drives.

Pros:

* Looks well featured
* A single cache device can be used to cache an arbitrary number of backing devices
* Claims to have a good mechanism to prevent data loss in writeback mode
* Good algorithm that flushes data on the underneath block device in case of the cache device dies

For more see, the features list on the official website.

Cons:

* Compile your own kernel...
* Not built upon the device mapper
* Commit rate pretty low as well

<br/>

<span class="text_quote">K </span> Useful links:

* [Official website](http://bcache.evilpiepirate.org/)
* [System administration guide](http://evilpiepirate.org/git/linux-bcache.git/tree/Documentation/bcache.txt)


<br />

> At the end, bcache remains the most featured but as far I'm concerned I don't want to run custom compiled kernel in production. Dm-cache looks nice as well but the patch only works with 3.0 kernel. Then flashcache remains and seems to be a good candidate since it workds on Kernel 3.X.

<br />

# II. Begin with flashcache

## II.1. Installation

Even if the documentation specified 2.6.X kernel (tested kernel), it seems that flashcache is compatible with recent kernels. Below the kernels I tested:

* 3.2.0-23-generic
* 3.5.0-10-generic

You will notice that it's really easy to install flashcache. As usual, start by cloning the repository and eventually compile flashcache:

```bash
$ sudo git clone https://github.com/facebook/flashcache.git
...
...

$ cd flashcache/

~/flashcache $ sudo make
...
...

~/flashcache $ sudo make install
...
...
```

Load the kernel module:

```bash
$ sudo modprobe flashcache 
$ dmesg | tail
...
...
[5576975.209769] flashcache: flashcache-2.0 initialized
```

## II.2. Your first flashcache device

### II.2.1. RBD preparations

Simply create a pool called flashcache and then an image inside it:

```bash
$ rados mkpool flashcache
$ rbd -p flashcache create --size 10000 fc
```

Map this image on your host machine and put a filesystem on it:

```bash
$ rbd -p flashcache map fc
$ rbd showmapped 
id  pool         image   snap    device
2   flashcache   fc      -       /dev/rbd0

$ sudo mkfs.ext4 /dev/rbd0
...
...

$ sudo mount /dev/rbd0 /mnt
$ touch /mnt/lol
$ sudo umount /mnt
```

Your RBD device is now ready to use.

### II.2.1. Flashcache device

Let's assume for the sake of simplicity that our SSD is detected as `/dev/sdb` and that a partition has been created. Don't forget you must partition it according to the number of RBD device you want to cache (if you want so).

```bash
$ sudo flashcache_create -p back -s 15G -b 4k rbd_fc /dev/sdb1 /dev/rbd/flashcache/fc
cachedev rbd_fc, ssd_devname /dev/sdb1, disk_devname /dev/rbd/flashcache/fc cache mode WRITE_BACK
block_size 8, md_block_size 8, cache_size 0
Flashcache metadata will use 763MB of your 15917MB main memory
```

Options explained:

* `-p`: operate in writeback mode, which means that we cache both write and read requests
* `-s`: set the size of the cache, it should be the same as the size of your partition
* `-b`: set the block size to 4K
* `rbd_fc`: name of your flashcache device

The device has been created in `/dev/mapper/`.


Replacement policy is either FIFO or LRU within a cache set. The default is FIFO but policy can be switched at any point at run time via a sysctl (see the configuration and tuning section). As far I'm concerned I prefer to use LRU (Last Recently Used) list, which I found it more efficient on my environment (web applications). This can be modified on fly like so:

```bash
$ sudo sysctl -w dev.flashcache.rbd_fc.reclaim_policy=1
```

Now you can start to use it:

```bash
$ sudo mount /dev/mapper/rbd_fc /mnt
$ ls /mnt/
lol
```

TADA ! :D

<br />
<span class="text_quote">R </span> **Note: flashcache puts a '*lock*' on the underneath block device, so basically it's not possible to use our RBD device while flashcache is operating.**
<br />

### II.2.2. Quick admin guide

#### II.2.2.1. Stop the flashcache device

Here is how to stop the flashcache device:

```
$ sudo dmsetup remove rbd_fc
```

This will sync all the dirty blocks on our RBD device.

#### II.2.2.2. Destroy the flashcache device

Completely destroy the flashcache device and his content with it.

```bash
$ sudo flashcache_destroy /dev/sdb1
flashcache_destroy: Destroying Flashcache found on /dev/loop0. Any data will be lost !!
```

#### II.2.2.3. Load the flashcache device

Load the flashcache device:

```
$ sudo flashcache_load /dev/sdb1 rbd_fc
```

#### II.2.2.4. Check the device status

Some useful info:

```bash
$ ls /proc/flashcache/loop0+bencha/
flashcache_errors  flashcache_iosize_hist  flashcache_pidlists  flashcache_stats

$ sudo cat /proc/flashcache/loop0+bencha/flashcache_stats 
reads=173 writes=6 
read_hits=84 read_hit_percent=48 write_hits=3 write_hit_percent=50 replacement=0 write_replacement=0 write_invalidates=0 read_invalidates=1 pending_enqueues=0 pending_inval=0 no_room=0 disk_reads=89 disk_writes=3 ssd_reads=84 ssd_writes=94 uncached_reads=1 uncached_writes=0 uncached_IO_requeue=0 uncached_sequential_reads=0 uncached_sequential_writes=0 pid_adds=0 pid_dels=0 pid_drops=0 pid_expiry=0
```


## II.3. Don't have any SSD? Wanna play with flashcache?

If you only want to evaluate how it works, you don't really need to buy disk (SSD or whatever). For this we basically need a block device, we are going to use loop device for that. The loop device will act as a block device for flashcache. Of course that **won't** bring any performance, it's just for testing purpose.

```bash
$ dd if=/dev/zero of=fc bs=2G count=1
0+1 records in
0+1 records out
2147479552 bytes (2.1 GB) copied, 4.23224 s, 507 MB/s
```

Check for a free loop device and then attach your nearly created file to it.

```bash
$ losetup -f
/dev/loop0

$ losetup /dev/loop0 fc
$ losetup /dev/loop0
/dev/loop0: [fc00]:668385 (/root/fc)
```

There is no use to put a filesystem on it, since we use the one from the RBD device.

<span class="text_quote">R </span> Note: using partitions with loop device is a little bit tricky. Create one or more partitions is not a problem, but putting a filesystem and mounting it is. We have to play with offset.

<br />

```bash
$ sudo flashcache_create -p back -s 512m -b 4k loop_rbd_bencha /dev/loop0 /dev/rbd/bench/bencha
cachedev loop_rbd_bencha, ssd_devname /dev/loop0, disk_devname /dev/rbd/bench/bencha cache mode WRITE_BACK
block_size 8, md_block_size 8, cache_size 1048576
Flashcache metadata will use 2MB of your 15917MB main memory
```

Check your device status:

```bash
$ sudo dmsetup ls
...
loop_rbd_bencha (252, 5)
...

$ sudo dmsetup status loop_rbd_bencha
0 20480000 flashcache stats: 
    reads(262), writes(18)
    read hits(254), read hit percent(96)
    write hits(12) write hit percent(66)
    dirty write hits(5) dirty write hit percent(27)
    replacement(0), write replacement(0)
    write invalidates(0), read invalidates(2)
    pending enqueues(1), pending inval(1)
    metadata dirties(13), metadata cleans(1)
    metadata batch(5) metadata ssd writes(9)
    cleanings(1) fallow cleanings(0)
    no room(0) front merge(0) back merge(0)
    disk reads(8), disk writes(1) ssd reads(255) ssd writes(33)
    uncached reads(2), uncached writes(0), uncached IO requeue(0)
    disk read errors(0), disk write errors(0) ssd read errors(0) ssd write errors(0)
    uncached sequential reads(0), uncached sequential writes(0)
    pid_adds(0), pid_dels(0), pid_drops(0) pid_expiry(0)
```

Look at the device table:

```bash
$ sudo dmsetup table loop_rbd_bencha
0 20480000 flashcache conf:
    ssd dev (/dev/loop0), disk dev (/dev/rbd/bench/bencha) cache mode(WRITE_BACK)
    capacity(508M), associativity(512), data block size(4K) metadata block size(4096b)
    skip sequential thresh(0K)
    total blocks(130048), cached blocks(93), cache percent(0)
    dirty blocks(12), dirty percent(0)
    nr_queued(0)
Size Hist: 1024:5 4096:22496 
```


# III. Benchmarks

For heavy and intensive benchmarks I used fio with the following configuration file:

    [global]
    bs=4k
    ioengine=libaio
    iodepth=4
    size=10g
    direct=1
    runtime=60
    directory=/srv/fc/1/fio
    filename=rbd.test.file

    [seq-read]
    rw=read
    stonewall

    [rand-read]
    rw=randread
    stonewall

    [seq-write]
    rw=write
    stonewall

    [rand-write]
    rw=randwrite
    stonewall


## III.1. Raw perf for the SSD

First I evaluated the raw performance of my SSD (an OCZ Vertex 4 256GB):

### III.1.1. Basic DD

Huge block size test:

```bash
$ for i in `seq 4`; do dd if=/dev/zero of=/mnt/bench$i bs=1G count=1 oflag=direct ; done
...
1073741824 bytes (1.1 GB) copied, 5.16781 s, 208 MB/s
...
1073741824 bytes (1.1 GB) copied, 5.16797 s, 208 MB/s
...
1073741824 bytes (1.1 GB) copied, 5.16724 s, 208 MB/s
...
1073741824 bytes (1.1 GB) copied, 5.17117 s, 208 MB/s
```

### III.1.2. FIO

fio bench:

```bash
$ sudo fio fio.fio 
seq-read: (g=0): rw=read, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
rand-read: (g=1): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
seq-write: (g=2): rw=write, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
rand-write: (g=3): rw=randwrite, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
fio 1.59
Starting 4 processes
seq-read: Laying out IO file(s) (1 file(s) / 10240MB)
Jobs: 1 (f=1): [___w] [62.3% done] [0K/52649K /s] [0 /12.9K iops] [eta 02m:26s]      
seq-read: (groupid=0, jobs=1): err= 0: pid=15066
  read : io=1813.1MB, bw=30957KB/s, iops=7739 , runt= 60001msec
    slat (usec): min=3 , max=309 , avg= 5.40, stdev= 2.01
    clat (usec): min=64 , max=13157 , avg=509.75, stdev=249.89
     lat (usec): min=123 , max=13167 , avg=515.41, stdev=249.88
    bw (KB/s) : min=30112, max=32136, per=100.01%, avg=30959.39, stdev=526.70
  cpu          : usr=10.70%, sys=26.82%, ctx=346538, majf=0, minf=25
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=464361/0/0, short=0/0/0
     lat (usec): 100=0.01%, 250=0.04%, 500=23.38%, 750=76.40%, 1000=0.08%
     lat (msec): 2=0.04%, 4=0.01%, 10=0.02%, 20=0.04%
rand-read: (groupid=1, jobs=1): err= 0: pid=15156
  read : io=1302.3MB, bw=22225KB/s, iops=5556 , runt= 60001msec
    slat (usec): min=5 , max=4106 , avg= 5.99, stdev= 7.16
    clat (usec): min=135 , max=14036 , avg=711.87, stdev=174.32
     lat (usec): min=203 , max=14044 , avg=718.15, stdev=174.43
    bw (KB/s) : min=21504, max=22360, per=100.03%, avg=22229.85, stdev=244.73
  cpu          : usr=9.69%, sys=25.41%, ctx=333353, majf=0, minf=24
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=333375/0/0, short=0/0/0
     lat (usec): 250=0.01%, 500=0.01%, 750=99.48%, 1000=0.35%
     lat (msec): 2=0.12%, 4=0.01%, 10=0.01%, 20=0.02%
seq-write: (groupid=2, jobs=1): err= 0: pid=15205
  write: io=3781.7MB, bw=64538KB/s, iops=16134 , runt= 60001msec
    slat (usec): min=4 , max=307 , avg=19.62, stdev=24.84
    clat (usec): min=41 , max=3581 , avg=226.19, stdev=25.91
     lat (usec): min=115 , max=3644 , avg=246.26, stdev= 9.98
    bw (KB/s) : min=63784, max=64640, per=100.01%, avg=64546.89, stdev=91.80
  cpu          : usr=14.76%, sys=67.90%, ctx=487593, majf=0, minf=19
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=0/968092/0, short=0/0/0
     lat (usec): 50=0.01%, 100=0.01%, 250=99.20%, 500=0.79%, 750=0.01%
     lat (usec): 1000=0.01%
     lat (msec): 4=0.01%
rand-write: (groupid=3, jobs=1): err= 0: pid=15261
  write: io=3010.4MB, bw=51370KB/s, iops=12842 , runt= 60001msec
    slat (usec): min=5 , max=286 , avg= 6.44, stdev= 3.92
    clat (usec): min=80 , max=3989 , avg=302.90, stdev=10.61
     lat (usec): min=110 , max=3995 , avg=309.63, stdev= 9.59
    bw (KB/s) : min=50968, max=51424, per=100.01%, avg=51373.98, stdev=53.84
  cpu          : usr=26.88%, sys=55.97%, ctx=764736, majf=0, minf=17
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=0/770561/0, short=0/0/0
     lat (usec): 100=0.01%, 250=0.42%, 500=99.56%, 750=0.01%, 1000=0.01%
     lat (msec): 4=0.01%

Run status group 0 (all jobs):
   READ: io=1813.1MB, aggrb=30956KB/s, minb=31699KB/s, maxb=31699KB/s, mint=60001msec, maxt=60001msec

Run status group 1 (all jobs):
   READ: io=1302.3MB, aggrb=22224KB/s, minb=22758KB/s, maxb=22758KB/s, mint=60001msec, maxt=60001msec

Run status group 2 (all jobs):
  WRITE: io=3781.7MB, aggrb=64538KB/s, minb=66087KB/s, maxb=66087KB/s, mint=60001msec, maxt=60001msec

Run status group 3 (all jobs):
  WRITE: io=3010.4MB, aggrb=51369KB/s, minb=52602KB/s, maxb=52602KB/s, mint=60001msec, maxt=60001msec

Disk stats (read/write):
  sda: ios=680863/1499424, merge=150851/239238, ticks=374184/322620, in_queue=695868, util=99.69%

```

## III.2. Raw perf for the rbd device

Then evaluate the raw performance of the RBD device.

### III.2.1 Basic DD

Huge block size test:

```bash
$ for i in `seq 4`; do dd if=/dev/zero of=/srv/bench$i bs=1G count=1 oflag=direct ; done
...
1073741824 bytes (1.1 GB) copied, 11.8548 s, 90.6 MB/s
...
1073741824 bytes (1.1 GB) copied, 22.4599 s, 47.8 MB/s
...
1073741824 bytes (1.1 GB) copied, 24.1439 s, 44.5 MB/s
...
1073741824 bytes (1.1 GB) copied, 11.2355 s, 95.6 MB/s
...
```

### III.2.2. Fio

Fio bench:

```bash
$ sudo fio fio.fio 
seq-read: (g=0): rw=read, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
rand-read: (g=1): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
seq-write: (g=2): rw=write, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
rand-write: (g=3): rw=randwrite, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
fio 1.59
Starting 4 processes
seq-read: Laying out IO file(s) (1 file(s) / 10240MB)
Jobs: 1 (f=1): [___w] [57.3% done] [0K/479K /s] [0 /117  iops] [eta 03m:01s]     
seq-read: (groupid=0, jobs=1): err= 0: pid=10458
  read : io=507920KB, bw=8435.2KB/s, iops=2108 , runt= 60215msec
    slat (usec): min=11 , max=4007 , avg=18.80, stdev=16.36
    clat (usec): min=402 , max=1119.1K, avg=1876.02, stdev=18752.27
     lat (usec): min=429 , max=1119.1K, avg=1895.17, stdev=18752.25
    bw (KB/s) : min=  322, max=20232, per=109.89%, avg=9269.30, stdev=5450.79
  cpu          : usr=0.58%, sys=4.27%, ctx=173831, majf=0, minf=25
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=126980/0/0, short=0/0/0
     lat (usec): 500=0.17%, 750=40.14%, 1000=51.65%
     lat (msec): 2=5.58%, 4=0.38%, 10=0.79%, 20=0.30%, 50=0.54%
     lat (msec): 100=0.19%, 250=0.17%, 500=0.04%, 750=0.01%, 1000=0.01%
     lat (msec): 2000=0.01%
rand-read: (groupid=1, jobs=1): err= 0: pid=10547
  read : io=58812KB, bw=979.40KB/s, iops=244 , runt= 60050msec
    slat (usec): min=12 , max=79 , avg=17.09, stdev= 2.84
    clat (usec): min=402 , max=1161.8K, avg=16313.91, stdev=28908.64
     lat (usec): min=422 , max=1161.9K, avg=16331.35, stdev=28908.67
    bw (KB/s) : min=   28, max= 1620, per=101.02%, avg=989.02, stdev=273.24
  cpu          : usr=0.07%, sys=0.55%, ctx=14463, majf=0, minf=24
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=14703/0/0, short=0/0/0
     lat (usec): 500=9.03%, 750=11.68%, 1000=1.43%
     lat (msec): 2=1.49%, 4=5.74%, 10=25.61%, 20=17.68%, 50=22.74%
     lat (msec): 100=3.57%, 250=0.79%, 500=0.21%, 1000=0.02%, 2000=0.01%
seq-write: (groupid=2, jobs=1): err= 0: pid=10596
  write: io=31316KB, bw=521296 B/s, iops=127 , runt= 61515msec
    slat (usec): min=12 , max=74452 , avg=49.11, stdev=1086.28
    clat (usec): min=842 , max=3559.1K, avg=31377.77, stdev=165947.39
     lat (usec): min=859 , max=3559.1K, avg=31427.24, stdev=165951.18
    bw (KB/s) : min=    2, max= 5077, per=139.94%, avg=712.27, stdev=1035.72
  cpu          : usr=0.10%, sys=0.23%, ctx=6056, majf=0, minf=19
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=0/7829/0, short=0/0/0
     lat (usec): 1000=2.08%
     lat (msec): 2=30.32%, 4=0.88%, 10=1.32%, 20=29.37%, 50=28.24%
     lat (msec): 100=5.33%, 250=1.70%, 500=0.19%, 750=0.06%, 1000=0.05%
     lat (msec): 2000=0.15%, >=2000=0.31%
rand-write: (groupid=3, jobs=1): err= 0: pid=10685
  write: io=26764KB, bw=456665 B/s, iops=111 , runt= 60014msec
    slat (usec): min=13 , max=67229 , avg=52.79, stdev=1199.67
    clat (usec): min=860 , max=4532.7K, avg=35819.66, stdev=178991.45
     lat (usec): min=879 , max=4532.7K, avg=35872.82, stdev=178995.79
    bw (KB/s) : min=    1, max= 8214, per=134.70%, avg=599.43, stdev=1258.28
  cpu          : usr=0.05%, sys=0.27%, ctx=6024, majf=0, minf=17
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=0/6691/0, short=0/0/0
     lat (usec): 1000=1.45%
     lat (msec): 2=44.10%, 4=2.26%, 10=4.69%, 20=12.72%, 50=23.29%
     lat (msec): 100=7.95%, 250=1.85%, 500=0.63%, 750=0.27%, 1000=0.27%
     lat (msec): 2000=0.28%, >=2000=0.24%

Run status group 0 (all jobs):
   READ: io=507920KB, aggrb=8435KB/s, minb=8637KB/s, maxb=8637KB/s, mint=60215msec, maxt=60215msec

Run status group 1 (all jobs):
   READ: io=58812KB, aggrb=979KB/s, minb=1002KB/s, maxb=1002KB/s, mint=60050msec, maxt=60050msec

Run status group 2 (all jobs):
  WRITE: io=31316KB, aggrb=509KB/s, minb=521KB/s, maxb=521KB/s, mint=61515msec, maxt=61515msec

Run status group 3 (all jobs):
  WRITE: io=26764KB, aggrb=445KB/s, minb=456KB/s, maxb=456KB/s, mint=60014msec, maxt=60014msec

Disk stats (read/write):
  rbd4: ios=141683/14534, merge=0/100, ticks=479184/497888, in_queue=977012, util=99.71%
```

## III.3. Flashcache performance

### III.3.1. Basic DD

Huge block size test:

```bash
$ for i in `seq 4`; do dd if=/dev/zero of=/srv/bench-flash$i bs=1G count=1 oflag=direct ; done
...
1073741824 bytes (1.1 GB) copied, 5.97447 s, 180 MB/s
...
1073741824 bytes (1.1 GB) copied, 6.10323 s, 176 MB/s
...
1073741824 bytes (1.1 GB) copied, 6.05537 s, 177 MB/s
...
1073741824 bytes (1.1 GB) copied, 6.13435 s, 175 MB/s
```

### III.3.2. Fio

Fio benchs:

```bash
$ sudo fio fio.fio 
seq-read: (g=0): rw=read, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
rand-read: (g=1): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
seq-write: (g=2): rw=write, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
rand-write: (g=3): rw=randwrite, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
fio 1.59
Starting 4 processes
seq-read: Laying out IO file(s) (1 file(s) / 10240MB)
Jobs: 1 (f=1): [___w] [57.2% done] [0K/30488K /s] [0 /7443  iops] [eta 03m:00s]      
seq-read: (groupid=0, jobs=1): err= 0: pid=7887
  read : io=1855.6MB, bw=31668KB/s, iops=7916 , runt= 60001msec
    slat (usec): min=5 , max=403 , avg= 7.92, stdev= 1.35
    clat (usec): min=74 , max=4352 , avg=495.63, stdev=18.93
     lat (usec): min=145 , max=4358 , avg=503.83, stdev=18.83
    bw (KB/s) : min=30952, max=34560, per=100.01%, avg=31669.58, stdev=666.51
  cpu          : usr=9.41%, sys=29.98%, ctx=356142, majf=0, minf=25
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=475027/0/0, short=0/0/0
     lat (usec): 100=0.01%, 250=0.01%, 500=50.08%, 750=49.90%, 1000=0.01%
     lat (msec): 2=0.01%, 10=0.01%
rand-read: (groupid=1, jobs=1): err= 0: pid=7976
  read : io=1316.7MB, bw=22470KB/s, iops=5617 , runt= 60001msec
    slat (usec): min=7 , max=133 , avg= 9.83, stdev= 1.10
    clat (usec): min=134 , max=4528 , avg=700.15, stdev=23.88
     lat (usec): min=201 , max=4539 , avg=710.29, stdev=23.82
    bw (KB/s) : min=22104, max=22712, per=100.02%, avg=22474.15, stdev=129.39
  cpu          : usr=8.61%, sys=27.86%, ctx=337054, majf=0, minf=24
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=337051/0/0, short=0/0/0
     lat (usec): 250=0.01%, 500=0.01%, 750=99.91%, 1000=0.06%
     lat (msec): 2=0.01%, 4=0.01%, 10=0.01%
seq-write: (groupid=2, jobs=1): err= 0: pid=8025
  write: io=2130.2MB, bw=36355KB/s, iops=9088 , runt= 60001msec
    slat (usec): min=5 , max=5546 , avg=27.27, stdev=86.85
    clat (usec): min=30 , max=176235 , avg=406.65, stdev=1410.29
     lat (usec): min=92 , max=176240 , avg=434.66, stdev=1422.74
    bw (KB/s) : min=18504, max=61264, per=100.07%, avg=36379.68, stdev=13467.95
  cpu          : usr=3.65%, sys=42.12%, ctx=418186, majf=0, minf=19
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=0/545329/0, short=0/0/0
     lat (usec): 50=0.07%, 100=0.13%, 250=70.70%, 500=22.93%, 750=3.28%
     lat (usec): 1000=0.21%
     lat (msec): 2=0.43%, 4=1.28%, 10=0.75%, 20=0.06%, 50=0.16%
     lat (msec): 100=0.01%, 250=0.01%
rand-write: (groupid=3, jobs=1): err= 0: pid=8115
  write: io=1810.6MB, bw=30899KB/s, iops=7724 , runt= 60001msec
    slat (usec): min=7 , max=5066 , avg=34.85, stdev=110.77
    clat (usec): min=1 , max=4608.3K, avg=478.94, stdev=11796.80
     lat (usec): min=88 , max=4608.3K, avg=515.53, stdev=11799.37
    bw (KB/s) : min=  978, max=46568, per=102.88%, avg=31787.85, stdev=6676.48
  cpu          : usr=3.43%, sys=42.55%, ctx=582845, majf=0, minf=17
  IO depths    : 1=0.1%, 2=0.1%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued r/w/d: total=0/463488/0, short=0/0/0
     lat (usec): 2=0.01%, 4=0.01%, 10=0.01%, 20=0.03%, 50=2.30%
     lat (usec): 100=0.37%, 250=31.70%, 500=44.91%, 750=17.31%, 1000=0.76%
     lat (msec): 2=0.79%, 4=0.62%, 10=0.95%, 20=0.24%, 50=0.01%
     lat (msec): 100=0.01%, 250=0.01%, 500=0.01%, 750=0.01%, 1000=0.01%
     lat (msec): 2000=0.01%, >=2000=0.01%

Run status group 0 (all jobs):
   READ: io=1855.6MB, aggrb=31667KB/s, minb=32427KB/s, maxb=32427KB/s, mint=60001msec, maxt=60001msec

Run status group 1 (all jobs):
   READ: io=1316.7MB, aggrb=22469KB/s, minb=23008KB/s, maxb=23008KB/s, mint=60001msec, maxt=60001msec

Run status group 2 (all jobs):
  WRITE: io=2130.2MB, aggrb=36354KB/s, minb=37227KB/s, maxb=37227KB/s, mint=60001msec, maxt=60001msec

Run status group 3 (all jobs):
  WRITE: io=1810.6MB, aggrb=30898KB/s, minb=31640KB/s, maxb=31640KB/s, mint=60001msec, maxt=60001msec

Disk stats (read/write):
  dm-5: ios=812078/1007851, merge=0/0, ticks=428556/406440, in_queue=835256, util=99.63%, aggrios=355059/564178, aggrmerge=552135/538669, aggrticks=214602/280808, aggrin_queue=494798, aggrutil=95.95%
    rbd1: ios=0/17922, merge=0/985483, ticks=0/287612, in_queue=287628, util=42.57%
    sda: ios=710118/1110434, merge=1104271/91856, ticks=429204/274004, in_queue=701968, util=95.95%
```


## III.4. Chart results

A little sum up in a more readable format:

![Flashcache RBD results](/images/flashcache-rbd-results.jpg)

Random benchmarks found on bcache IRC:

[Unknown benchmarks](http://www.bildercache.de/anzeige.html?dateiname=20121109-004052-845.png)

<br />

# IV. High availability corner

Here I'm about to introduce the integration of Flashcache on the HA stack with Pacemaker.

<span class="text_quote">R </span> Note: if you use writeback mode you **must** use DRBD to replicate the blocks of your Flashcache device, to ensure consistency on the block level. With `Writethrough` and `Writearound` it's not necessary because every write requests go to the underneath block device directly. I won't detail the DRBD setup since you can find it on several articles in my website, *use the research button ;-)*.

<br />

All the prerequisites about RBD and Paceamker can be found on my [previous article](http://www.sebastien-han.fr/blog/2012/07/06/nfs-over-rbd/). For the flashcache RA, it has been installed during the git clone. I would like to thank you Florian Haas from [Hastexo](hastexo.com) for this resource agent.

First configure the rbd primitive:

```bash
$ sudo crm configure primitive p_rbd ocf:ceph:rbd.in \
        params user="admin" pool="rbd" name="share1" cephconf="/etc/ceph/ceph.conf" \
        op monitor interval="10s" timeout="20s"
```

And Flashcache:

```bash
$ sudo crm configure primitive p_flashcache ocf:flashcache:flashcache \
        params cache_device="/dev/sdb1" device="/dev/rbd/flashcache/fc" name="rbd_fc" \
        op monitor interval="10s" timeout="20s"
```

Then the Filesystem:

```bash
$ sudo crm configure primitive p_fs ocf:heartbeat:Filesystem \
        params directory="/mnt/" fstype="xfs" device="/dev/rbd/flashcache/fc" fast_stop="no" \
        op monitor interval="20s" timeout="40s" \
        op start interval="0" timeout="60s" \
        op stop interval="0" timeout="60s"
```

Eventually create a group for all these resources:

```bash
$ sudo crm configure group g_disk p_rbd p_flashcache p_fs
```

You should see something like this:

    ============
    Last updated: Thu Nov 15 01:10:54 2012
    Last change: Thu Nov 15 01:06:16 2012 via cibadmin on ha-01
    Stack: openais
    Current DC: ha-01 - partition with quorum
    Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
    2 Nodes configured, 2 expected votes
    3 Resources configured.
    ============

    Online: [ ha-01 ha-02 ]

     Resource Group: g_disk
         p_rbd      (ocf::ceph:rbd.in):     Started ha-01
         p_flashcache       (ocf::flashcache:flashcache):   Started ha-01
         p_fs       (ocf::heartbeat:Filesystem):    Started ha-01

Here we used the writethrough mode for our flashcache device, so we don't need to replicate the content of our flashcache device.

<br />

> I truly believe in the potential of bcache, I will probably consider it when the implementation will be in the device mapper (and easier, no funcky Kernel compilation) and why not part of the kernel mainline (it's not for today...). For the moment, I think Flashcache is a really good solution that can suit most of our needs. As always feel free to comment, critic and ask questions on the comment section below ;-)
