---
title: "Ceph: manage storage zones with CRUSH"
date: 2012-12-07 23:34:00
slug: ceph-2-speed-storage-with-crush
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: 2 speed storage with CRUSH](/images/crush.png)

This article introduces a simple use case for storage providers. For some reasons some customers would like to pay more for a fast storage solution and other would prefer to pay less for a reasonnable storage solution.

<!--more-->

# I. Use case

Roughly say your infrastructure could be based on several type of servers:

* storage nodes full of SSDs disks
* storage nodes full of SAS disks
* storage nodes full of SATA disks

Such handy mecanism is possible with the help of the CRUSH Map.

<br />

# II. A bit about CRUSH

CRUSH stands for Controlled Replication Under Scalable Hashing:

* Pseudo-random placement algorithm
* Fast calculation, no lookup Repeatable, deterministic
* Ensures even distribution
* Stable mapping
* Limited data migration
* Rule-based configuration, rule determines data placement
* Infrastructure topology aware, the map knows the structure of your infra (nodes, racks, row, datacenter)
* Allows weighting, every OSD has a weight

[For more details check the Ceph Official documentation](http://ceph.com/docs/master/rados/operations/crush-map/).

<br />

# III. Setup

What are we going to do?

1. Retrieve the current CRUSH Map
2. Decompile the CRUSH Map
3. Edit it. We will add 2 buckets and 2 rulesets
4. Recompile the new CRUSH Map.
5. Re-inject the new CRUSH Map.

## III.1. Begin

Grab your current CRUSH map:

```bash
$ ceph osd getcrushmap -o ma-crush-map
$ crushtool -d ma-crush-map -o ma-crush-map.txt
```

For the sake of simplicity, let's assume that you have 4 OSDs:

* 2 of them are SAS disks
* 2 of them are SSD enterprise

And here is the OSD tree:

```bash
$ ceph osd tree
dumped osdmap tree epoch 621
# id    weight  type name   up/down reweight
-1  12  pool default
-3  12      rack le-rack
-2  3           host ceph-01
0   1               osd.0   up  1
1   1               osd.1   up  1
-4  3           host ceph-02
2   1               osd.2   up  1
3   1               osd.3   up  1
```

## III.2. Default crush map

Edit your CRUSH map:

    # begin crush map
    
    # devices
    device 0 osd.0
    device 1 osd.1
    device 2 osd.2
    device 3 osd.3
    
    # types
    type 0 osd
    type 1 host
    type 2 rack
    type 3 row
    type 4 room
    type 5 datacenter
    type 6 pool
    
    # buckets
    host ceph-01 {
        id -2       # do not change unnecessarily
        # weight 3.000
        alg straw
        hash 0  # rjenkins1
        item osd.0 weight 1.000
        item osd.1 weight 1.000
    }
    host ceph-02 {
        id -4       # do not change unnecessarily
        # weight 3.000
        alg straw
        hash 0  # rjenkins1
        item osd.2 weight 1.000
        item osd.3 weight 1.000
    }
    rack le-rack {
        id -3       # do not change unnecessarily
        # weight 12.000
        alg straw
        hash 0  # rjenkins1
        item ceph-01 weight 2.000
        item ceph-02 weight 2.000
    }
    pool default {
        id -1       # do not change unnecessarily
        # weight 12.000
        alg straw
        hash 0  # rjenkins1
        item le-rack weight 4.000
    }
    
    # rules
    rule data {
        ruleset 0
        type replicated
        min_size 1
        max_size 10
        step take default
        step chooseleaf firstn 0 type host
        step emit
    }
    rule metadata {
        ruleset 1
        type replicated
        min_size 1
        max_size 10
        step take default
        step chooseleaf firstn 0 type host
        step emit
    }
    rule rbd {
        ruleset 2
        type replicated
        min_size 1
        max_size 10
        step take default
        step chooseleaf firstn 0 type host
        step emit
    }
    
    # end crush map

## III.3. Add buckets and rules

Now we have to add 2 new specific rules:

* one for the SSD pool
* one for the SAS pool

### III.3.1. SSD Pool

Add a bucket for the pool SSD:

    pool ssd {
        id -5       # do not change unnecessarily
        alg straw
        hash 0  # rjenkins1
        item osd.0 weight 1.000
        item osd.1 weight 1.000
    }


Add a rule for the bucket nearly created:

    rule ssd {
        ruleset 3
        type replicated
        min_size 1
        max_size 10
        step take ssd
        step choose firstn 0 type osd
        step emit
    }


### III.3.1. SAS Pool

Add a bucket for the pool SAS:

    pool sas {
        id -6       # do not change unnecessarily
        alg straw
        hash 0  # rjenkins1
        item osd.2 weight 1.000
        item osd.3 weight 1.000
    }


Add a rule for the bucket nearly created:

    rule sas {
        ruleset 4
        type replicated
        min_size 1
        max_size 10
        step take sas
        step choose firstn 0 type osd
        step emit
    }


Eventually recompile and inject the new CRUSH map:

```bash
$ crushtool -c ma-crush-map.txt -o ma-nouvelle-crush-map
$ ceph osd setcrushmap -i ma-nouvelle-crush-map
```

## III.3. Create and configure the pools

Create your 2 new pools:

```bash
$ rados mkpool ssd
successfully created pool ssd
$ rados mkpool sas
successfully created pool sas
```

Set the rule set to the pool:

```bash
ceph osd pool set ssd crush_ruleset 3
ceph osd pool set sas crush_ruleset 4
```

Check that the changes have been applied successfully:

```bash
$ ceph osd dump | grep -E 'ssd|sas'
pool 3 'ssd' rep size 2 crush_ruleset 3 object_hash rjenkins pg_num 128 pgp_num 128 last_change 21 owner 0
pool 4 'sas' rep size 2 crush_ruleset 4 object_hash rjenkins pg_num 128 pgp_num 128 last_change 23 owner 0
```

## III.4. Test it

Just create some random files and put them into your object store:

```bash
$ dd if=/dev/zero of=ssd.pool bs=1M count=512 conv=fsync
$ dd if=/dev/zero of=sas.pool bs=1M count=512 conv=fsync
$ rados -p ssd put ssd.pool ssd.pool.object
$ rados -p sas put sas.pool sas.pool.object
```

Where are pg active?

```bash
$ ceph osd map ssd ssd.pool.object
osdmap e260 pool 'ssd' (3) object 'ssd.pool.object' -> pg 3.c5034eb8 (3.0) -> up [1,0] acting [1,0]

$ ceph osd map sas sas.pool.object
osdmap e260 pool 'sas' (4) object 'sas.pool.object' -> pg 4.9202e7ee (4.0) -> up [3,2] acting [3,2]
```

<br />

> CRUSH Rules! As you can see from this article CRUSH allows you to perform amazing things. The CRUSH Map could be very complex, but it brings a lot of flexibility! Happy CRUSH Mapping ;-)
