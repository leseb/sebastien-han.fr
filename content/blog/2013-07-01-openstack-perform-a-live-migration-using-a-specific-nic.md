---
title: "OpenStack: perform a live migration using a specific NIC"
date: 2013-07-02 17:58:00
slug: openstack-perform-a-live-migration-using-a-specific-nic
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack: perform a live migration using a specific NIC](/images/live-migration-specific-nic.jpg)

Quick old tip (back from the cave) to trigger a live migration from a specific network card.

<!--more-->

In order to make it working you need to be able to resolve the ip of the desired interface, let's put it that way:

* `eth0` is default, hostname is node01
* `eth1` is 10GB hostname is node01-s

Add this in your nova.conf:

    live_migration_uri=qemu+tcp://%s-s/system

`%s` is your destination host (as a python variable), it points to the name used from the command line.

The live migration will now use the node with `-s`, but the command line remains the same

```bash
$ nova live-migration <vm> node01
```

<br />

> Enjoy a fast live migration!
