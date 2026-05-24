---
title: Make a volume persistent on reboot
date: 2012-09-07 10:49:00
slug: make-a-rbd-attached-persistent-on-reboot
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Make a RBD attached persistent on reboot](/images/infinity-vol.jpg)

Quick and short introduction to a well known bug in nova-volume. I simply want to point it out because I think it could be useful.

<!--more-->

A couple of weeks ago I made a strange discovery: attached volume doesn't persist after reboot of my instance. I restarted an instance with a RBD device mapped. I did several tests like:

* reboot within the instance: **OK**
* soft reboot with `nova reboot <my-instance>`: **BAD**
* reboot with `nova reboot <my-instance> --hard`: **OK**

Finally I came accross the [bug report on launchpad](https://bugs.launchpad.net/nova/+bug/1012717) (thanks to Dave Spano for the link). And this confirmed what I thought. I would say that a pretty critical bug which really needs to be fixed. It has already been patched for Folsom.

>I truly hope that the code will part of the ESSEX backports.
