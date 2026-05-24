---
title: "OpenStack: instance evacuation goes to host"
date: 2013-07-19 16:02:00
slug: openstack-instance-evacuation-goes-to-host
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack: instance evacuation goes to host](/images/openstack-host-evacuate.jpg)

With Grizzly came the instance evacuation but a quite recent addition to the code expended it to hosts.

<!--more-->

With the help of the `nova evacuate` command you can easily migrate a VM from a dead compute.
Now with the `nova host-evacuate` **all** the instances from a dead compute can be moved to a new host:

* either specified from the command
* either chosen by the nova scheduler

Usage:

```bash
$ nova host-evacuate [--target_host <target_host>] [--on-shared-storage] <host>
```

Evacuate all instances from failed host to specified one.

Optional arguments:

* `--target_host <target_host>`: Name of target host.
* `--on-shared-storage`: Specifies whether all instances files are on share storage

<br />

> The implementation is a good idea but ideally I'd rather prefer to get a balanced relocation of all the VMs instead of having a new compute. Since all the computes might be evenly loaded, we could end up in a situation where no valid host can be found.
