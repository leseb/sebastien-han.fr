---
title: Configure OpenStack Glance for RBD mirroring
date: 2016-11-02 15:42:17
slug: Configure-OpenStack-Glance-for-RBD-mirroring
draft: false
categories: ["openstack"]
tags: ["openstack", "ceph"]
---

![Configure OpenStack Glance for RBD mirroring](/images/openstack-glance-rbd-mirror.jpg)

Since Ceph Jewel, we have the [RBD mirroring functionality](http://www.sebastien-han.fr/blog/2016/03/28/ceph-jewel-preview-ceph-rbd-mirroring/) and people have been starting using it for multi-site and disaster recovery use cases.
The tool is not perfect but is rock solid, expect many enhancements in the future release such as support for multiple peer and daemons.
From a pure OpenStack perspective, to enable this feature we don't really want to add any code into Glance Store.
The reason is simple, glance's store code looks up for specific Ceph features into the Ceph configuration file itself.
So there is no point of adding a new configuration flag into Glance that says something like `enable_image_journaling`.
The operator will only have to configure Ceph, that's it.

<!--more-->

Simply do the following:

* change your `ceph.conf` and append: `rbd_default_features = 125`
* configure pool mirror on the Glance pool with: `rbd mirror pool enable {pool-name} pool`

As a result every new images will be created with the `journaling` feature.

<br />

> Easy right?
