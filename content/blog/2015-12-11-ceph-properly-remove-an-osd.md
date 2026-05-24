---
title: "Ceph: properly remove an OSD"
date: 2015-12-11 15:21:00
slug: ceph-properly-remove-an-osd
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph properly remove an OSD](/images/ceph-osd-replace-disk.jpg)

Sometimes removing OSD, if not done properly can result in double rebalancing.
The best practice to remove an OSD involves changing the crush weight to 0.0 as first step.

<!--more-->

So in the end, this will give you:

```bash
$ ceph osd crush reweight osd.<ID> 0.0
```

Then you wait for rebalance to be completed.
Eventually completely remove the OSD:

```bash
$ ceph osd out <ID>
$ service ceph stop osd.<ID>
$ ceph osd crush remove osd.<ID>
$ ceph auth del osd.<ID>
$ ceph osd rm <ID>
```

> Et voilà !
