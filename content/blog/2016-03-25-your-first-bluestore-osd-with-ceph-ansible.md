---
title: Your first Ceph OSD backed by BlueStore with ceph-ansible
date: 2016-03-25 11:41:00
slug: your-first-bluestore-osd-with-ceph-ansible
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

Jewel is just around the corner and the first release candidate just came out yesterday (tagged: v10.1.0).
If you are not familiar with BlueStore yet, checkout my recent article: [Ceph Jewel Preview: A New Store Is Coming, BlueStore](http://www.sebastien-han.fr/blog/2016/03/21/ceph-a-new-store-is-coming/).

<!--more-->

Start by edit your `group_vars/all` with the following content:

    ceph_dev: true
    ceph_dev_branch: v10.1.0
    monitor_interface: <your interface>
    public_network: <your subnet>
    osd_objectstore: bluestore
    ceph_conf_overrides:
      global:
        enable experimental unrecoverable data corrupting features: 'bluestore rocksdb'
        bluestore fsck on mount: true
        bluestore block db size: 67108864
        bluestore block wal size: 134217728
        bluestore block size: 5368709120

Just one more step, jump into `group_vars/osds` and activate the fith OSD scenario using:

    bluestore: true

That's all, now run ansible as usual: `ansible-playbook site.yml`.
Wait a little bit and you should see the following:

```
$ ceph -v
 ceph version 10.1.0 (96ae8bd25f31862dbd5302f304ebf8bf1166aba6)

$ ceph -s
2016-03-25 13:03:31.846668 7f313ad2b700 -1 WARNING: the following dangerous and experimental features are enabled: bluestore,rocksdb
2016-03-25 13:03:31.855052 7f313ad2b700 -1 WARNING: the following dangerous and experimental features are enabled: bluestore,rocksdb
    cluster 179c40e3-8b3e-4ed0-9153-fefd638349a2
     health HEALTH_OK
     monmap e1: 1 mons at {rbd-mirroring-b4dae55c-34e3-4eb6-a84d-1b621af31c75=192.168.0.44:6789/0}
            election epoch 3, quorum 0 rbd-mirroring-b4dae55c-34e3-4eb6-a84d-1b621af31c75
     osdmap e9: 2 osds: 2 up, 2 in
            flags sortbitwise
      pgmap v13: 64 pgs, 1 pools, 0 bytes data, 0 objects
            2052 MB used, 38705 MB / 40757 MB avail
                  64 active+clean
```
