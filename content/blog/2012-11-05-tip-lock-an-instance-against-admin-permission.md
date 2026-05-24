---
title: "Tip: lock an instance against admin permissions"
date: 2012-11-07 00:38:00
slug: tip-lock-an-instance-against-admin-permission
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![lock an instance against admin permission](/images/openstack-lock-vm.jpg)

Couple of days ago I was looking for a way to lock an instance but something more powerful than a simple lock via the nova API.

<!--more-->

First of all, an option already exists in the API, you can call it from like so:

```bash
$ nova list
+--------------------------------------+--------+--------+------------------+
| ID                                   | Name   | Status | Networks         |
+--------------------------------------+--------+--------+------------------+
| e1e311b2-9dc5-4290-bd53-ab3a149b4849 | door   | ACTIVE | test=10.100.1.6  |
+--------------------------------------+--------+--------+------------------+

$ nova lock door
$ nova delete door
ERROR: Instance is in an invalid state for 'delete' (HTTP 409) (Request-ID: req-a493c8b7-2f90-488f-9224-8fcc1135794a)
```

Howeverer this doens't work when the **admin user** performs a termination, which makes sense. But in a last hope I looked into the nova database within the instance table. I came across a row called `disable_terminate`, which eventually did the trick! To enable it you have to update the row:

```sql
mysql> UPDATE SET disable_terminate = '1' FROM instances WHERE uuid = 'e1e311b2-9dc5-4290-bd53-ab3a149b4849';
Query OK, 1 row affected (0.03 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

<br />

> Unfortunately I didn't find any command to use this option, neither on `nova` nor `nova-manage`. I think it's pretty (but I might have missed something...) since apparently the row was also present in Essex. Anyway that one really saved me!
