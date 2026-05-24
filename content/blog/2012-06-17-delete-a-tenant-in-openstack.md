---
title: Delete a tenant in OpenStack
date: 2012-06-14 17:41:00
slug: delete-a-tenant-in-openstack
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

If you are running on OpenStack Essex, you should have some problem to delete a tenant.

<!--more-->

This issue has already been reported [here](https://bugs.launchpad.net/keystone/+bug/991913).
In this context, I need to delete the `pizza!` tenant.

```sql
mysql> USE keytstone;
Database changed
mysql> SELECT * FROM user_tenant_membership;
+----------------------------------+----------------------------------+
| user_id                          | tenant_id                        |
+----------------------------------+----------------------------------+
| 51add2d612eb44fdaa46644bb7aac80c | 071ffb95837e4d509cb7153f21c57c4d |
| 557273155f8243bca38f77dcdca82ff6 | 071ffb95837e4d509cb7153f21c57c4d |
| 557273155f8243bca38f77dcdca82ff6 | 1c50a993806c4a0db1982993a7282cef |
| 8463317e6d7b493bb393128a136656f1 | 1c50a993806c4a0db1982993a7282cef |
| 557273155f8243bca38f77dcdca82ff6 | 520b6689e344456cbb074c83f849914a |
| 8bd2d6ba3e9541e2a3e355b976096cc6 | 520b6689e344456cbb074c83f849914a |
| 8e3d3d8ae188434c98418b35ff1b33f4 | 520b6689e344456cbb074c83f849914a |
| e0c4a110251d419e9d9ed9183ac4ba2a | 520b6689e344456cbb074c83f849914a |
| 557273155f8243bca38f77dcdca82ff6 | d1f5d27ccf594cdbb034c8a4123494e9 |
| 557273155f8243bca38f77dcdca82ff6 | dfb0ef4ab6d94d5b9e9e0006d0ac6706 |
+----------------------------------+----------------------------------+
10 rows in set (0.00 sec)

mysql> SELECT * FROM tenant;
+----------------------------------+---------+----------------------------------------------+
| id                               | name    | extra                                        |
+----------------------------------+---------+----------------------------------------------+
| 071ffb95837e4d509cb7153f21c57c4d | stone   | {"enabled": true, "description": "test"} |
| 1c50a993806c4a0db1982993a7282cef | pizza   | {"enabled": false, "description": "pizza!"}  |
| 520b6689e344456cbb074c83f849914a | service | {"enabled": true, "description": null}       |
| d1f5d27ccf594cdbb034c8a4123494e9 | admin   | {"enabled": true, "description": null}       |
| dfb0ef4ab6d94d5b9e9e0006d0ac6706 | demo    | {"enabled": true, "description": "demo"}     |
+----------------------------------+---------+----------------------------------------------+
5 rows in set (0.00 sec)

mysql> DELETE FROM user_tenant_membership WHERE tenant_id='1c50a993806c4a0db1982993a7282cef';
Query OK, 2 rows affected (0.02 sec)
```

Almost done, this project is associated to a network so we need to update the database and set a `NULL` flag:

```bash
$ sudo nova-manage network list
id   	IPv4              	IPv6           	start address  	DNS1           	DNS2           	VlanID         	project        	uuid           
13   	192.168.22.32/27  	None           	192.168.22.35  	None           	None           	1              	d1f5d27ccf594cdbb034c8a4123494e9	3a96c0fa-e724-4e23-b65a-555b8dc98c1f
16   	192.168.22.64/27  	None           	192.168.22.67  	None           	None           	2              	071ffb95837e4d509cb7153f21c57c4d	53849e06-da52-4a28-918d-776ab99193e3
18   	192.168.22.96/27  	None           	192.168.22.99  	None           	None           	3              	1c50a993806c4a0db1982993a7282cef	c8ee58f6-85fd-4f72-bd3e-ac6c56869b3f
```

```sql
mysql> USE nova;
Database changed
mysql> UPDATE networks SET project_id='NULL' WHERE project_id='1c50a993806c4a0db1982993a7282cef';
```

```bash
$ sudo nova-manage network list
id   	IPv4              	IPv6           	start address  	DNS1           	DNS2           	VlanID         	project        	uuid           
13   	192.168.22.32/27  	None           	192.168.22.35  	None           	None           	1              	d1f5d27ccf594cdbb034c8a4123494e9	3a96c0fa-e724-4e23-b65a-555b8dc98c1f
16   	192.168.22.64/27  	None           	192.168.22.67  	None           	None           	2              	071ffb95837e4d509cb7153f21c57c4d	53849e06-da52-4a28-918d-776ab99193e3
18   	192.168.22.96/27  	None           	192.168.22.99  	None           	None           	3              	None           	c8ee58f6-85fd-4f72-bd3e-ac6c56869b3f
```

> Et voilà!
