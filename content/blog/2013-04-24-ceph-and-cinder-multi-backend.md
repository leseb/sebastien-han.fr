---
title: Ceph and Cinder multi-backend
date: 2013-04-25 12:03:00
slug: ceph-and-cinder-multi-backend
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![](/images/ceph-cinder-multi-backed.jpg)

Grizzly brought the multi-backend functionality to cinder and tons of new drivers. The main purpose of this article is to demonstrate how we can take advantage of the tiering capability of Ceph.

<!--more-->

# I. Ceph

To configure Ceph to use different storage devices see my previous article: [Ceph 2 speed storage with CRUSH](http://www.sebastien-han.fr/blog/2012/12/07/ceph-2-speed-storage-with-crush/).

<br />

# II. Cinder

Assuming your 2 pools are called:

* rbd-sata points to the SATA rack
* rbd-ssd points to the SSD rack

## II.1 Configuration

Cinder configuration file:

    # Multi backend options
    
    # Define the names of the groups for multiple volume backends
    enabled_backends=rbd-sata,rbd-ssd
    
    # Define the groups as above
    [rbd-sata]
    volume_driver=cinder.volume.driver.RBDDriver
    rbd_pool=cinder-sata
    volume_backend_name=RBD_SATA
    # if cephX is enable
    #rbd_user=cinder
    #rbd_secret_uuid=<None>
    [rbd-ssd]
    volume_driver=cinder.volume.driver.RBDDriver
    rbd_pool=cinder-ssd
    volume_backend_name=RBD_SSD
    # if cephX is enable
    #rbd_user=cinder
    #rbd_secret_uuid=<None>


Unfortunately the rbd driver doesn't support this variable yet (most of the drivers don't). This feature has been submitted here: [https://review.openstack.org/#/c/28208/](https://review.openstack.org/#/c/28208/).

Then create the pointers:

```bash
$ cinder type-key ssd set volume_backend_name=RBD_SSD
$ cinder type-key sata set volume_backend_name=RBD_SATA
$ cinder extra-specs-list
+--------------------------------------+------+---------------------------------------+
|                  ID                  | Name |              extra_specs              |
+--------------------------------------+------+---------------------------------------+
| b1522968-e4fa-4372-8ac4-3925b7c79ee1 | ssd  |  {u'volume_backend_name': u'RBD_SSD'} |
| b50bf5a3-6044-4392-beeb-432302f6421c | sata | {u'volume_backend_name': u'RBD_SATA'} |
+--------------------------------------+------+---------------------------------------+
```

Then restart cinder services:

```bash
$ sudo restart cinder-api ; sudo restart cinder-scheduler ; sudo restart cinder-volume 
```

Eventually create 2 volume type, one for each backend:

```bash
$ cinder type-create ssd
+--------------------------------------+------+
|                  ID                  | Name |
+--------------------------------------+------+
| b1522968-e4fa-4372-8ac4-3925b7c79ee1 | ssd  |
+--------------------------------------+------+

$ cinder type-create sata
+--------------------------------------+------+
|                  ID                  | Name |
+--------------------------------------+------+
| b50bf5a3-6044-4392-beeb-432302f6421c | sata |
+--------------------------------------+------+
```

<br />

## II.2. Play with it

```bash
$ cinder create --volume_type ssd --display_name vol-ssd 1
+---------------------+--------------------------------------+
|       Property      |                Value                 |
+---------------------+--------------------------------------+
|     attachments     |                  []                  |
|  availability_zone  |                 nova                 |
|       bootable      |                false                 |
|      created_at     |      2013-04-22T14:54:53.917580      |
| display_description |                 None                 |
|     display_name    |               vol-ssd                |
|          id         | 4c777d96-66e4-4f85-815c-92d4503c5c8c |
|       metadata      |                  {}                  |
|         size        |                  1                   |
|     snapshot_id     |                 None                 |
|     source_volid    |                 None                 |
|        status       |               creating               |
|     volume_type     |                 ssd                  |
+---------------------+--------------------------------------+

$ cinder create --volume_type ssd --display_name vol-sata 1
+---------------------+--------------------------------------+
|       Property      |                Value                 |
+---------------------+--------------------------------------+
|     attachments     |                  []                  |
|  availability_zone  |                 nova                 |
|       bootable      |                false                 |
|      created_at     |      2013-04-22T14:54:58.831327      |
| display_description |                 None                 |
|     display_name    |               vol-sata               |
|          id         | 8e347bd1-2044-40a2-ae87-ee9a23cddd71 |
|       metadata      |                  {}                  |
|         size        |                  1                   |
|     snapshot_id     |                 None                 |
|     source_volid    |                 None                 |
|        status       |               creating               |
|     volume_type     |                 ssd                  |
+---------------------+--------------------------------------+
```

Does it work?

```bash
$ rbd -p cinder-ssd ls
volume-8e347bd1-2044-40a2-ae87-ee9a23cddd71

$ rbd -p cinder-sata ls
volume-4c777d96-66e4-4f85-815c-92d4503c5c8c
```

<br />

> It's nice that the multi-backend came with Cinder, we are gradually getting to enjoy the full power of Ceph!
