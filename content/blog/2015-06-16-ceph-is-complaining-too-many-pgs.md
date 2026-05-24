---
title: "Ceph is complaining: too many PGs"
date: 2015-06-16 11:29:00
slug: ceph-is-complaining-too-many-pgs
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph is complaining: too many PGs](/images/ceph-complaining-too-many-pgs.jpg)

Quick tip.

<!--more-->

Sometimes by running `ceph -s`, you can get a WARNING state saying:

    health HEALTH_WARN
    too many PGs per OSD (438 > max 300)

To suppress this warning, append the following configuration options into your `ceph.conf`:

    mon_pg_warn_max_per_osd = 0

Eventually **restart all your Ceph monitors**.
