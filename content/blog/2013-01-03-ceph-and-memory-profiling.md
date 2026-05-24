---
title: Ceph and memory profiling
date: 2013-01-17 16:46:00
slug: ceph-and-memory-profiling
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph and memory profiling](/images/ceph-knowledge.jpg)

How to use a memory profiler to track memory usage of Ceph daemons!

<!--more-->

To start tracking right away during daemon' startup simply put the following variable in the `/etc/init.d/ceph` script and start your OSD daemon:

    export CEPH_HEAP_PROFILER_INIT=1

The position doesn't really matter ;-).

```bash
$ sudo service ceph start osd.0
=== osd.0 === 
Starting Ceph osd.0 on ceph-01...
Starting tracking the heap
starting osd.0 at :/0 osd_data /srv/ceph/osd0 /journal/journal
```

Start the profiler:

```bash
$ ceph osd tell 0 heap start_profiler
ok
```

Ceph log shows:

    osd.0 [INF] osd.0 started profiler 

Let the profiler running and after some hours, dump the results into a file:

```bash
$ ceph osd tell 0 heap dump
ok
```

Ceph log shows:

    osd.0 [INF] osd.0dumping heap profile now.
    osd.0 [INF] ------------------------------------------------
    osd.0 [INF] MALLOC:       10810792 (   10.3 MB) Bytes in use by application
    osd.0 [INF] MALLOC: +       438272 (    0.4 MB) Bytes in page heap freelist
    osd.0 [INF] MALLOC: +       172656 (    0.2 MB) Bytes in central cache freelist
    osd.0 [INF] MALLOC: +       165632 (    0.2 MB) Bytes in transfer cache freelist
    osd.0 [INF] MALLOC: +      2044136 (    1.9 MB) Bytes in thread cache freelists
    osd.0 [INF] MALLOC: +       786432 (    0.8 MB) Bytes in malloc metadata
    osd.0 [INF] MALLOC:   ------------
    osd.0 [INF] MALLOC: =     14417920 (   13.8 MB) Actual memory used (physical + swap)
    osd.0 [INF] MALLOC: +            0 (    0.0 MB) Bytes released to OS (aka unmapped)
    osd.0 [INF] MALLOC:   ------------
    osd.0 [INF] MALLOC: =     14417920 (   13.8 MB) Virtual address space used
    osd.0 [INF] MALLOC:
    osd.0 [INF] MALLOC:           2669              Spans in use
    osd.0 [INF] MALLOC:             36              Thread heaps in use
    osd.0 [INF] MALLOC:           4096              Tcmalloc page size
    osd.0 [INF] ------------------------------------------------
    osd.0 [INF] Call ReleaseFreeMemory() to release freelist memory to the OS (via madvise()).
    osd.0 [INF] Bytes released to the OS take 

Stop the profiler:

```bash
$ ceph osd tell 0 heap stop_profiler
ok
```

Log shows:

    osd.0 [INF] osd.0 stopped profiler

Read the `.heap` file with Google heap tool:

```bash
$ sudo apt-get install google-perftools -y
$ sudo google-pprof /usr/bin/ceph-osd -gv osd-0001.heap
```

Hint, if you don't have any virtual interface you can look for a text content:

```bash
$ sudo google-pprof /usr/bin/ceph-osd --text osd-0001.heap
```
    
<br />

> I had to use a memory profiler because I recently noticed some memory leaks from Ceph OSDs. This has been discussed on the [Ceph Mailing List](http://www.mail-archive.com/ceph-devel@vger.kernel.org/msg11000.html).
