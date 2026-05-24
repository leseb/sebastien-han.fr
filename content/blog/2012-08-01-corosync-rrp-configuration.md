---
title: "Corosync: Redundant Ring Protocol"
date: 2012-08-01 22:59:00
slug: corosync-rrp-configuration
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

![Ring Replication Protocol](/images/rrp.jpg)

Putting a Lord of the Rings picture could have been too cliché, so I opted for this... RRP abbreviation stands for Redundant Ring Protocol. A way to achieve HA on top of bonded interface.

<!--more-->

# I. Corosync communication

## I.1. Reminder

Corosync is the messaging layer inside your cluster. It is responsable for several things like:

* Cluster membership and messaging thanks to the Totem Single Ring Ordering and Membership protocol
* Quorum calculation
* Availability manager

## I.2.What do I need?

A lot of:

* Network interfaces, at least 4
* Cables, 4
* Switch ports

For this setup I used 2 networks:

* `eth0`: 10.0.0.0/8
* `eth1`: 172.16.0.0/16

<span class="text_quote">R </span> **You don't necessary need to setup 2 different networks, 2 subnets are also ok.**

<br />

# II. Setup

It's pretty easy to setup. RRP supports various mode of operation:

* Active: both rings will be active, in use 
* Passive: only one of the N ring is in use, the second one will be use only if the first one fails

Make your own choice!

Can I do this on a running cluster? **TOTALLY**

For this put your cluster on maintenance mode, this mode means that pacemaker won't orchestrate your cluster and will put your resource as `unmanaged`. It allows you to perform some critical operations like upgrading corosync. The resources are still running but unmanaged by pacemaker.

```bash
$ sudo crm configure property maintenance-mode=true 
```

The state of your cluster must change with an `unmanaged` flag between parenthesis:

```bash
$ sudo crm_mon -1
============
Last updated: Sat Jul  7 16:09:07 2012
Last change: Sat Jul  7 12:45:31 2012 via cibadmin on node1
Stack: openais
Current DC: node1 - partition with quorum
Version: 1.1.6-3.el6-a02c0f19a00c1eb2527ad38f146ebc0834814558
2 Nodes configured, 2 expected votes
3 Resources configured.
============

Online: [ node2 node1 ]

p_web   (lsb:httpd):    Started node1 (unmanaged)
p_vip   (ocf::heartbeat:IPaddr2):	Started node1 (unmanaged)
p_fs    (ocf::heartbeat:Filesystem):    Started node1 (unmanaged)
```

Before changes:

```bash
$ sudo corosync-cfgtool -s
Printing ring status.
Local node ID 33554442
RING ID 0
	id	= 10.0.0.1
	status	= ring 0 active with no faults
```

Edit your `corosync.conf` with the following:

	totem {
		version: 2
		secauth: on
		threads: 0
		rrp_mode: passive
		interface {
			ringnumber: 0
			bindnetaddr: 10.0.0.0
			mcastaddr: 226.94.1.1
			mcastport: 5405
			ttl: 1
			}
		interface {
			ringnumber: 1
			bindnetaddr: 172.16.0.0
			mcastaddr: 226.94.1.2
			mcastport: 5407
			ttl: 1
		}
	}

You already have the first interface sub-section, the one with the option `ringnumber` set to 0. You just need to:

* enable the rrp mode with the `rrp_mode: passive` option
* add a new interface sub-section with:
    * a new ring number
    * the address of your new network
    * a new multicast address
    * a new multicast port

<span class="text_quote">W </span>**The ringnumber must start at 0.**

<br />

<span class="text_quote">W </span>**Corosync uses two UDP ports mcastport (for mcast receives) and mcastport - 1 (for mcast sends).** By default Corosync uses the mcastport 5405 consequently it will bind to:

* mcast receives: 5405
* mcast sends: 5404

In a redundant ring setup you need to specify a gap here setting 5407 will do the following:

* mcast receives: 5407
* mcast sends: 5406

Restart the corosync daemon **on each** servers:

```bash
[user@node1 ~]$ sudo service corosync restart
Signaling Corosync Cluster Engine (corosync) to terminate: [  OK  ]
Waiting for corosync services to unload:......             [  OK  ]
Starting Corosync Cluster Engine (corosync):               [  OK  ]

[user@node2 ~]$ sudo service corosync restart
Signaling Corosync Cluster Engine (corosync) to terminate: [  OK  ]
Waiting for corosync services to unload:......             [  OK  ]
Starting Corosync Cluster Engine (corosync):               [  OK  ]
```

Multicast addresses and ports:

```bash
$ sudo netstat -plantu | grep 54
udp        0      0 10.0.0.1:5404               0.0.0.0:*                               2016/corosync       
udp        0      0 10.0.0.1:5405               0.0.0.0:*                               2016/corosync       
udp        0      0 226.94.1.1:5405             0.0.0.0:*                               2016/corosync       
udp        0      0 172.16.0.1:5406             0.0.0.0:*                               2016/corosync       
udp        0      0 172.16.0.1:5407             0.0.0.0:*                               2016/corosync       
udp        0      0 226.94.1.2:5407             0.0.0.0:*                               2016/corosync    
```

Check the result:

```bash
[user@node1 ~]$ sudo corosync-cfgtool -s
Printing ring status.
Local node ID 16777226
RING ID 0
	id	= 10.0.0.1
	status	= ring 0 active with no faults
RING ID 1
	id	= 172.16.0.1
	status	= ring 1 active with no faults
```

Check the totem members:

```bash
$ sudo corosync-objctl | grep member
runtime.totem.pg.mrp.srp.members.33554442.ip=r(0) ip(10.0.0.2) r(1) ip(172.16.0.2) 
runtime.totem.pg.mrp.srp.members.33554442.join_count=1
runtime.totem.pg.mrp.srp.members.33554442.status=joined
runtime.totem.pg.mrp.srp.members.16777226.ip=r(0) ip(10.0.0.1) r(1) ip(172.16.0.1) 
runtime.totem.pg.mrp.srp.members.16777226.join_count=1
runtime.totem.pg.mrp.srp.members.16777226.status=joined
```

One more validation using the member's ID:

```bash
$ sudo corosync-cfgtool -a 16777226 -a 33554442
10.0.0.1 172.16.0.1
10.0.0.2 172.16.0.2
```

Finally disable the maintenance mode:

```bash
$ sudo crm configure property maintenance-mode=false
```
The `(unmanaged)` flag from `crm_mon -1` should disappear.

<br />

# III. Break it!

The easiest way to test the rrp mode is to shutdown one of the interface:

```bash
$ sudo ifdown eth0
$ sudo corosync-cfgtool -s
Printing ring status.
Local node ID 16777226
RING ID 0
	id	= 10.0.0.1
	status	= Marking ringid 0 interface 10.0.0.1 FAULTY
RING ID 1
	id	= 172.16.0.1
	status	= ring 1 active with no faults
```

If you go to your crm_mon you will see that your cluster is perfectly running, without outage.

<br />

> Et voilà! The usage of NIC bonding is mandatory for all production environment. Enabling NIC bonding + RRP make your setup 'highly highly' available.
