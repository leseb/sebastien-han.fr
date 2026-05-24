---
title: "Tip: OpenStack Retrieve usage statictics"
date: 2012-11-09 23:45:00
slug: tip-openstack-retrieve-usage-statictic
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack retrieve usage statictic](/images/openstack-stat.jpg)

While waiting for the Ceilometer project to be ready, nova provides some facilities to retrieve simple statistics. A little overview about the available commands.

<!--more-->

You will probably notice that some commands are redundant...


# I. Host

In Openstack, a host is the machine hosting your services, it can be virtualized but generally for real deployment we have bare metal servers.

## I.1. Describe

```bash
$ nova host-list
+------------------+-------------+
| host_name        | service     |
+------------------+-------------+
| c2-compute-01    | compute     |
| c2-compute-01    | network     |
| c2-compute-02    | compute     |
| c2-compute-02    | network     |
| c2-compute-03    | compute     |
| c2-compute-03    | network     |
| c2-compute-04    | compute     |
| c2-compute-04    | network     |
| c2-controller-01 | cert        |
| c2-controller-01 | consoleauth |
| c2-controller-01 | scheduler   |
+------------------+-------------+

$ nova host-describe c2-compute-01
+---------------+----------------------------------+-----+-----------+---------+
| HOST          | PROJECT                          | cpu | memory_mb | disk_gb |
+---------------+----------------------------------+-----+-----------+---------+
| c2-compute-01 | (total)                          | 24  | 96677     | 492     |
| c2-compute-01 | (used_max)                       | 2   | 2560      | 0       |
| c2-compute-01 | (used_now)                       | 4   | 7168      | 0       |
| c2-compute-01 | f34d8f7170034280a42f6318d1a4af34 | 2   | 2560      | 0       |
+---------------+----------------------------------+-----+-----------+---------+
```



# II. Server

In Openstack, a server is a virtual machine.


## II.1. Diagnostic

The nova command line provides some useful options:

```bash
$ nova diagnostics ubuntu
+------------------+---------------+
| Property         | Value         |
+------------------+---------------+
| cpu0_time        | 1138410000000 |
| memory           | 524288        |
| memory-actual    | 524288        |
| memory-rss       | 591664        |
| vda_errors       | -1            |
| vda_read         | 334864384     |
| vda_read_req     | 13851         |
| vda_write        | 2985382912    |
| vda_write_req    | 177180        |
| vnet4_rx         | 45381339      |
| vnet4_rx_drop    | 0             |
| vnet4_rx_errors  | 0             |
| vnet4_rx_packets | 106426        |
| vnet4_tx         | 37513574      |
| vnet4_tx_drop    | 0             |
| vnet4_tx_errors  | 0             |
| vnet4_tx_packets | 162200        |
+------------------+---------------+
```

General usage per tenant:

```bash
$ nova usage-list
Usage from 2012-10-10 to 2012-11-08:
+----------------------------------+-----------+--------------+-----------+---------------+
| Tenant ID                        | Instances | RAM MB-Hours | CPU Hours | Disk GB-Hours |
+----------------------------------+-----------+--------------+-----------+---------------+
| 0eec5c34a7a24a7a8ddad27cb81d2706 | 8         | 240031.10    | 468.81    | 0.00          |
| 92a5d9c313424537b78ae3e42858fd4e | 5         | 483568.64    | 236.12    | 0.00          |
| f34d8f7170034280a42f6318d1a4af34 | 106       | 16888511.58  | 9182.88   | 0.00          |
+----------------------------------+-----------+--------------+-----------+---------------+
```

Nova manage reports the same informationa as the nova API:

```bash
$ sudo nova-manage service describe_resource --host=c2-compute-01
HOST                              PROJECT     cpu mem(mb)     hdd
c2-compute-01   (total)                        24   96677     492
c2-compute-01   (used_now)                      6   11264       0
c2-compute-01   (used_max)                      6   10752       0
c2-compute-01            f34d8f7170034280a42f6318d1a4af34       6   10752       0
```
<br />

> It's not much but it's something... As usual, I hope it helps! :-)
