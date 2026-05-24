---
title: OpenStack maintenance mode
date: 2013-01-09 18:02:00
slug: openstack-maintenance-mode
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack maintenance mode](/images/openstack-maintenance.jpg)

Some tips for performing smooth maintenance in OpenStack.

<!--more-->

# I. Maintenance

Maintenance can define a lot of actions:

* Hardware upgrade
* Security patch
* Update and reboot

Obviously one day, everyone (or good sysadmin) needs to reboot a server. 

Several setup and scenario:

* VM disks are stored on a distributed filesystem (cephFS, glusterFS, NFS...). Easy to perform a maintenance.
* VM disks are stored locally, this is the most difficul part.

<br />

# II. Put a node into maintenance

There is already a maintenance mode, but the feature has been implemented only for Xen hypervisor, if you run KVM and you issue the following command, you will get an error, which is obvious:

```bash
$ nova host-update compute-01 --maintenance enable
ERROR: The server has either erred or is incapable of performing the requested operation. (HTTP 500) (Request-ID: req-5667d1ff-bgha-4veq-9drb-8c6'733f1s4b)
```

As a workaround you could:

* Specify a different location for the new instances. But you can only do this if you manage your Cloud. 
* Disable a compute node

## II.1. Private cloud approach

You can use the following command to force the run on a specific node:

```bash
$ nova boot bla bla bla --availability-zone <your-zone>:<compute-node>
```

<br />
<span class="text_quote">R </span>Note: admin permissions are required. and the default zone is `nova`.

## II.2. Public Cloud approach

Even better I guess, you could disable the compute node from the service, thus nova-scheduler won't attemps to run any instance on this compute node.

```bash
$ sudo nova-manage service disable --host=<host> --service=<service>
```

<br />

> Hope it helps! If someone has another method, please share ;-).
