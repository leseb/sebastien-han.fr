---
title: Make the network of your VMs fly with the virtio driver
date: 2012-07-19 00:58:00
slug: make-the-network-of-your-vms-fly-with-virtio-driver
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Virtio driver](/images/virtio.jpg)

Bring gigabit to your VM's NIC!

<!--more-->

# I. About the virtio driver

It's part of KVM best practices to enable the virtio driver.

KVM can provide two type of devices to the guest operating system:

* emulated
* para-virtualized

Compared to emulated devices, para-virtualized devices provide lower latency and higher throughput for I/O operations of guest operating systems. KVM includes the VirtIO API to para-virtualize devices.

The VirtIO API is a high performance API written by Rusty Russell which uses virtual I/O. It para-virtualized devices use to increase speed and efficiency. The VirtIO API specifies an interface (virtio net) between virtual machines and hypervisors that is independent of the hypervisor. In typical situations, VirtIO para-virtualized devices provide lower latency and higher throughput for I/O operations of guest operating systems. VirtIO para-virtualized devices are especially useful for guest operating systems that run I/O heavy tasks and applications.

<br />

# II. Syndrome

Pick up 2 instances, from one run:

```bash
$ iperf -s
------------------------------------------------------------
Server listening on TCP port 5001
TCP window size: 85.3 KByte (default)
------------------------------------------------------------
```

When the driver is disable:

```bash
ubuntu@vm-without-virtio:~$ iperf -c 192.168.22.49 -i1 -t 10
------------------------------------------------------------
Client connecting to 192.168.22.49, TCP port 5001
TCP window size: 47.0 KByte (default)
------------------------------------------------------------
[  3] local 192.168.22.50 port 39421 connected with 192.168.22.49 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0- 1.0 sec  12.0 MBytes   101 Mbits/sec
[  3]  1.0- 2.0 sec  12.4 MBytes   104 Mbits/sec
[  3]  2.0- 3.0 sec  12.5 MBytes   105 Mbits/sec
[  3]  3.0- 4.0 sec  12.4 MBytes   104 Mbits/sec
[  3]  4.0- 5.0 sec  12.1 MBytes   102 Mbits/sec
[  3]  5.0- 6.0 sec  12.5 MBytes   105 Mbits/sec
[  3]  6.0- 7.0 sec  12.5 MBytes   105 Mbits/sec
[  3]  7.0- 8.0 sec  12.4 MBytes   104 Mbits/sec
...
...
```

When the driver is enable:

```bash
ubuntu@vm-with-virtio:~$ iperf -c 192.168.22.47 -i1 -t 10
------------------------------------------------------------
Client connecting to 192.168.22.47, TCP port 5001
TCP window size: 23.5 KByte (default)
------------------------------------------------------------
[  3] local 192.168.22.49 port 43018 connected with 192.168.22.47 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0- 1.0 sec   112 MBytes   944 Mbits/sec
[  3]  1.0- 2.0 sec   112 MBytes   940 Mbits/sec
[  3]  2.0- 3.0 sec   112 MBytes   940 Mbits/sec
[  3]  3.0- 4.0 sec   112 MBytes   940 Mbits/sec
[  3]  4.0- 5.0 sec   112 MBytes   940 Mbits/sec
[  3]  5.0- 6.0 sec   112 MBytes   938 Mbits/sec
[  3]  6.0- 7.0 sec   112 MBytes   935 Mbits/sec
[  3]  7.0- 8.0 sec   111 MBytes   928 Mbits/sec
[  3]  8.0- 9.0 sec   112 MBytes   936 Mbits/sec
...
...
```

<br />

# III. Enable it!

First of all, we have to verify that virtio is in the list of supported devices:

```bash
$ sudo kvm -net nic,model=?
qemu: Supported NIC models: ne2k_pci,i82551,i82557b,i82559er,rtl8139,e1000,pcnet,virtio
```

Nova manages this via the libvirt template in `/usr/share/pyshared/nova/virt/libvirt.xml.template` with:

	<interface type='bridge'>
		<source bridge='${nic.bridge_name}'/>
		<mac address='${nic.mac_address}'/>
		#if $getVar('use_virtio_for_bridges', True)
		<model type='virtio'/>

You also have to enable the flag in your nova.conf:

    --libvirt_use_virtio_for_bridges=true

This will enable the `-device virtio-net-pci` in kvm.

Simply restart libvirt-bin and let's roll!

> It could be a shame to don't use this option since obviously everyone's network use Gigabit connection ;-)
