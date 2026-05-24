---
title: "Ceph: inject configuration without restart"
date: 2012-10-22 19:15:00
slug: ceph-inject-configuration-without-restart
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: inject configuration without restart](/images/ceph-inject.jpg)

Usually, you don't always want to restart your daemon everytime you change your configuration. Fortunatly, Ceph supports parameter injection!

<!--more-->

First check the parameter you want to change in your configuration via the admin daemon socket. To learn more about the admin socket, please [refer to my article](http://www.sebastien-han.fr/blog/2012/08/14/ceph-admin-socket/). Let's say I want to enable the RBD caching:

```bash
ceph --admin-daemon /var/run/ceph/ceph-osd.0.asok config show | grep 'rbd_cache_max_dirty_age ='
rbd_cache_max_dirty_age = 0
```

Then inject a change into all the OSDs:

```bash
$ ceph tell osd.* injectargs '--rbd_cache_max_dirty_age = 1'
ok
```

Since we don't want to apply the changes to only one OSD, we use the symbol `*` to spread the new parameter across all the OSDs.

Finally re-check your configuration:

```bash
$ ceph --admin-daemon /var/run/ceph/ceph-osd.0.asok config show | grep 'rbd_cache_max_dirty_age ='
rbd_cache_max_dirty_age = 1
```

<br />

> Of course not everything can be changed, like thread pool sizes. A couple of weeks ago, Sage pushed a branch called wip-tp, that implements this on-fly configuration modification. This is merged into master and will be in v0.53.
