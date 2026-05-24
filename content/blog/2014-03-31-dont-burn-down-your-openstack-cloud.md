---
title: "Don't burn down your OpenStack cloud"
date: 2014-03-31 00:01:00
slug: dont-burn-down-your-openstack-cloud
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Don't burn down your OpenStack cloud](/images/openstack-qos.jpg)

Managing an OpenStack public cloud can be tough and building it properly is even harder.
You can not predict the workload of your platform, customers do what they want (yes they pay for this!).
So yes, cloud performance are often unpredictable!
Recent studies showed that while running a long-standing benchmark on several cloud platforms, they experienced a performance drop-down of 40% (crazy isn't it?).
However, there are some simple facilities in OpenStack that allow you to have a better control of the resources that you offer to your customers/users.
This is what I am going to briefly explore in this article.

<!--more-->

<br />

There are various ways to address this:

1. Through Nova when you want to control ephemeral disks behavior
    * Using instance flavor properties to restrict bandwidth and IOs [read the manual](http://docs.openstack.org/admin-guide-cloud/content/customize-flavors.html)
2. Through Cinder when you want to control volume disks behavior, I've already described this [in a previous article](http://www.sebastien-han.fr/blog/2013/12/23/openstack-ceph-rbd-and-qos/).

<br />

> These techniques are fairly easy to implement so while building your platform you must established a serious and strict QoS. If you don't do this, you will probably end up with some virtual machines disrupting the service of a whole compute node.
