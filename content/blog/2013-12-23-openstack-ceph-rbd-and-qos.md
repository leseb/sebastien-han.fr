---
title: OpenStack, Ceph RBD and QoS
date: 2013-12-23 00:19:00
slug: openstack-ceph-rbd-and-qos
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack, Ceph RBD and QoS](/images/openstack-cinder-rate-limiting.jpg)

The Havana cycle introduced a QoS feature on both Cinder and Nova.
Quick tour of this excellent implementation.

<!--more-->

Originally both QEMU and KVM support rate limitation.
This is obviously implemented through libvirt and available as an extra xml flag within the `<disk>` section called `iotune`.

QoS options are:

* `total_bytes_sec`: the total allowed bandwidth for the guest per second
* `read_bytes_sec`: sequential read limitation
* `write_bytes_sec`: sequential write limitation
* `total_iops_sec`: the total allowed IOPS for the guest per second
* `read_iops_sec`: random read limitation
* `write_iops_sec`: random write limitation

This is wonderful that OpenStack implemented such (easy?) feature in both Nova and Cinder.
It is also a sign that OpenStack is getting more featured and complete in the existing core projects.
Having such facility is extremely useful for several reasons.
First of all, not all the storage backends support QoS.
For instance, Ceph doesn't have any built-in QoS feature whatsoever.
Moreover, the limitation is directly at the hypervisor layer and your storage solution doesn't even need to have such feature.
Another good point is that from an operator side it is quite nice to be able to offer different levels of service.
Operators can now offer different types of volumes based on a certain QoS, customers then, will be charged accordingly.


<br />

# II. Test it!

First create the QoS in Cinder:

```bash
$ cinder qos-create high-iops consumer="front-end" read_iops_sec=2000 write_iops_sec=1000
+----------+---------------------------------------------------------+
| Property |                       Value                             |
+----------+---------------------------------------------------------+
| consumer |                     front-end                           |
|    id    |        c38d72f8-f4a4-4999-8acd-a17f34b040cb             |
|   name   |                high-iops                                |
|  specs   | {u'write_iops_sec': u'1000', u'read_iops_sec': u'2000'} |
+----------+---------------------------------------------------------+
```

Create a new volume type:

```
$ cinder type-create high-iops
+--------------------------------------+-----------+
|                  ID                  | Name      |
+--------------------------------------+-----------+
| 9c746ca5-eff8-40fe-9a96-1cdef7173bd0 | high-iops |
+--------------------------------------+-----------+
```

Then associate the volume type with the QoS:

```
$ cinder qos-associate c38d72f8-f4a4-4999-8acd-a17f34b040cb 9c746ca5-eff8-40fe-9a96-1cdef7173bd0

$ cinder create --display-name high-iops --volume-type high-iops 1
+---------------------+--------------------------------------+
|       Property      |                Value                 |
+---------------------+--------------------------------------+
|     attachments     |                  []                  |
|  availability_zone  |                 nova                 |
|       bootable      |                false                 |
|      created_at     |      2013-12-02T12:59:33.177875      |
| display_description |                 None                 |
|     display_name    |                 high-iops            |
|          id         | 743549c1-c7a3-4e86-8e99-b51df4cf7cdc |
|       metadata      |                  {}                  |
|         size        |                  1                   |
|     snapshot_id     |                 None                 |
|     source_volid    |                 None                 |
|        status       |               creating               |
|     volume_type     |               high-iops              |
+---------------------+--------------------------------------+
```

Eventually attach the volume to an instance:

```
$ nova volume-attach cirrOS 743549c1-c7a3-4e86-8e99-b51df4cf7cdc /dev/vdc
+----------+--------------------------------------+
| Property | Value                                |
+----------+--------------------------------------+
| device   | /dev/vdc                             |
| serverId | 7fff1d37-efc4-46b9-8681-3e6b1086c453 |
| id       | 743549c1-c7a3-4e86-8e99-b51df4cf7cdc |
| volumeId | 743549c1-c7a3-4e86-8e99-b51df4cf7cdc |
+----------+--------------------------------------+
```

<br />

Expected result:

While attaching the device you should see the following xml creation from the nova-volume debug log.
Dumping the virsh xml works as well.

    2013-12-11 14:12:05.874 DEBUG nova.virt.libvirt.config [req-232cf5eb-a79b-42d5-a183-2f4758e8d8eb admin admin] Generated XML <disk type="network" device="disk">
      <driver name="qemu" type="raw" cache="none"/>
      <source protocol="rbd" name="volumes/volume-743549c1-c7a3-4e86-8e99-b51df4cf7cdc">
        <host name="192.168.251.100" port="6790"/>
      </source>
      <auth username="volumes">
        <secret type="ceph" uuid="95c98032-ad65-5db8-f5d3-5bd09cd563ef"/>
      </auth>
      <target bus="virtio" dev="vdc"/>
      <serial>2e589abc-a008-4433-89ae-1bb142b139e3</serial>
      <iotune>
        <read_iops_sec>2000</read_iops_sec>
        <write_iops_sec>1000</write_iops_sec>
      </iotune>
    </disk>


<br />

<span class="text_quote">W </span> **Important note: rate-limiting is currently broken in Havana, however the [bug](https://bugs.launchpad.net/cinder/+bug/1259957) has already been reported and a [fix submitted/accepted](https://review.openstack.org/#/c/61531/).
This same patch has also already been proposed as a [potential backport](https://review.openstack.org/#/c/63632/) for Havana.**
