---
title: "Ceph CRUSH rule: 1 copy SSD and 1 copy SATA"
date: 2015-12-21 13:38:00
slug: ceph-crush-rule-1-copy-ssd-and-1-copy-sata
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph CRUSH two copies in one rack](/images/ceph-crush-1-copy-ssd-1-copy-sata.jpg)

Following last week article, here is another CRUSH example.
This time we want to store our first replica on SSD drives and the second copy on SATA drives.

<!--more-->

Here is the CRUSH rule:

    rule ssd-primary-affinity {
        ruleset 0
        type replicated
        min_size 2
        max_size 3
        step take ssd
        step chooseleaf firstn 1 type host
        step emit
        step take sata
        step chooseleaf firstn -1 type host
        step emit
    }

<br />

> Make sure that you configure your OSD with the primary affinty flag as well, for reference look at my [article about primary affinity](http://www.sebastien-han.fr/blog/2015/08/06/ceph-get-the-best-of-your-ssd-with-primary-affinity/).
