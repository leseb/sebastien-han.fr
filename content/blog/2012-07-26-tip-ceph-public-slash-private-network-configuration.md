---
title: "Tip Ceph: public/private network configuration"
date: 2012-07-29 23:50:00
slug: tip-ceph-public-slash-private-network-configuration
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph network](/images/ceph-network.jpg)

While strolling within the ceph mailing list, I came accross something really useful, something that I was looking for :)

<!--more-->

Basically when you build your cluster, you want to build the storage part in a private network for some reason like speed (put 10GB network) and isolation to the public network. In a Ceph use case, you would certainly want to let the OSDs on a private network and only put the monitor addresses on the public network in order to make them available to your public/client network. In the example below I assume that you have 2 separate networks:

* Private network `eth1` : 10.0.0.0/8
* Public network `eth0` : 172.16.0.0/16

Edit your `ceph.conf`, I only show the **[OSD]** section:

	[osd]
	...
	cluster network = 10.0.0.0/8
	public network = 172.16.0.0/16
	
	[osd.0]
    public addr = 172.16.0.1:6801
	cluster addr = 10.0.0.1
	...
	
	[osd.1]
    public addr = 172.16.0.2:6802
	cluster addr = 10.0.0.2
	...
	
	[osd.2]
    public addr = 172.16.0.3:6803
	cluster addr = 10.0.0.3
	...


<span class="text_quote">W  </span>** Don't forget to replicate the configuration accross all your storage nodes.**

<br />

> In practice you can make those changes on the fly only if your monitor's addresses remain in the public network. The only thing here is to put the OSDs on a private network, edit the ceph's configuration and simply restart all the OSDs one by one. No major problems have been encountered in the use of this manipulation. The internal replication operates by the OSDs will run on the private/dedicated network around the 6801 port.
