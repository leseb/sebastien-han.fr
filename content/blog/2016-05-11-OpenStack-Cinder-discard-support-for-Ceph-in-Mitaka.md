---
title: "OpenStack Cinder: discard support for Ceph in Mitaka"
date: 2016-05-11 14:49:20
slug: OpenStack-Cinder-discard-support-for-Ceph-in-Mitaka
draft: false
categories: ["openstack"]
tags: ["openstack", "ceph"]
---

![OpenStack Cinder: discard support for Ceph in Mitaka](/images/openstack-cinder-mitaka-ceph.jpg)

OpenStack Mitaka brought the support of a new feature.
This feature is a follow-up of the [Nova discard implementation](http://www.sebastien-han.fr/blog/2015/02/02/openstack-and-ceph-rbd-discard/).
Now it is possible to configure Cinder per backend.

<!--more-->

**It is mandatory to use a Glance image with these two properties `hw_scsi_model=virtio-scsi` and `hw_disk_bus=scsi`.**

If your image does not have the right property just update it with this command:

    $ glance image-update <image id > --property hw_scsi_model=virtio-scsi --property hw_disk_bus=scsi

As an operator, in order for your backend to report discard capabilities, you need to configure Cinder volume.
It is pretty simple so simply append the following line `report_discard_supported = True` in your backend section:

    [ceph]
    rbd_max_clone_depth = 5
    rbd_flatten_volume_from_snapshot = False
    rbd_uuid = 6ed23bd0-aa89-4b0b-b5c6-77bf4da08afd
    rbd_user = cinder
    rbd_pool = volumes
    rbd_ceph_conf =
    volume_driver = cinder.volume.drivers.rbd.RBDDriver
    volume_backend_name = ceph
    report_discard_supported = true

Eventually restart your Cinder volume service.
Now attach a block device.
If you want to validate that the device reports discard, you can check the libvirt xml file of the virtual machine.
Alternatively within the virtual machine you can check `/sys/block/sdb/queue/discard_*`.

> Always be careful when using `fstrim` after forward to reclaim space has this will introduce some performance penalty.
