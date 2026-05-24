---
title: "Ceph: change PG number on the fly"
date: 2013-03-12 21:11:00
slug: ceph-change-pg-number-on-the-fly
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: change PG number on the fly](/images/ceph-increase-pgs-num.jpg)

A Placement Group (PG) aggregates a series of objects into a group, and maps the group to a series of OSDs. A common mistake while creating a pool is to use the `rados` command which by default creates a pool of 8 PGs. Sometime you don't properly know how to set this value thus you use the `ceph` command but put an extremely high value for it. Both case are bad and could lead to some unfortunate situations. In this article, I will explore some methods to work around this major problem.

<!--more-->

**ONLY FOR VERSION PRIOR TO 0.61:**

Short and **experimental** solution, you **should not** use, please just note that this command has just been implemented so running it could result in data loss. Currently some patches are set in review so this command **is not stable** yet. If you really want to try it, I suggest to play with **only against a test cluster**, so once again **DON'T TRY THIS ON A PRODUCTION CLUSTER**, merci :-).

<br />

**FOR VERSION FROM 0.61 AND ABOVE:**

Perfectly safe.

```bash
$ ceph osd pool set <poolname> pg_num <numpgs> --allow-experimental-feature
```

See the example below:

```bash
$ ceph osd pool set monpool pg_num 512 --allow-experimental-feature
set pool 512 pg_num to 512
```

Clean and **perfectly safe** work around:

```bash
$ ceph osd pool create <my-new-pool> <pg_num>
$ rados cppool <my-old-pool> <my-new-pool>
$ ceph osd pool delete <my-old-pool>
$ ceph osd pool rename <my-new-pool> <my-old-pool>
```

<br />

> It's one of the good feature that must be implemented since Ceph is designed to scale under the infinite, the `pg_num` could grow as the cluster does.
