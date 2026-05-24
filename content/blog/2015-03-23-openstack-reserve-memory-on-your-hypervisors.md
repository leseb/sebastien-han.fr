---
title: "OpenStack: reserve memory on your hypervisors"
date: 2015-03-23 15:09:00
slug: openstack-reserve-memory-on-your-hypervisors
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack reserve memory on your hypervisors](/images/openstack-reserve-memory-hypervisors.jpg)

One major use case for operators is to be able to reserve a certain amount of memory in the hypervisor.
This is extremely useful when you have to recover from failures.
Imagine that you run all your virtual machines on shared storage (Ceph RBD or Sheepdog or NFS).
The major benefit from running your instances on shared storage is that it will ease live-migration and evacuation.
However, if a compute node dies you want to make sure that you have enough capacity on the other compute nodes to relaunch your instances.
Given that the `nova host-evacuate` call goes through the scheduler again you should get an even distribution.

But how to make sure that you have enough memory on the other hypervisors?
Unfortunately there is no real memory restriction mechanism.
In this article I will explain how we can mimic such behavior.

<!--more-->

<br />

# First attempt

Since we don't really to play with memory over subscription make sure to always set the `ram_allocation_ratio` to 1 in your `nova.conf`.
Then restart your `nova-compute` process.

There are not many options to do some memory housekeeping.
Actually I only see one, using the `reserved_host_memory_mb` option.
There are many default filters in Nova, however I will be focusing on the memory one.
The way Nova Scheduler applies filters is be based on the RamFilter.
It will calculate the amount of memory available on the compute host minus `reserved_host_memory_mb`.
This value will be reported by the `nova-compute` resource statistics.
The scheduler will use this report to correctly choose compute nodes.
That way we can preserve a certain amount of memory on the compute node.

<br />
<br />

# The tricky part

Now we kept let's say 32768 MB of memory.
From the Nova point of view, this value is dedicated to the host system nothing less nothing more.
The problem here is that during a failure scenario, this option does not solve the re-scheduling issue.
The only thing I can think of at the moment is a hook mechanism that will change this value to 512 MB for example.
Thus this will free up 32256 MB of memory on each other compute nodes.
This hook can be setup via your preferred configuration management system.
Once you have fixed the dead hypervisor you should probably move some of the virtual machines back to this new hypervisor.
Whilst doing this you should change `reserved_host_memory_mb` back to its original value.

<br />

> I'm not sure of something can be done using other scheduler filters.
