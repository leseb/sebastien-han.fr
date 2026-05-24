---
title: "Ceph: validate that the RBD cache is active"
date: 2015-09-02 15:16:00
slug: ceph-validate-that-the-rbd-cache-is-active
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph validate that the RBD cache is active](/images/ceph-check-rbd-cache-isenabled.jpg)

Quick and simple test to validate if the RBD cache is enabled on your client.

<!--more-->

<br />

Simple thing first, if you are running a Ceph version newer or equal than 0.87 the cache is enabled by default.
If not then you can simply enable the cache via the `[client]`:

    [client]
    rbd cache = true
    rbd cache writethrough until flush = true

Then you need to activate two flags in your `ceph.conf` within the `[client]`:

    [client]
    admin socket = /var/run/ceph/$cluster-$type.$id.$pid.$cctid.asok
    log file = /var/log/ceph/

Both paths must be writable by the user running using the RBD library  and the security context (SELinux or AppArmor) must be configured properly.

Once this is done, run your application that is supposed to use `librbd` (a virtual machine or something else) and simply request the admin daemon from a socket:

```bash
$ sudo ceph --admin-daemon /var/run/ceph/ceph-client.admin.66606.140190886662256.asok config show | grep rbd_cache
    "rbd_cache": "true",
    "rbd_cache_writethrough_until_flush": "true",
    "rbd_cache_size": "33554432",
    "rbd_cache_max_dirty": "25165824",
    "rbd_cache_target_dirty": "16777216",
    "rbd_cache_max_dirty_age": "1",
    "rbd_cache_max_dirty_object": "0",
    "rbd_cache_block_writes_upfront": "false",
```

<br />

# Verify the cache behaviour

If you want to go further and test the performance enhancement brought by the cache you can do the following turn it off from the `[client]` section in your `ceph.conf` like this `rbd cache = false`.
Then a benchmark like so using the following command (assuming the RBD pool exists):

```bash
$ rbd -p rbd bench-write fio —io-size 4096 —io-threads 256 —io-total 1024000000 —io-pattern seq
```

Eventually run this test with and without the cache section should bring a significant difference :).

<br />

> Enjoy!
