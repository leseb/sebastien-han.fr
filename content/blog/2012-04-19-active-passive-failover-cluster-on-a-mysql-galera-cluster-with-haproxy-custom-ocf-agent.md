---
title: Active/Passive failover cluster on a MySQL Galera Cluster with HAProxy (custom ocf agent)
date: 2012-04-19 22:36:00
slug: active-passive-failover-cluster-on-a-mysql-galera-cluster-with-haproxy-custom-ocf-agent
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

As promised, I will use a custom ocf agent for managing my HAProxy cluster

![](/images/pacemaker-haproxy.png)

<!--more-->

In this article I assume :

* 2 node with HAProxy up and running
* On each node pacemaker has been installed
* The 2 nodes are connected but only one is configured with the failover resource (VIP)
* STONITH is disable
* Quorum policy is disable
* Prevent auto failback after a node recovery (resource-stickiness like this:)

```
$ sudo crm configure rsc_defaults resource-stickiness=100
```

I will only discribed the ocf agent usage.

# HAProxy OCF agent setup

I'm using the useful Github project from [Russki](https://github.com/russki/cluster-agents)

```
$ sudo wget -O /usr/lib/ocf/resource.d/heartbeat/haproxy http://github.com/russki/cluster-agents/raw/master/haproxy
```

Change the file permissions:

```
$ sudo chmod 755 /usr/lib/ocf/resource.d/heartbeat/haproxy
```

According to the Github configure your resource like this:

```
$ sudo crm configure primitive haproxy ocf:heartbeat:haproxy params conffile=/etc/haproxy/haproxy.cfg op monitor interval=10sec
```

Be sure that the failover resource and HAProxy will stay on the same node:

```
$ sudo crm colocation haproxy-with-failover-ip inf: haproxy failover-ip
```

Be sure that HAProxy will start after the failover resource

```
crm(conf-haproxy)configure# order haproxy-after-failover-ip mandatory: failover-ip haproxy  
```

Using the crm, you should have an output like this:

```
ubuntu@haproxy-node01:~$ sudo crm_mon -1
============
Last updated: Mon Mar 26 20:45:41 2012
Stack: openais
Current DC: haproxy-node02 - partition with quorum
Version: 1.1.5-01e86afaaa6d4a8c4836f68df80ababd6ca3902f
2 Nodes configured, 2 expected votes
2 Resources configured.
============

Online: [ haproxy-node01 haproxy-node02 ]

failover-ip	(ocf::heartbeat:IPaddr2):	Started haproxy-node01
haproxy	(ocf::heartbeat:haproxy):	Started haproxy-node01
```

Enjoy!
