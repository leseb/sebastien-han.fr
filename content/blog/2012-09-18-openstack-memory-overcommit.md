---
title: "Openstack: memory overcommit"
date: 2012-09-22 19:06:00
slug: openstack-memory-overcommit
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Openstack: memory overcommit](/images/openstack-memory-overcommit.jpg)

I couple of days ago I noticed that I never tested the overcommit capability in OpenStack

<!--more-->

The default behavior of the Scheduler is to have a look at the database record of each compute node and elect the one which will run the new requested instance. Extract of a compute node record:

```sql
mysql> SELECT * FROM compute_nodes \G;
*************************** 1. row ***************************
          created_at: 2012-07-30 14:07:52
          updated_at: 2012-09-18 17:07:25
          deleted_at: NULL
             deleted: 0
                  id: 1
          service_id: 5
               vcpus: 4
           memory_mb: 20077
            local_gb: 18
          vcpus_used: 19
      memory_mb_used: 5754
       local_gb_used: 14
     hypervisor_type: QEMU
  hypervisor_version: 1000000
            cpu_info: {"vendor": "Intel", "model": "core2duo", "arch": "x86_64", "features": ["lahf_lm", "dca", "xtpr", "cx16", "tm2", "vmx", "ds_cpl", "pbe", "tm", "ht", "ss", "acpi", "ds"], "topology": {"cores": "4", "threads": "1", "sockets": "1"}}
disk_available_least: -21
         free_ram_mb: -8595
        free_disk_gb: 18
    current_workload: 0
         running_vms: 13
 hypervisor_hostname: NULL
```

The Scheduler looks at the `free_ram_mb`, you might already have notice that I use the overcommit. Basically if you have a `free_ram_mb` of 400 and if you want to run a new m1.tiny instance with 512M of memory, the Scheduler will end up with this message in the logs:

    WARNING nova.scheduler.manager Failed to schedule_run_instance: No valid host was found. 
    WARNING nova.scheduler.manager Setting instance 53ebe074-8545-4539-a53d-d913450bf716 to ERROR state.

Usually to manage the overcommitment you can use both options:

* `cpu_allocation_ratio`. Default value: **16:1**
* `ram_allocation_ratio`. Default value: **1.5:1**

Actually there is a bug in the `ram_allocation_ratio` as [reported on launchpad](https://bugs.launchpad.net/nova/+bug/1016273).

The solution is really simple, of course if you know it. Add this option to your `nova.conf`, on the host where runs your nova-scheduler:

    --scheduler_default_filters=AvailabilityZoneFilter,ComputeFilter

Here we just told the Scheduler to **only** use the `AvailabilityZoneFilter` and `ComputeFilter`.

A little more explanations now. By default overcommiting is disable which is fair for Cloud provider. Thanks to this, they are sure to provide the service for what the customers pay. That's the ideal scenario of course... Now if you run a corporation cloud you definitely want to enable memory overcommit on your compute node. 

<br />

> Overcommitting is not new but it's a really important feature that you don't want to miss for your production environment. Hope it helps! ;)

<br/>

> ps: I just saw that the [Official OpenStack documentation](http://docs.openstack.org/essex/openstack-compute/admin/content/scheduler-filters.html#ramfilter) wrote about this issue. I hate paraphrasing information but the article was already written :).
