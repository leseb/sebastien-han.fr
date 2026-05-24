---
title: Introducing ceph-lazy
date: 2016-07-28 16:58:29
slug: Introducing-ceph-lazy
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph Lazy](/images/ceph-lazy.jpg)

This article is co-authored with [Gregory Charot](https://github.com/gcharot/) (author of the tool).
Have you ever found yourself doing long series of pipes to get a particular value that is not directly provided by a Ceph CLI command or just trying to remove surrounding text to get a particular value?
This situation often results in quick & dirty `sed`/`awk` pipelines ending (best case scenario) as alias or forgotten in your shell history until next time you need it.
Here comes ceph-lazy, a shell toolkit that combines some of these queries that require multiple processing or text manipulation.

<!--more-->

Starting from most basic queries like:

* listing OSDs nodes
* OSDs attached to a node

To more complex queries such as getting:

* nodes that host a particular PG
* effective RBD image size (prior to Jewel)
* a node total capacity usage or listing nodes/OSDs that host a RBD image.

Some basic stats reporting around PGs and OSDs usage are also available.

The current list of commands is as follow:

    COMMANDS
    =========

        Host
        -----
        host-get-osd      hostname                      List all OSD IDs attached to a particular node.
        host-get-nodes                                  List all storage nodes.
        host-osd-usage    hostname                      Show total OSD space usage of a particular node (-d for details).
        host-all-usage                                  Show total OSD space usage of each nodes (-d for details)

        Placement groups
        -----------------
        pg-get-host       pgid                          Find PG storage hosts (first is primary)
        pg-most-write                                   Find most written PG (nb operations)
        pg-less-write                                   Find less written PG (nb operations)
        pg-most-write-kb                                Find most written PG (data written)
        pg-less-write-kb                                Find less written PG (data written)
        pg-most-read                                    Find most read PG (nb operations)
        pg-less-read                                    Find less read PG (nb operations)
        pg-most-read-kb                                 Find most read PG (data read)
        pg-less-read-kb                                 Find less read PG (data read)
        pg-empty                                        Find empty PGs (no stored object)

        RBD
        ----
        rbd-prefix        pool_name image_name          Return RBD image prefix
        rbd-count         pool_name image_name          Count number of objects in a RBD image
        rbd-host          pool_name image_name          Find RBD primary storage hosts
        rbd-osd           pool_name image_name          Find RBD primary OSDs
        rbd-size          pool_name image_name          Print RBD image real size
        rbd-all-size      pool_name                     Print all RBD images size (Top first)

        OSD
        ----
        osd-most-used                                   Show the most used OSD (capacity)
        osd-less-used                                   Show the less used OSD (capacity)
        osd-get-ppg       osd_id                        Show all primaries PGS hosted on a OSD
        osd-get-pg        osd_id                        Show all PGS hosted on a OSD

        Objects
        --------
        object-get-host   pool_name object_id           Find object storage hosts (first is primary)


Some interesting commands:

```bash
$ ceph-lazy host-all-usage
Host:ceph01 | OSDs:2 | Total_Size:39.0GB | Total_Used:2.8GB | Total_Available:36.1GB
Host:ceph02 | OSDs:2 | Total_Size:39.0GB | Total_Used:2.8GB | Total_Available:36.1GB
Host:ceph03 | OSDs:2 | Total_Size:39.0GB | Total_Used:2.8GB | Total_Available:36.1GB
```

Useful information, allow to see if data are evenly spread across the cluster:

```bash
$ ceph-lazy rbd-host rbd myrbd
ceph01
ceph02
ceph03
```

Not really relevant on a 3 nodes cluster but can become interesting on larger clusters especially with custom CRUSH maps.

For those who are not running Jewel and thus don't have `rbd du` command:

```bash
$ ceph-lazy rbd-all-size rbd
2614.32 MB - myrbd
500 MB - rbd01
150 MB - rbd03
50 MB - rbd02
```

Find PG storage hosts (first is primary):

```bash
$ ceph-lazy pg-get-host 0.30
OSD:osd.1 | Host:osd02
OSD:osd.4 | Host:osd01
OSD:osd.3 | Host:osd03
```

The tool is available on github at [Ceph lazy](https://github.com/gcharot/ceph-lazy), few dependencies are required such as `jq` for json parsing and `bc` calculator for some of the commands.

<br />

> Tired of piping? Go lazy!
