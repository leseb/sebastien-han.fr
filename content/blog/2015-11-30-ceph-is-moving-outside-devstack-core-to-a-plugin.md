---
title: Ceph is moving outside DevStack core to a plugin
date: 2015-11-30 14:55:00
slug: ceph-is-moving-outside-devstack-core-to-a-plugin
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![](/images/ceph-moving-outside-devstack.jpg)

Ceph just moved outside of DevStack in order to comply with the new DevStack's plugin policy.
The code can be found on [github](https://github.com/openstack/devstack-plugin-ceph).
We now have the chance to be on [OpenStack Gerrit](https://review.openstack.org/#/admin/projects/openstack/devstack-plugin-ceph) as well and thus brings all the good things from the OpenStack infra (a CI).

To use it simply create a `localrc` file with the following:

    enable_plugin ceph https://github.com/openstack/devstack-plugin-ceph

> A more complete `localrc` file can be found on [Github](https://github.com/ceph/ceph-devstack/blob/master/localrc).

<!--more-->
