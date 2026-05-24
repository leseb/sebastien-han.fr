---
title: "OpenStack cinder: readonly device"
date: 2015-06-08 00:01:00
slug: openstack-cinder-readonly-device
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack cinder: readonly device](/images/openstack-cinder-read-only-volume.jpg)

It is possible to attach readonly volume to a virtual machine.

<!--more-->

On a given volume simply run:

```bash
$ cinder readonly-mode-update d415c23b-1360-43db-9df6-39738f4ab6d6 True
$ cinder volume-show d415c23b-1360-43db-9df6-39738f4ab6d6
+---------------------------------------+--------------------------------------+
|              attachments              |                  []                  |
|           availability_zone           |                 nova                 |
|                bootable               |                false                 |
|          consistencygroup_id          |                 None                 |
|               created_at              |      2015-06-03T09:59:07.000000      |
|              description              |                 None                 |
|               encrypted               |                False                 |
|                   id                  | d415c23b-1360-43db-9df6-39738f4ab6d6 |
|                metadata               |        {u'readonly': u'True'}        |
|              multiattach              |                False                 |
|                  name                 |                 None                 |
|         os-vol-host-attr:host         |         ceph-eno1@ceph#ceph          |
|     os-vol-mig-status-attr:migstat    |                 None                 |
|     os-vol-mig-status-attr:name_id    |                 None                 |
|      os-vol-tenant-attr:tenant_id     |   5f2fa82efb43428d89219dd18d3e19a0   |
|   os-volume-replication:driver_data   |                 None                 |
| os-volume-replication:extended_status |                 None                 |
|           replication_status          |               disabled               |
|                  size                 |                  1                   |
|              snapshot_id              |                 None                 |
|              source_volid             |                 None                 |
|                 status                |              available               |
|                user_id                |   779f5767e17a4c5f97dbe7e98196051a   |
|              volume_type              |                 ceph                 |
+---------------------------------------+--------------------------------------+
```

We attached the volume, now let's get into that virtual machine:

```bash
ubuntu@leseb:~$ lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0    20G  0 disk
└─sda1   8:1    0    20G  0 part /
sdb      8:16   0     1G  1 disk
sr0     11:0    1   410K  0 rom

ubuntu@leseb:~$ sudo dd if=/dev/zero of=/dev/sdb bs=1M count=1
dd: failed to open ‘/dev/sdb’: Read-only file system
```

> Please note that there is nothing to do with the Cinder backend that you use, this operation is done by QEMU itself.
So even if your backend does not support it it does not really matter.
If you look at the libvirt XML of your instance you will see a `readonly` section.
