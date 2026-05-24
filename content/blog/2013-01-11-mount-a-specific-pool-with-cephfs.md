---
title: Mount a specific pool with CephFS
date: 2013-02-11 12:20:00
slug: mount-a-specific-pool-with-cephfs
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Mount a specific pool with CephFS](/images/cephfs-mount-pool.jpg)

The title of the article is a bit wrong, but it's certainly the easiest to understand :-).

<!--more-->

First let's create a new pool, and call it `webdata`. Ideally this pool will store web content.

```bash
$ ceph osd create webdata 500
successfully created pool webdata
```

Then grab the pool id:

```bash
$ ceph osd dump | grep webdata
pool 5 'webdata' rep size 2 crush_ruleset 0 object_hash rjenkins pg_num 500 pgp_num 500 last_change 12 owner 0
```

Eventually assign

```bash
$ ceph mds add_data_pool 5
added data pool 5 to mdsmap
```

Mount the Ceph Filesystem:

```bash
$ sudo mount -t ceph 172.17.1.7:/ /srv/mds/pools/webdata
```

Check the layout of the directory, as we can see the pool with the id 0 has been assigned by default to. This pool corresponds to the default pool called `data`. By setting a new layout, we will change the default pool by the one we created before.

```bash
$ cephfs /srv/mds/pools/webdata/ show_layout
layout.data_pool:     0
layout.object_size:   4194304
layout.stripe_unit:   4194304
layout.stripe_count:  1

$ cephfs /srv/mds/pools/webdata/lol/ set_layout -p 5 -u 4194304 -c 1 -s 4194304

$ cephfs /srv/mds/pools/webdata/lol/ show_layout
layout.data_pool:     5
layout.object_size:   4194304
layout.stripe_unit:   4194304
layout.stripe_count:  1
```

Unmount and mount the Ceph Filesystem:

```bash
$ sudo umount /srv/mds/pools/webdata 
$ sudo mount -t ceph 172.17.1.7:/ /srv/mds/pools/webdata
$ sudo touch /srv/mds/pools/webdata/marche
```

Oh! There are objects in there!

```bash
$ rados --pool=webdata ls
10000000008.00000000
10000000008.00000001
10000000008.00000002
10000000008.00000003
10000000008.00000004

$ ll /srv/mds/pools/webdata
total 18436
drwxr-xr-x 1 root root 18874368 Jan 11 13:51 ./
drwxr-xr-x 3 root root     4096 Jan 11 12:19 ../
-rw-r--r-- 1 root root 18874368 Jan 11 13:51 marche
```

<br />

References:

* [http://ceph.com/docs/master/man/8/mount.ceph/](http://ceph.com/docs/master/man/8/mount.ceph/)
* [http://ceph.com/docs/master/man/8/cephfs/](http://ceph.com/docs/master/man/8/cephfs/)
* [http://comments.gmane.org/gmane.comp.file-systems.ceph.devel/6148](http://comments.gmane.org/gmane.comp.file-systems.ceph.devel/6148)
