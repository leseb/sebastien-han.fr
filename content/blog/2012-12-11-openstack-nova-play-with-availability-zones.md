---
title: OpenStack Nova and availability zones
date: 2013-01-24 17:22:00
slug: openstack-nova-play-with-availability-zones
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack Nova and availability zones](/images/nova-az.jpg)

Availability zone in OpenStack. The main purpose of this article is to play a bit with availability zones.

<!--more-->

<span class="text_quote">W </span> **Note: this is deprecated for Grizzly and only works for Folsom.** For the Grizzly version please refer to: [Grizzly Availability Zones](http://www.sebastien-han.fr/blog/2013/03/18/grizzly-availability-zones),

The good thing with availability zones is that you can manage and isolate different entities in your infrastructure. For instance, if some customers need really fast VMs you can host them on your super expensive compute rack full of SSDs.Then what you can do is boot all the instances of your customer that way:

```bash
$ nova boot bla bla bla --availability-zone <zone>:<compute-node>
```

Everything is managed by this nova flag, and the only thing that you have to do is to define a name for your zone (obviously put something relevant):

    # Availability zone
    node_availability_zone=le_rack_du_seb

You could end up with a similar output:

```bash
$ sudo nova-manage service list
Binary           Host                                 Zone                    Status     State Updated_At
nova-cert        c2-controller-01                     le_rack_du_seb          enabled    :-)   2012-12-11 16:22:56
nova-scheduler   c2-controller-01                     le_rack_du_seb          enabled    :-)   2012-12-11 16:23:32
nova-consoleauth c2-controller-01                     le_rack_du_seb          enabled    :-)   2012-12-11 16:23:32
nova-network     c2-compute-01                        le_rack_du_seb-01       enabled    :-)   2012-12-11 16:23:32
nova-compute     c2-compute-01                        le_rack_du_seb-01       enabled    :-)   2012-12-11 16:23:32
nova-compute     c2-compute-02                        le_rack_du_seb-01       enabled    :-)   2012-12-11 16:23:32
nova-network     c2-compute-02                        le_rack_du_seb-01       enabled    :-)   2012-12-11 16:23:32
nova-compute     c2-compute-03                        le_rack_du_seb-02       enabled    :-)   2012-12-11 16:23:32
nova-network     c2-compute-03                        le_rack_du_seb-02       enabled    :-)   2012-12-11 16:23:32
nova-compute     c2-compute-04                        le_rack_du_seb-02       enabled    :-)   2012-12-11 16:23:32
nova-network     c2-compute-04                        le_rack_du_seb-02       enabled    :-)   2012-12-11 16:23:32
```
<br />

> That's all! As always I hope it helps ;-)
