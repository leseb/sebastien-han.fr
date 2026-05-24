---
title: Why should you use Galera?
date: 2012-09-03 10:52:00
slug: why-you-should-use-galera
draft: false
categories: ["galera"]
tags: ["galera"]
---

![Why should you use Galera?](/images/galera-pros.jpg)

Why should you use Galera instead of the classical MySQL replication!

<!--more-->

Some reasons:

* Galera is multi-master, NO SPOF!
* Galera is synchronous, MySQL is asynchronous. MySQL 5.5 seems to be half-sync. Which implies no latency from the other nodes
* Galera is multi-threaded, MySQL is single-threaded
* Galera is easy-to-scale, MySQL needs to be configured manually
* Galera accepts writes and reads to any node, which brings tremendous performance
* Galera doesn't need pacemaker, no failover, etc...
* Galera works nice with WAN replication
* Automatic membership control (TOTEM protocol)
* No slave lag
* No binlog position to set
* Mix well with load-balancer: HAProxy, pen, GLB, LVS...
* Percona repos available


Not everything's perfect like:

* Galera **only** supports InnoDB engine, pass this one.
* The MySQL version is patched
* Require at least 3 nodes (true limitation?), 2 nodes + garbd is also ok

<br />

>If you are still not convinced, give a try!
