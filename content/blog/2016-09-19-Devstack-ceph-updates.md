---
title: Devstack Ceph updates
date: 2016-09-19 09:31:33
slug: Devstack-ceph-updates
draft: false
categories: []
tags: []
---

![Devstack Ceph updates](/images/devstack-ceph-updates.jpg)

For the last three months we got some really nifty new features on the Ceph Devstack plugin.

<!--more-->

I am really exited to share this list with you:

* Support for systemd, which brings a wider variety of operating system support such as Ubuntu 16.04, Fedora 23 and 24, RHEL 7, CentOS 7.
* Support for new Ceph releases up to Jewel, prior to this change only Hammer was supported.
* Deploy Ceph Metadata server for CephFS.
* CephFS Manila support, you can deploy Manila with the CephFS driver.
* Keystone version 3 support for Rados Gateway, Jewel can connect to a Keystone v3 API and grant access to serve the REST API.
* Deploy Rados Gateway as a Glance backend, you can use Rados Gateway as a replacement for S3 already but now you can use it to store Glance images

<br />

> If you are looking at using the ceph plugin for devstack you can start with [this repository](https://github.com/ceph/ceph-devstack) that will guide you through the procedure.
