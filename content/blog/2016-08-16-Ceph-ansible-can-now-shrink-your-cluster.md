---
title: Ceph ansible can now shrink your cluster
date: 2016-08-16 14:23:20
slug: Ceph-ansible-can-now-shrink-your-cluster
draft: false
categories: ["ansible"]
tags: ["ansible", "ceph"]
---

![Ceph ansible can now shrink your cluster](/images/ceph-ansible-shrink-cluster.jpg)

Ceph ansible is quickly catching up with ceph-deploy in terms of features.
Last week, I was discussing the [dm-crypt support](http://www.sebastien-han.fr/blog/2016/08/09/Ceph-ansible-now-supports-dmcrypt/).
The ability to shrink a Ceph cluster, removing one or N monitors/OSDs wasn't possible until very recently.
Let's have a look at this new feature.

<!--more-->

I recently merged [two new playbooks](https://github.com/ceph/ceph-ansible/pull/929), one to shrink monitors and one to shrink OSDs.
I've found that doing both in the same playbook can be a bit confusing.
Even if a lot portions of those are identical I thought I would make more sense to separate both for several reasons:

* it is rare/uncommon to remove mon(s) and osd(s), in this case you might looking for the [purge-cluster](https://github.com/ceph/ceph-ansible/blob/master/purge-docker-cluster.yml) playbook.
* this remains a tricky process so to avoid any overlap we keep things separated

Before running the shrink cluster playbook:

    cluster 4c616836-8b43-4dd0-be24-1cdefa07a1fe
     health HEALTH_WARN
            clock skew detected on mon.ceph-mon-02, mon.ceph-mon-03
            Monitor clock skew detected
     monmap e1: 3 mons at {ceph-mon-01=172.16.41.28:6789/0,ceph-mon-02=172.16.41.63:6789/0,ceph-mon-03=172.16.41.67:6789/0}
            election epoch 6, quorum 0,1,2 ceph-mon-01,ceph-mon-02,ceph-mon-03
      fsmap e3: 0/0/1 up
     osdmap e35: 7 osds: 7 up, 7 in
            flags sortbitwise
      pgmap v3885: 320 pgs, 3 pools, 0 bytes data, 0 objects
            271 MB used, 132 GB / 132 GB avail
                 320 active+clean

<br />

## Shrinking monitors

Let's say I want to remove monitor: ceph-mon-02, I would need to run the following command:

```bash
$ ansible-playbook shrink-mon.yml -e ireallymeanit=yes -e mon_host=ceph-mon-02
Are you sure you want to shrink the cluster? [no]: yes
```

**Obviously, the appropriate name resolution must be in place in order to reach `ceph-mon-02`**.
The playbook tests this, so if we can not resolve it, we stop and fail the playbook.


<br />

## Shrinking OSDs

Object storage daemon are a bit trickier, ceph's admin key is needed on each OSD node to perform this operation.
It is common knowledge and known best practice that the admin should not be present on OSD nodes, and this for security reasons.
The goal of the playbook is not to disrupt your environment, thus it will check if the key is present on the OSD nodes, if not, then we fail and then you will have to copy the admin key on the appropriate nodes.

**So remember, prior to start the playbook, make sure the admin key is present on the OSD nodes and obviously do not forget to remove it when finished.**

Here is my OSDs tree:

    ID WEIGHT  TYPE NAME            UP/DOWN REWEIGHT PRIMARY-AFFINITY
    -1 0.12946 root default
    -2 0.05548     host ceph-osd-01
     0 0.01849         osd.0             up  1.00000          1.00000
     3 0.01849         osd.3             up  1.00000          1.00000
     6 0.01849         osd.6             up  1.00000          1.00000
    -3 0.03699     host ceph-osd-02
     2 0.01849         osd.2             up  1.00000          1.00000
     5 0.01849         osd.5             up  1.00000          1.00000
    -4 0.03699     host ceph-osd-03
     1 0.01849         osd.1             up  1.00000          1.00000
     4 0.01849         osd.4             up  1.00000          1.00000

I want to remove OSD 6 so I'm running the playbook like this:

```bash
$ ansible-playbook shrink-osd.yml -e osd_ids=6
Are you sure you want to shrink the cluster? [no]: yes
```


<br />

> I believe, this last patch concludes the series of catch from ceph-deploy to ceph-ansible. With that we know have a complete feature parity.
