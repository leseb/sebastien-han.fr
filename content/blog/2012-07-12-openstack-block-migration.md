---
title: OpenStack block migration
date: 2012-07-12 15:30:00
slug: openstack-block-migration
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Block migration](/images/migration.jpg)

Block migration, the best compromise possible?

<!--more-->

<br />

# I. Principles

## I.1. Live migration

KVM live migration describes a process during which the guest operation system will move to an another hypervisor. What is performed under the hood? Well, the state of the guest operationg system will be migrate more precisely the content of the memory pages and the diverse emulated devices. In the theory it's simple as that. During the live migration process the guest is not supposed to be affected by the operation, and the client can continue to perform operation while the migration is running. Note that the live migration also exists in offline mode. This operation may require a little downtime for migration the CPU (processes and threads) and the RAM content. It depends on multiple factors like the size of the VM and his load.

With the live migration comes mandatory requirements:

* Distributed filesystem for the VMs storage like NFS or GlusterFS
* Libvirt must have the listen flag enable
* Obsviouly each compute node (hypervisor) must be located in the same network/subnet
* The authenfication must be configured as `none` or via ssh with ssh keys
* The mount point used by the DFS must be the same on each location

## I.2. Block migration

Block migration has a similar functionnement as above with the live migration dispite of the fact that the disk needs to be migrate which makes the operation longer. **But** a distributed filesystem is optionnal. The block migration migrate the disk via TCP. This can be summarized as follow:

>I don't have a distributed filesystem at my disposal, and I don't want one for some understandable reasons like the network latency but I want to be able to perform maintenance operations.

<br />

# II. State

## II.1. Does it work?!

First of all, configure your system for the migration by editing `/etc/default/libvirt-bin` and replace `libvirtd_opts="-d"` by `libvirtd_opts="-d -l"`.
Then edit `/etc/libvirt/libvirtd.conf` and change:

    listen_tls = 0
    listen_tcp = 1
    auth_tcp = "none"

As I said above, you don't need a DFS, simply configure libvirt properly.
I experimented the KVM block migration and I detected some problems.
Basically you can't successfully migrate a instance with this kind of flavor:

```bash
$ nova flavor-list
+----+-----------------+-----------+------+-----------+------+-------+-------------+
| ID |       Name      | Memory_MB | Disk | Ephemeral | Swap | VCPUs | RXTX_Factor |
+----+-----------------+-----------+------+-----------+------+-------+-------------+
| 9  | m1.medium       | 4096      | 10   | 0         |      | 2     | 1.0         |
+----+-----------------+-----------+------+-----------+------+-------+-------------+
```

Both "Disk" and "Ephemeral" make the migration fail, the issue has been reported on [the Openstack launchpad](https://bugs.launchpad.net/nova/+bug/977007) and the [commit for Folsom](https://github.com/openstack/nova/commit/ee705d048418d63667136cad3951655178861d46) which is perfectly functionnal. **You need to edit the line 2168 of `/usr/lib/python2.7/dist-packages/nova/virt/libvirt/connection.py`**

If you don't want to modify the Python code and wait for Folsom here's the workaround.

You need to create a special flavor like so:

```bash
$ sudo nova-manage instance_type create --name medium --memory 4096 --cpu 4 --root_gb 0 --ephemeral_gb 0 --swap 0 --flavor 13
```

You will have something like:

```bash
$ nova flavor-list
+----+-----------------+-----------+------+-----------+------+-------+-------------+
| ID |       Name      | Memory_MB | Disk | Ephemeral | Swap | VCPUs | RXTX_Factor |
+----+-----------------+-----------+------+-----------+------+-------+-------------+
| 13 | medium          | 4096      | 0    | 0         |      | 4     | 1.0         |
+----+-----------------+-----------+------+-----------+------+-------+-------------+
```

If you use the ubuntu cloud repository, you will have a virtual size of 2G by default for your disk image, which will represent the size of the root filesystem while your instance will be running. The virtual size can be easily showed via:

```bash
$ sudo qemu-img info precise-server-cloudimg-amd64.img
image: precise-server-cloudimg-amd64.img
file format: qcow2
virtual size: 2.0G (2147483648 bytes)
disk size: 217M
cluster_size: 65536
```

Inside the VM:

```bash
ubuntu@med:~$ df -h | grep /dev/
/dev/vda1       2.0G  793M  1.2G  42% /
```

The virtual size can be easily increase like so:

```bash
$ sudo qemu-img resize precise-server-cloudimg-amd64.img 15G
Image resized.
```

The result is immediate:

```bash
$ sudo qemu-img info precise-server-cloudimg-amd64.img
image: precise-server-cloudimg-amd64.img
file format: qcow2
virtual size: 15G (16106127360 bytes)
disk size: 217M
cluster_size: 65536
```

Inside the VM:

```bash
ubuntu@med:~$ df -h | grep /dev/
/dev/vda1        15G  796M   14G   6% /
```

This operation can be performed while the instance is running, simply reboot it and you will see that the local fs has grow. :)


## II.2. Example of block migration

Pick up an instance:

```bash
$ nova show med
+-------------------------------------+----------------------------------------------------------+
|               Property              |                          Value                           |
+-------------------------------------+----------------------------------------------------------+
| OS-DCF:diskConfig                   | MANUAL                                                   |
| OS-EXT-SRV-ATTR:host                | server2                                                  |
| OS-EXT-SRV-ATTR:hypervisor_hostname | None                                                     |
| OS-EXT-SRV-ATTR:instance_name       | instance-000002f8                                        |
| OS-EXT-STS:power_state              | 1                                                        |
| OS-EXT-STS:task_state               | None                                                     |
| OS-EXT-STS:vm_state                 | active                                                   |
| accessIPv4                          |                                                          |
| accessIPv6                          |                                                          |
| config_drive                        |                                                          |
| created                             | 2012-07-04T13:53:53Z                                     |
| flavor                              | medium-customm                                           |
| hostId                              | 30dec431592ca96c90bb4990d0df235f4face63907a7fc2ecdcb36d3 |
| id                                  | bd261aa7-728b-4edb-bd18-2ae2370b6549                     |
| image                               | precise-ceph                                             |
| key_name                            | seb                                                      |
| metadata                            | {}                                                       |
| name                                | med                                                      |
| progress                            | 0                                                        |
| status                              | ACTIVE                                                   |
| tenant_id                           | d1f5d27ccf594cdbb034c8a4123494e9                         |
| updated                             | 2012-07-09T15:18:31Z                                     |
| user_id                             | 557273155f8243bca38f77dcdca82ff6                         |
| vlan1 network                       | 192.168.22.49                                            |
+-------------------------------------+----------------------------------------------------------+
```

Run the block migration:

```bash
$ nova live-migration --block_migrate med server-01
```

Check the state:

```bash
$ nova list | grep med
| bd261aa7-728b-4edb-bd18-2ae2370b6549 | med       | MIGRATING | vlan1=192.168.22.49 |
```

Initiates connections:

	tcp        0      0 172.17.1.3:49152        172.17.1.2:57822        ESTABLISHED 30184/kvm
	tcp        0      0 172.17.1.3:16509        172.17.1.2:48448        ESTABLISHED 32365/libvirtd

**During the block migration I noticed a CPU hit between 10% and 15% on each compute node.** CPUs are Intel(R) Xeon(R) CPU L5335  @ 2.00GHz respectively on both compute nodes.

<br />

# III. Tips

Before performing the block_migration, nova checks both `free_ram_mb` and `disk_available_least` values in the nova database.

* `free_ram_mb` is the amont of RAM available on the destination compute node
* `disk_available_least` is a value calculated from the `local_gb` and the virtual size of the image.

Example of a compute node record:

```bash
*************************** 2. row ***************************
          created_at: 2012-05-23 10:14:12
          updated_at: 2012-07-09 15:48:53
          deleted_at: NULL
             deleted: 0
                  id: 9
          service_id: 18
               vcpus: 4
           memory_mb: 20077
            local_gb: 115
          vcpus_used: 12
      memory_mb_used: 2289
       local_gb_used: 21
     hypervisor_type: QEMU
  hypervisor_version: 1000000
            cpu_info: {"vendor": "Intel", "model": "core2duo", "arch": "x86_64", "features": ["lahf_lm", "dca", "xtpr", "cx16", "tm2", "vmx", "ds_cpl", "pbe", "tm", "ht", "ss", "acpi", "ds"], "topology": {"cores": "4", "threads": "1", "sockets": "1"}}
disk_available_least: 62
         free_ram_mb: 7277
        free_disk_gb: 95
    current_workload: 0
         running_vms: 3
 hypervisor_hostname: NULL
```

If you want to bypass the virtual size which is not erroned but simply not useful for everyone you can use the `--disk_over_commit` which will use the real  `disk_size` of the image.

You can enable options via the flag in nova.conf:

    block_migration_flag=VIR_MIGRATE_UNDEFINE_SOURCE,VIR_MIGRATE_PEER2PEER,VIR_MIGRATE_NON_SHARED_INC

<br />

> At the end, the block migration seems a pretty good option instead of using the classic live migration even if it's longer. But only using the network to migrate your VMs can be priceless and if it's only for maintenance purpose this is not so often. You don't always want a to use a DFS because it requires a lot of bandwith and store virtual instance via dedicated disks on each compute node is faster. In an order hand, you also want to perform maintenace on compute node like kernel or security upgrades and VMs downtime is not acceptable. In this case the block migrate looks like the ideal solution! Just keep in mind that you will need a fast private network between all your compute node (hypervisors) in order to make the block migration as fast as possible, who says 10G?
