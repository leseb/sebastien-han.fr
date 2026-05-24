---
title: Ceph RADOS benchmarks replica impacts
date: 2013-12-09 15:37:00
slug: ceph-rados-benchmarks-replica-impacts
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph RADOS benchmarks replica impacts](/images/ceph-replicaz-impact.jpg)

Some figures from a RADOS bench.

<!--more-->

<br />

The test maintained an IO concurrency of 1. Basically, we sent IOs one by one.

 Block Size  | Concurrency | Replica Count | Bandwidth
-------------|-------------|---------------|-----------
     1048576 |           1 |             1 | 72.668
     1048576 |           1 |             2 |  74.945
     1048576 |           1 |             3 |  61.796
     1048576 |           1 |             4 |  54.241
      131072 |           1 |             1 | 29.733
      131072 |           1 |             2 | 29.876
      131072 |           1 |             3 | 24.674
      131072 |           1 |             4 | 22.402
        4096 |           1 |             1 |  1.737
        4096 |           1 |             2 | 1.691
        4096 |           1 |             3 | 1.663
        4096 |           1 |             4 |  1.687
