---
title: Want to save money in the Cloud? OpenStack CoreOS image is there
date: 2013-08-30 00:15:00
slug: want-to-save-money-in-the-cloud-coreos-image-is-there
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Want to save money in the Cloud? CoreOS image is there](/images/openstack-save-money-coreos.jpg)

Today the [CoreOS](http://coreos.com/) team released its first OpenStack image. Let's quickly see how we can take advantage of it.

<!--more-->

The idea here is to combined both virtualization and container technologies.
Let's say you're running your application on public Cloud and you want to reduce your cost.
Usually, public cloud flavors are default for everyone and it's difficult to find the one that'll exactly suits your needs. 
Especially if your application has really strict requirements.
If you can't have a specific flavor, you'll have to buy a VM bigger than you need.
This will result using a virtual machine that you exploit entirely.
The idea here is to bring about another level of resource isolation by using containers inside a virtual machine.
Then you can easily and finely grained allocate your resources to each of your containers.
Besides, it's also more affordable to run 1 big VM with N containers inside than N VMs on a public Cloud.
Obviously, what I'm presenting here is not new, but for those of you who already had a look at CoreOS, they might want to populate their environment with CoreOS OpenStack cloud images.
Thus, I believe there is a strong interest here.

<br />

The main idea:

![Big picture](/images/openstack-coreos-docker.png)

<br />

Download the last image:

```bash
$ wget http://storage.core-os.net/coreos/amd64-generic/dev-channel/coreos_production_openstack_image.img.bz2
$ bunzip2 coreos_production_openstack_image.img.bz2
```

Quick inspection of the image before importing it:

```bash
$ qemu-img info coreos_production_openstack_image.img
image: coreos_production_openstack_image.img
file format: qcow2
virtual size: 5.3G (5721032192 bytes)
disk size: 347M
cluster_size: 65536
```

Import it into Glance:

```
$ glance image-create --name CoreOS --container-format ovf --disk-format qcow2 --file coreos_production_openstack_image.img --is-public True
+------------------+--------------------------------------+
| Property         | Value                                |
+------------------+--------------------------------------+
| checksum         | 4742f3c30bd2dcbaf3990ac338bd8e8c     |
| container_format | ovf                                  |
| created_at       | 2013-08-29T22:21:22                  |
| deleted          | False                                |
| deleted_at       | None                                 |
| disk_format      | qcow2                                |
| id               | cdf3874c-c27f-4816-bc8c-046b240e0edd |
| is_public        | True                                 |
| min_disk         | 0                                    |
| min_ram          | 0                                    |
| name             | CoreOS                               |
| owner            | 8e662c811b184482adaa34c89a9c33ae     |
| protected        | False                                |
| size             | 363660800                            |
| status           | active                               |
| updated_at       | 2013-08-29T22:22:04                  |
+------------------+--------------------------------------+
```

Boot the image:

```bash
$ nova boot --image cdf3874c-c27f-4816-bc8c-046b240e0edd --key-name coreos --flavor m1.medium --security-groups default coreos
...
...
```

Get the IP:

```bash
$ nova list
+--------------------------------------+--------+--------+------------+-------------+------------------+
| ID                                   | Name   | Status | Task State | Power State | Networks         |
+--------------------------------------+--------+--------+------------+-------------+------------------+
| 85aafe1a-f634-4665-a42b-43e49015a865 | coreos | ACTIVE | None       | Running     | private=10.0.0.3 |
+--------------------------------------+--------+--------+------------+-------------+------------------+
```

Finally SSH into it, note that the user is `core`:

```bash
$ ssh -i core.pem core@10.0.0.3
   ______                ____  _____
  / ____/___  ________  / __ \/ ___/
 / /   / __ \/ ___/ _ \/ / / /\__ \
/ /___/ /_/ / /  /  __/ /_/ /___/ /
\____/\____/_/   \___/\____//____/

core@10-0-0-3 ~ $
```

<br />

> That's all! Enjoy your light-weight OS and its building Docker engine.
