---
title: Ceph CRUSH two copies in one rack
date: 2015-12-14 15:35:00
slug: ceph-crush-two-copies-in-one-rack
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph CRUSH two copies in one rack](/images/ceph-crush-2-copies-1-rack.jpg)

Quick CRUSH example on how to store 3 replicas, two in rack number 1 and the third one in rack number 2.

<!--more-->

Here the CRUSH rule:

    rule 3_rep_2_racks {
       ruleset 1
       type replicated
       min_size 2
       max_size 3
       step take default
       step choose firstn 2 type rack
       step chooseleaf firstn 2 type host
       step emit
    }

<br />

> Hope that helps ;-)
