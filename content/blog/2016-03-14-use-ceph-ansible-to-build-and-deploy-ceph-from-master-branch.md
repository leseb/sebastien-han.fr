---
title: Use Ceph Ansible to build and deploy Ceph from master branch
date: 2016-03-14 19:16:00
slug: use-ceph-ansible-to-build-and-deploy-ceph-from-master-branch
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

It is really easy with [ceph-ansible](https://github.com/ceph/ceph-ansible) to deploy a Ceph cluster from its bleeding edge version ([github master branch](https://github.com/ceph/ceph)).

<!--more-->

For the purpose of this exercise, we will choose the 10.0.4 version which corresponds to the latest development branch of Jewel.
Simply edit your `group_vars/all` and uncomment the following:

    ceph_dev: true
    ceph_dev_branch: v10.0.4

Then simply run `vagrant up` and wait a bit...
After a couple of minutes you will get everything deployed and an output similar to this one:

```bash
[root@ceph-mon0 ~]$ sudo ceph -v
ceph version 10.0.4 (ea45099808051017fb05582555f126cba80567b8)
```
