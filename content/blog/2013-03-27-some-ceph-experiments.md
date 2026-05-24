---
title: Some Ceph experiments
date: 2013-04-17 22:22:00
slug: some-ceph-experiments
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Some Ceph experiments](/images/ceph-experiment.png)

Sometimes it's just funny to experiment the theory, just to notice "oh well it works as expected". This is why today I'd like to share some experiments with 2 really specific flags: `noout` and `nodown`. Behaviors describe in the article are well known because of the design of Ceph, so don't yell at me: 'Tell us something we don't know!', simply see this article a set of exercises that demonstrate some Ceph internal functions :-).

<!--more-->

# I. What do they do?

Flags definitions:

* `noout`: an OSD marked as `out` means that it might be running but doesn't actually receive any data since it's not part of the CRUSH Map (opposite of being marked `in`). Thus the option `noout` prevents OSDs from being marked `out` of the cluster.
* `nodown`: an OSD marked as `down` means that it's unresponsive to the health check of its peers, thus a weight of 0 is put and the OSD won't receive any data, this prevents clients from writing to it. However, note that the OSD is still part of the CRUSH map. At the end using the `nodown` option forces all the OSD to always remain with a weight of 1 (something else, but Ceph won't change the set value).

<br />

# II. Experiments

## II.1. noout on a running cluster

It's interesting to look at the PG behavior. Example sample with the PG number 3.4::

```bash
$ ceph pg dump | egrep ^3.4
3.4 0 0 0 0 0 0 0 active+clean  2013-03-27 18:20:33.847308  0'0 57'10 [1,4] [1,4] 0'0 2013-03-27 18:20:33.847246  0'0 2013-03-27 18:20:33.847246
```

We can see that the primary OSD of the pg number 3.4 is the `osd.1` thanks to the field 'active' with [1,4], where the first active OSD represents the primary OSD.

Then apply the flag:

```bash
$ ceph osd set noout
set noout
```

You get notified from the cli:

```bash
$ ceph -s
   health HEALTH_WARN noout flag(s) set
   monmap e3: 3 mons at {0=192.168.252.10:6789/0,1=192.168.252.11:6789/0,2=192.168.252.12:6789/0}, election epoch 14, quorum 0,1,2 0,1,2
   osdmap e63: 6 osds: 6 up, 6 in
   pgmap v285: 200 pgs: 200 active+clean; 20480 KB data, 391 MB used, 23452 MB / 23844 MB avail
   mdsmap e1: 0/0/1 up
```

Just recall that OSD can have different states depending on the object:

* primary: it manages
    * replication to secondary OSDs
    * data re-balancing
    * recovery from failure
    * data consistency (scrubbing operations)

* secondary:
    * acts as a slave from the primary and receives order from it

Then stop the primary OSD:

```bash
$ sudo service ceph stop osd.1

$ ceph pg dump | egrep ^3.4
3.4 0 0 0 0 20971520  595 595 active+degraded 2013-03-27 18:29:52.215491  61'5  60'20 [4] [4] 0'0 2013-03-27 18:20:33.847246  0'0 2013-03-27 18:20:33.847246
```

Now only the OSD 4 is active and switch to primary for this PG, this one will receive all the IO operations. Under normal circonstances (and because the init script does it), the OSD should be marked as out automatically. Then a new secondary OSD will be elected.

Create an object and it into RADOS:

```bash
$ dd if=/dev/zero of=seb bs=10M count=2
2+0 records in
2+0 records out
20971520 bytes (21 MB) copied, 0.0386746 s, 542 MB/s

$ sync

$ rados put seb seb
```

Yes it's there inside osd.4 (as expected):

```bash
$ sudo ls /var/lib/ceph/osd/osd.4/current/3.4_head/
seb__head_3E715054__3
```

Obviously you won't find anything in the old primary OSD (1). Of course a pg dump confirms that we have one object (second field):

```bash
$ ceph pg dump | egrep ^3.4
3.4 1 0 1 0 20971520  595 595 active+degraded 2013-03-27 18:29:52.215491  61'5  60'20 [4] [4] 0'0 2013-03-27 18:20:33.847246  0'0 2013-03-27 18:20:33.847246
```

Now restart the OSD process and unset the noout value:

```bash
$ sudo service ceph start osd.1

$ ceph osd unset noout
unset noout
```

OSD 1 will get re-promoted as primary, OSD 4 as secondary and the object will be replicated from osd.4 to osd.1. A new pg dump can attest this:

```bash
$ ceph pg dump | egrep ^3.4
3.4 1 0 0 0 20971520  595 595 active+clean  2013-03-27 18:41:50.970358  61'5  62'20 [1,4] [1,4] 0'0 2013-03-27 18:20:33.847246  0'0 2013-03-27 18:20:33.847246
```

<br />

> Stop and think, ok, what did we learn from this exercise? Well you already might have guess, this flag is ideal to perform maintenance operations. Ok you can't satisfy the wished number of replica but this is a temporary procedure and really like the flexibility that Ceph brings here. Now let's switch to the `nodown`option which is a complete different story.

<br />

## II.2. nodown on a running cluster

Apply the flag:

```bash
$ ceph osd set nodown
set nodown

$ ceph -s
   health HEALTH_WARN nodown flag(s) set
   monmap e3: 3 mons at {0=192.168.252.10:6789/0,1=192.168.252.11:6789/0,2=192.168.252.12:6789/0}, election epoch 14, quorum 0,1,2 0,1,2
   osdmap e66: 6 osds: 6 up, 6 in
   pgmap v294: 200 pgs: 200 active+clean; 20480 KB data, 395 MB used, 23448 MB / 23844 MB avail
   mdsmap e1: 0/0/1 up
```

Create an object and it into RADOS:

```bash
$ dd if=/dev/zero of=baba bs=10M count=2
2+0 records in
2+0 records out
20971520 bytes (21 MB) copied, 0.0428323 s, 490 MB/s

$ sync

$ rados put baba baba
```

Annnnnd the cluster HANG,hanging hanging hanging... !!!!!!

Simply because a way or another the synchronous and the atomicity of the write request can't be satisfied. Either the primary or secondary OSD remain with a weight that makes it available to receive data from clients.

Eventually you end up with the following WARNINGS logs:

    osd.4 [WRN] 1 slow requests, 1 included below; oldest blocked for > 30.211296 secs
    osd.4 [WRN] slow request 30.211296 seconds old, received at 2013-03-27 19:01:58.127010: osd_op(client.4757.0:1 baba [writefull 0~4194304] 3.f9c3dd2e) v4 currently waiting for subops from [1]
    osd.4 [WRN] 1 slow requests, 1 included below; oldest blocked for > 60.235452 secs
    osd.4 [WRN] slow request 60.235452 seconds old, received at 2013-03-27 19:01:58.127010: osd_op(client.4757.0:1 baba [writefull 0~4194304] 3.f9c3dd2e) v4 currently waiting for subops from [1]

That's normal since the OSD is down but appears as up, so the client tries to write the object to it...

However it's interesting to note that stripping model can be easily catch. Here the primary was osd.4 so ok the first 4M was written:

```bash
-rw-r--r--  1 root root 4.0M Mar 27 19:10 baba__head_F9C3DD2E__3
```

From this, it's fairly easy to determine how writes objects. Ceph is writing 4M per 4M blocks and wait, see the following process:

    --> first 4M osd.primary journal --> osd.primary --> osd.secondary journal --> osd.secondary --> second 4M osd.primary journal --> osd.primary --> and so on...

This command will change the behavior to 8M:

```bash
$ rados -b 8388608 put baba baba
```

<br />

> Stop and think, ok, what did we learn from this exercise? Well I might have miss something, thus if one Inktank's fellow is around, I'll be happy to learn the idea behind this option, because I simply can't think about a proper usage of it.

Conclusion:

<br />

> I hope you enjoyed (maybe learn?) from those exercises. The main point of this article was to show that you can easily operate in degraded mode with the `noout` option. For a more technical depth read the [Ceph documentation](http://ceph.com/docs/master/architecture/#how-ceph-clients-stripe-data).
