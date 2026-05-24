---
title: Simply audit a pacemaker based cluster
date: 2012-04-27 09:35:00
slug: simply-audit-a-pacemaker-based-cluster
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

![Pacemaker audit](/images/pacemaker-audit.png)

Simply audit a cluster platform based on pacemaker.

<!--more-->

I. Put a node on standby
------------------------

First of all test, the basic one:

```bash
$ sudo crm node standby [your-node]
```

II. Stop the corosync daemon
----------------------------

The one should be automatically re-start by pacemaker, of course we don't want to do this gracefully:

```bash
$ sudo kill -9 [corocync-process]
```

III. Stop the network
---------------------

```bash
$ sudo service networking stop
```

Or disable the interface linked between the nodes (heartbeat link). Be aware that you volontary create a split-brain situation here:

```bash
$ sudo ifdown eth1
```

Or un-plug the wire :D


IV. Reboot the server
---------------------

The gracefully way:

```bash
$ sudo reboot 
```

V. Ungracefully shutdown or reboot the server 
---------------------------------------------

Here we are going to use the magic SysRq keys.

**The is a very bad treatment for the system and the server but it's the most relevant system failure simulation. The best way the simulate a real unexpected system crash:**

* `b` will immediately reboot the system without syncing or unmounting your disks.

```bash
$ echo b > /proc/sysrq-trigger
```

* `c` will perform a system crash by a NULL pointer dereference.

```bash
$ echo c > /proc/sysrq-trigger
```

Et voilà!
