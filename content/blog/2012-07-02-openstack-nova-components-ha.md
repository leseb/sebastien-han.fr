---
title: "OpenStack: Nova components HA"
date: 2012-07-02 00:25:00
slug: openstack-nova-components-ha
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Nova](/images/nova.jpg)

I wrote all the missing resource agents related to the *nova* ecosystem. All the RAs are [available on my Github](https://github.com/leseb/OpenStack-ra). All the 'nova' RAs mainly re-use the structure of the resource agent written by Martin Gerhard Loschwitz from Hastexo. [See here](https://github.com/madkiss/glance/blob/ha/tools/ocf/glance-api).

<!--more-->

# I. Prerequisites

First of all, install the nova components and add **your** `nova.conf` file:

```bash
$ sudo apt-get install novnc nova-cert nova-consoleauth nova-api nova-scheduler -y
```

If you use Ubuntu, you can prevent those upstart services from running at boot. You can use the `.override` file facility for this. For other Linux distro see tools like: `update-rc.d`, `insserv` or `chkconfig`.

```bash
$ sudo echo "manual" > /etc/init/novnc.override
$ sudo echo "manual" > /etc/init/nova-consoleauth.override
$ sudo echo "manual" > /etc/init/nova-scheduler.override
$ sudo echo "manual" > /etc/init/nova-api.override
$ sudo echo "manual" > /etc/init/nova-cert.override
```

Download the resource agents:

```bash
$ sudo mkdir /usr/lib/ocf/resource.d/openstack
$ cd /usr/lib/ocf/resource.d/openstack/
$ sudo wget https://raw.github.com/leseb/OpenStack-ra/master/nova-api
$ sudo wget https://raw.github.com/leseb/OpenStack-ra/master/nova-cert
$ sudo wget https://raw.github.com/leseb/OpenStack-ra/master/nova-consoleauth
$ sudo wget https://raw.github.com/leseb/OpenStack-ra/master/nova-scheduler
$ sudo wget https://raw.github.com/leseb/OpenStack-ra/master/nova-vnc
$ sudo chmod +x *
```

Verify that Pacemaker knows the new RAs by running the following command:

```bash
$ sudo crm ra info ocf:openstack:nova-api
```

<br />

# II. Setup the resources

I will skip the pacemaker installation steps, I assume that Pacemaker is already configured and running. If you just configured a new 2 nodes cluster, you must see this output from the `crm_mon` command:

```bash
$ sudo crm_mon -1
============
Last updated: Thu Jun 21 09:49:48 2012
Last change: Thu Jun 21 09:41:34 2012 via crm_attribute on ha-01
Stack: openais
Current DC: ha-01 - partition with quorum
Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
2 Nodes configured, 2 expected votes
0 Resources configured.
============

Online: [ ha-01 ha-02 ]
```

Since we are going to configure a 2 nodes active/passive cluster, you need to custom some parameters in your pacemaker setup:

* Disable STONITH
* Ignore the quorum policy
* Set the resource stickness to prevent resource failbacks. It's not mandatory but recommended. Don't forget that the stickiness is additive in groups. Every active member of the group will contribute its stickiness value to the group’s total. Here we have 5 resource agents, each resource has a weight of 100, then the group as a whole will prefer its current location with a score of 500.


This can be performed with those commands:

```bash
$ sudo crm configure property stonith-enabled=false
$ sudo crm configure property no-quorum-policy=ignore
$ sudo crm configure rsc_defaults resource-stickiness=500
```

We will start by creating a floating IP address for the cluster:

```bash
$ sudo crm configure primitive p_vip ocf:heartbeat:IPaddr \
    params ip="172.17.1.80" cidr_netmask="24" nic="eth0" \
    op monitor interval="5s"
```

Adapt the different values with your setup. And check the status of your cluster:

```bash
$ sudo crm_mon -1
============
Last updated: Thu Jun 21 10:00:08 2012
Last change: Thu Jun 21 09:41:34 2012 via crm_attribute on ha-01
Stack: openais
Current DC: ha-01 - partition with quorum
Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
2 Nodes configured, 2 expected votes
1 Resources configured.
============

Online: [ ha-01 ha-02 ]

      p_vip     (ocf::heartbeat:IPaddr):        Started ha-01
```

<br />

## II.1. Nova-API

This RA will respectively test if the `nova-api` listens on these ports: 8773,8774,8775,8776. The default options should be enough.

Default usage:

```bash
$ sudo crm configure primitive p_nova_api ocf:openstack:nova-api \
    params config="/etc/nova/nova.conf" \
    op monitor interval="5s" timeout="5s"
```

<br />

## II.2. Nova-Scheduler	| nova-cert | nova-consoleauth

Since both of them have the same internal functionnement (connection to an AMPQ server and to a database server), I will only write one example. Simply change the name of the resource agent. The example below uses `nova-scheduler`.

Default usage:

```bash
$ sudo crm configure primitive p_scheduler ocf:openstack:nova-scheduler \
    params config="/etc/nova/nova.conf" \
    op monitor interval="30s" timeout="30s"
```

Customized usage:

```bash
$ sudo crm configure primitive p_scheduler ocf:openstack:nova-scheduler \
    params config="/home/nova/nova.conf" amqp_server_port="5765" database_server_port="3307" \
    op monitor interval="30s" timeout="30s"
```

If you use Zero-MQ:

```bash
$ sudo crm configure primitive p_scheduler ocf:openstack:nova-scheduler \
    params zeromq="true" \
    op monitor interval="30s" timeout="30s"
```

<br />

## II.3. Nova-vncproxy

The default options should be enough.

Default usage:

```bash
$ sudo crm configure primitive p_novnc ocf:openstack:nova-vnc \
    params config="/etc/nova/nova.conf" \
    op monitor interval="30s" timeout="30s"
```

Customized usage (if you use nova-xvpvncproxy instead of nova-novncproxy for example):

```bash
$ sudo crm configure primitive p_novnc ocf:openstack:nova-vnc \
    params config="/home/nova/nova.conf" console_port="6081" web="/usr/share/novncproxy" \
    op monitor interval="30s" timeout="30s"
```
<br />

>That's all! Feel free to critique, correct, suggest and ask for more features in the comment section or pull a request on my [Github](https://github.com/leseb/OpenStack-ra) ;-)
