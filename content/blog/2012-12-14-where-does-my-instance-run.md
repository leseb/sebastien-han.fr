---
title: Where does my instance run?
date: 2012-12-20 13:17:00
slug: where-does-my-instance-run
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Where does my instance run?](/images/openstack-where-instance.jpg)

Several way to know where your instances run.

<!--more-->

<br />

# I. Locate your instance

## I.1. Nova-API

Some commands to check where your instances run using the API:

```bash
$ nova hypervisor-list
+----+---------------------+
| ID | Hypervisor hostname |
+----+---------------------+
| 1  | c2-compute-01       |
| 3  | c2-compute-02       |
| 5  | c2-compute-03       |
| 7  | c2-compute-04       |
| 11 | c2-compute-05       |
| 21 | c2-compute-06       |
+----+---------------------+

$ nova hypervisor-servers compute-01
+--------------------------------------+-------------------+---------------+---------------------+
| ID                                   | Name              | Hypervisor ID | Hypervisor Hostname |
+--------------------------------------+-------------------+---------------+---------------------+
| 078f97cf-19e0-440d-aa5c-1234a75a57d3 | instance-000005a2 | 1             | c2-compute-01       |
| 11670529-3cd8-47d3-bda9-2ded5738424f | instance-000006e1 | 1             | c2-compute-01       |
| 28d6e68d-5c99-41b6-a70e-5ef1c0332e89 | instance-00000110 | 1             | c2-compute-01       |
| 2ad16e34-2a9e-4609-b8e5-3712b76bdacf | instance-0000057a | 1             | c2-compute-01       |
| 85bccb9f-95f0-4e02-97fb-4ca82cc0278b | instance-000006a5 | 1             | c2-compute-01       |
| a9d030cf-4b51-4c12-ada6-32710f81f8f6 | instance-00000501 | 1             | c2-compute-01       |
| b3b1f1f3-5ea2-446d-adf5-faac8dee3635 | instance-00000533 | 1             | c2-compute-01       |
| b8f329dd-0f51-4272-a029-8a7d5869471c | instance-000003ad | 1             | c2-compute-01       |
+--------------------------------------+-------------------+---------------+---------------------+
```

It also works with `nova list`:

```bash
$ nova list --host c2-compute-01
+--------------------------------------+--------------------------------------+--------+------------------------------------+
| ID                                   | Name                                 | Status | Networks                           |
+--------------------------------------+--------------------------------------+--------+------------------------------------+
| b8f329dd-0f51-4272-a029-8a7d5869471c | web02                                | ACTIVE | 20web=10.100.20.8, 172.20.20.12    |
| a9d030cf-4b51-4c12-ada6-32710f81f8f6 | web05                                | ACTIVE | 20web=10.100.20.17, 172.20.20.15   |
| b3b1f1f3-5ea2-446d-adf5-faac8dee3635 | web09                                | ACTIVE | 20web=10.100.20.22, 172.20.20.19   |
| 2ad16e34-2a9e-4609-b8e5-3712b76bdacf | web05                                | ACTIVE | 20web=10.100.20.27, 172.20.20.25   |
| 078f97cf-19e0-440d-aa5c-1234a75a57d3 | web09                                | ACTIVE | 20web=10.100.20.31, 172.20.20.29   |
| 85bccb9f-95f0-4e02-97fb-4ca82cc0278b | web17                                | ACTIVE | 20web=10.100.20.42, 172.20.20.37   |
| 11670529-3cd8-47d3-bda9-2ded5738424f | web23                                | ACTIVE | 20web=10.100.20.48, 172.20.20.43   |
| 28d6e68d-5c99-41b6-a70e-5ef1c0332e89 | f34d8f7170034280a42f6318d1a4af34-vpn | ACTIVE | 20web=10.100.20.12                 |
+--------------------------------------+--------------------------------------+--------+------------------------------------+
```

## I.2. Nova-manage

Some commands to check where your instances run using the `nova-manage` command:

```bash
$ sudo nova-manage vm list | column -t
instance                   node        type          state   launched    image     kernel                                ramdisk                           project                           user        zone  index
web03                      compute-03  web  active  2012-12-04  23:19:31  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
web04                      compute-04  web  active  2012-12-04  23:20:53  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
web05                      compute-01  web  active  2012-12-04  23:25:09  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
web06                      compute-02  web  active  2012-12-04  23:39:57  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
web07                      compute-03  web  active  2012-12-04  23:42:04  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
web08                      compute-04  web  active  2012-12-04  23:43:52  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
web09                      compute-01  web  active  2012-12-04  23:45:21  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
web10                      compute-02  web  active  2012-12-04  23:46:45  9a933bc4-0ba7-4c16-853d-9bbc2c3ababc  f34d8f7170034280a42f6318d1a4af34  12ac184eebb04db686e72d097da3a3c4  None        0
```

<br />

# II. How to locate file and VM disk on your system?

By default, OpenStack instances name is templated like so `instance-xxx`. For the most curious, you may want to access the instance directory for whatever reason.

After a certain amount of time the `/var/lib/nova/instances` directory will be hard to decod :), you easily and quickly end up with something like this:

```bash
$ sudo ls -al /var/lib/nova/instances/
total 68
drwxr-xr-x 17 nova nova 4096 Dec 15 18:26 ./
drwxr-xr-x 10 nova nova 4096 Dec 12 22:29 ../
drwxrwxr-x  2 nova nova 4096 Dec 16 18:33 _base/
drwxrwxr-x  2 nova nova 4096 Oct 17 11:23 instance-000000bd/
drwxrwxr-x  2 nova nova 4096 Oct 17 15:43 instance-000000ce/
drwxrwxr-x  2 nova nova 4096 Oct 23 16:25 instance-00000110/
drwxrwxr-x  2 nova nova 4096 Oct 25 16:12 instance-00000138/
drwxrwxr-x  2 nova nova 4096 Nov  6 19:54 instance-000003ad/
drwxrwxr-x  2 nova nova 4096 Nov 30 17:29 instance-00000501/
drwxrwxr-x  2 nova nova 4096 Dec  1 17:56 instance-00000533/
drwxrwxr-x  2 nova nova 4096 Dec  5 00:24 instance-0000057a/
drwxrwxr-x  2 nova nova 4096 Dec  5 00:45 instance-000005a2/
drwxrwxr-x  2 nova nova 4096 Dec 12 23:35 instance-000006a5/
drwxrwxr-x  2 nova nova 4096 Dec 12 23:45 instance-000006e1/
drwxrwxr-x  2 nova nova 4096 Dec 15 18:20 instance-00000763/
drwxrwxr-x  2 nova nova 4096 Dec 15 18:26 instance-0000079f/
drwxrwxr-x  2 nova nova 4096 Dec 12 18:04 snapshots/
```

Of course timestamps can help, but there is a more reliable method to locate an instance. Go to your controller node (or whatever machine with Nova credentials):

```bash
$ nova show web35
+-------------------------------------+-------------------------------------------------------------+
| Property                            | Value                                                       |
+-------------------------------------+-------------------------------------------------------------+
| 20kowin network                     | 10.100.20.62, 172.20.20.55                                  |
| OS-DCF:diskConfig                   | MANUAL                                                      |
| OS-EXT-SRV-ATTR:host                | compute-01                                                  |
| OS-EXT-SRV-ATTR:hypervisor_hostname | compute-01                                                  |
| OS-EXT-SRV-ATTR:instance_name       | instance-0000079f                                           |
| OS-EXT-STS:power_state              | 1                                                           |
| OS-EXT-STS:task_state               | None                                                        |
| OS-EXT-STS:vm_state                 | active                                                      |
| accessIPv4                          |                                                             |
| accessIPv6                          |                                                             |
| config_drive                        |                                                             |
| created                             | 2012-12-15T17:25:57Z                                        |
| flavor                              | tiny (6)                                                    |
| hostId                              | 3ac44a2279a4d658caa0ac8c20c780d8d690af47b3cb62c01429d1e3    |
| id                                  | 7b41de99-6aa8-4c45-9718-db5f34fb4722                        |
| image                               | web (1d24e311-8e7e-4c8e-a81f-a78488c5e70e)                  |
| key_name                            | None                                                        |
| metadata                            | {}                                                          |
| name                                | web35                                                       |
| progress                            | 0                                                           |
| security_groups                     | [{u'name': u'default'}]                                     |
| status                              | ACTIVE                                                      |
| tenant_id                           | f34d8f7170034280a42f6318d1a4af34                            |
| updated                             | 2012-12-15T17:26:19Z                                        |
| user_id                             | 12ac184eebb04db686e72d097da3a3c4                            |
+-------------------------------------+-------------------------------------------------------------+
```

Important fields are:

* OS-EXT-SRV-ATTR:host
* OS-EXT-SRV-ATTR:instance_name

With those 2 information you know where to look ;-).

<br />

> Hope it helps!
