---
title: "Ceph: maintenance mode, use case and common operations"
date: 2012-08-17 12:33:00
slug: ceph-storage-node-maintenance
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: maintenance mode, use case and common operations](/images/ceph-maintenance.jpg)

Quick tips about how to manage a production environement. A simple use case here put your ceph journal on a SSD on a production cluster while clients are writting.

<!--more-->

This is the current state of the cluster:

```bash
$ ceph osd tree
dumped osdmap tree epoch 655
# id    weight  type name   up/down reweight
-1  3   pool default
-3  3       rack unknownrack
-2  1           host ceph01
0   1               osd.0   up  1   
-4  1           host ceph02
1   1               osd.1   up  1   
-5  1           host ceph03
2   1               osd.2   up  1
```

Let's say that you just bought a SSD, and you want to put your ceph journal in it. Your cluster is in production, clients are writting data. So you can't simply stop your OSD and replace everything. Otherwise the cluster will detect a failure and start to recover. Assuming that you want to perform a maintenance action on the OSD 2. You should marked it as out, which means assigning a weight of 0 to the OSD.


```bash
$ ceph osd set noout
set noout
```

You immediatly notice that the status changed. After this you can easily bring down your OSD. PGs will get a degraded state because the `noout` option prevents the OSD to be marked out of the cluster. Because of this, the PG replica count can't be properly honored anymore. See the example bellow:

      health HEALTH_WARN 54 pgs degraded; 54 pgs stuck unclean; 1/3 in osds are down; noout flag(s) set

```bash
$ sudo service ceph stop osd.2
=== osd.0 === 
Stopping Ceph osd.2 on ceph03...kill 26562...done
```

Check the CRUSH tree:

```bash
$ ceph osd tree
dumped osdmap tree epoch 655
# id    weight  type name   up/down reweight
-1  3   pool default
-3  3       rack unknownrack
-2  1           host ceph01
0   1               osd.0   up  1···
-4  1           host ceph02
1   1               osd.1   up  1···
-5  1           host ceph03
2   1               osd.2   down  1
```

The cluster will show you a degraded state which is normal since one OSD is now marked as out and down. Anyway the cluster won't attempt any recovery. After that flush the content of your journal, to commit pending transactions to the backend filesystem:

```bash
$ ceph-osd -i 2 --flush-journal
2012-08-16 13:27:10.198405 7fb7541bc780 -1 flushed journal /journal/journal for object store /srv/ceph/osd2
```

Do whatever you want with the previous journal... Mount your SSD:

```bash
$ sudo mount /dev/sdc /journal
```

Finally create a new journal, if you don't specify any path ceph will use the path inside your configuration file:

```bash
$ ceph-osd -i 2 --mkjournal 
2012-08-16 13:29:58.735095 7ff0c4b58780 -1 created new journal /journal/journal for object store /srv/ceph/osd2
```

Restart your OSD and change his status:

```bash
$ sudo service ceph start osd.2
=== osd.2 === 
Starting Ceph osd.2 on ceph03...
starting osd.2 at :/0 osd_data /srv/ceph/osd2 /journal/journal
```

**Finally unset the `noout` value.**

```
$ ceph osd unset noout
unset noout
```

Everything should be normal:

```
$ ceph osd tree
dumped osdmap tree epoch 670
# id    weight  type name   up/down reweight
-1  3   pool default
-3  3       rack unknownrack
-2  1           host ceph01
0   1               osd.0   up  1   
-4  1           host ceph02
1   1               osd.1   up  1   
-5  1           host ceph03
2   1               osd.2   up  1   
```

<br />

> Enjoy the velocity of your journal within your SSD! Note that those manipulations are also valid for update/upgrade and common maintenance tasks.
