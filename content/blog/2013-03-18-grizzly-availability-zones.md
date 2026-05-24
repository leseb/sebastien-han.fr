---
title: Grizzly availability zones
date: 2013-03-18 00:09:00
slug: grizzly-availability-zones
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Short short update.

<!--more-->

I previously wrote an article about [OpenStack and availability zones](http://www.sebastien-han.fr/blog/2013/01/24/openstack-nova-play-with-availability-zones/), unfortunately the full potential wasn't entirely explored in Folsom, at least clients weren't able to see the AZ available. The command finally landed in Grizzly.

```bash
$ nova availability-zone-list
+------+-----------+
| Name | Status    |
+------+-----------+
| nova | available |
| ssd  | available |
| sata | available |
+------+-----------+
```

Update with the host aggregate. I won't go to far with it since there are already some blogs explaining it and also the official doc. Thus just a quick setup.

<span class="text_quote">W </span> **Note: Admin API only**

First create 2 zones:

```bash
$ nova aggregate-create test-aggregate2 toto
+----+-----------------+-------------------+-------+----------+
| Id | Name            | Availability Zone | Hosts | Metadata |
+----+-----------------+-------------------+-------+----------+
| 2  | test-aggregate2 | toto              |       |          |
+----+-----------------+-------------------+-------+----------+
$ nova aggregate-create test-aggregate blabla
+----+----------------+-------------------+-------+----------+
| Id | Name           | Availability Zone | Hosts | Metadata |
+----+----------------+-------------------+-------+----------+
| 3  | test-aggregate | blabla            |       |          |
+----+----------------+-------------------+-------+----------+
```

Get your host list:

```bash
$ nova host-list
+-----------+-------------+----------+
| host_name | service     | zone     |
+-----------+-------------+----------+
| openstack | conductor   | internal |
| openstack | compute     | blabla   |
| openstack | cert        | internal |
| openstack | scheduler   | internal |
| openstack | consoleauth | internal |
| nfs       | compute     | blabla   |
+-----------+-------------+----------+
```

Then attach the host to the aggregate:

```bash
$ nova aggregate-add-host 3 openstack
Aggregate 3 has been successfully updated.
+----+----------------+-------------------+----------------+-----------------------------------+
| Id | Name           | Availability Zone | Hosts          | Metadata                          |
+----+----------------+-------------------+----------------+-----------------------------------+
| 3  | test-aggregate | blabla            | [u'openstack'] | {u'availability_zone': u'blabla'} |
+----+----------------+-------------------+----------------+-----------------------------------+

$ nova aggregate-add-host 2 nfs
Aggregate 2 has been successfully updated.
+----+-----------------+-------------------+----------+---------------------------------+
| Id | Name            | Availability Zone | Hosts    | Metadata                        |
+----+-----------------+-------------------+----------+---------------------------------+
| 2  | test-aggregate2 | toto              | [u'nfs'] | {u'availability_zone': u'toto'} |
+----+-----------------+-------------------+----------+---------------------------------+
```

List all the aggregate:

```bash
$ nova aggregate-list
+----+-----------------+-------------------+
| Id | Name            | Availability Zone |
+----+-----------------+-------------------+
| 2  | test-aggregate2 | toto              |
| 3  | test-aggregate  | blabla            |
+----+-----------------+-------------------+
```

Enventually list the AZ.
Admin API sees:

```bash
$ nova availability-zone-list
+-----------------------+----------------------------------------+
| Name                  | Status                                 |
+-----------------------+----------------------------------------+
| internal              | available                              |
| |- openstack          |                                        |
| | |- nova-conductor   | enabled :-) 2013-07-09T09:47:29.000000 |
| | |- nova-consoleauth | enabled :-) 2013-07-09T09:47:38.000000 |
| | |- nova-scheduler   | enabled :-) 2013-07-09T09:47:30.000000 |
| | |- nova-cert        | enabled :-) 2013-07-09T09:47:34.000000 |
| blabla                | available                              |
| |- openstack          |                                        |
| | |- nova-compute     | enabled :-) 2013-07-09T09:47:29.000000 |
| toto                  | available                              |
| |- nfs                |                                        |
| | |- nova-compute     | enabled :-) 2013-07-09T09:47:38.000000 |
+-----------------------+----------------------------------------+
```

Enventually list the AZ.
Client API sees:

```bash
$ nova availability-zone-list
+--------+-----------+
| Name   | Status    |
+--------+-----------+
| blabla | available |
| toto   | available |
+--------+-----------+
```
