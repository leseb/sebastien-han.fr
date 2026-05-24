---
title: "Openstack: quickly fix mirrored queues errors"
date: 2013-04-09 22:10:00
slug: openstack-quickly-fix-mirrored-queues-errors
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Openstack: quickly fix mirrored queues errors](/images/fix-mirrored-queues.jpg)

Just started with Grizzly and already been through some minor issues :).

<!--more-->

After a fresh installation, while trying to start all the Nova services, I came across the following error from the logs. See below the scheduler logs:

    TRACE nova AMQPChannelException: (406, u"PRECONDITION_FAILED - inequivalent arg 'x-ha-policy'for queue 'scheduler' in vhost '/':
    received the value 'all' of type 'longstr' but current is none", (50, 10), 'Channel.queue_declare')

This error is quite explicit and **not related to OpenStack**. Somehow a queue with the same name was already living in this vhost, for which the x-ha-policy was set to `none` thus while I restarted the nova-scheduler, it reclared the queue with a different policy like so `x-ha-policy: all`. At the end, we need to purge all the queues to avoid any conflicts.

Quick fix:

```bash
$ sudo rabbitmqctl stop_app
$ sudo rabbitmqctl reset
$ sudo rabbitmqctl start_app
```

Bonus, this how to enable the mirrored queues in your `nova.conf`:

    rabbit_hosts = <ip-rabbit-server1>:5672,<ip-rabbit-server2>:5672
    rabbit_ha_queues = True

RabbitMQ needs to be confirmed in clustering mode, see [RabbitMQ official documentation](http://www.rabbitmq.com/clustering.html).

<br />

> Enjoy your mirrored queues :D
