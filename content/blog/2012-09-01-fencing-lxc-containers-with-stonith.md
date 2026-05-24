---
title: Fencing LXC containers with STONITH
date: 2012-09-11 18:39:00
slug: fencing-lxc-containers-with-stonith
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

![Fencing LXC containers with STONITH](/images/lxc-stonith.jpg)

Introducing fencing on LXC container.

<!--more-->

# Introduction

## I.1. About LXC

LXC or Linux Container is an amazing way to run multiple environments on a single machine. No virtualisation here, only several environment sharing the same Kernel. LXC is similar to OpenVZ. LXC is a young project but it grows really quickly and it's well maintained by Canonical. LXC is also part of the Ubuntu Cloud Stack. LXC is not as mature as his elder but it's coming. This formadible technology has a lot of use case, often close to the virtualisation ones but the hudge benefit of container based virtualisation is the performance. You can barely notice the performance difference between the host and the container. Thus yes, LXC is a real use case for production and is not stuck to testing environment. A simple use case could be the following: *you want or have plained to build an HA stack, a classical one: LAMP but you only have 2 servers... Basically in this context 2 servers mean one dedicated for the frontend Apache and one for the database MySQL backend. Thanks to LXC you could start with 4 containers and start to build an HA stack like so:*

* Host 1:
    * Apache 1
    * MySQL Master 1

* Host 2:
    * Apache 2
    * MySQL Master 2

When you will have more budget, you will invest in 2 new servers, copy your existing containers into your new servers, re-start your container et voilà! you have a **real** HA stack in a minute thanks to LXC. LXC is really handy for managing and backuping containers. It's also really flexible in term of CPU/RAM allocation and disk quota.

This was only one use case, but you could also want to run multiple version of a given software. Let's say you want to run MySQL 5.3 and 5.5 but you don't really want to buy 4 servers for that (HA is the watchword) maybe for several reasons:

* Your application doesn't require so much power
* You don't have the budget for 4 servers

In this case, LXC becomes tremendously useful :). 

## I.2. About the STONITH death match

One thing that I hate to do is paraphrasing existing content. The Web is full of excellent articles about STONITH, so I will simply give you a little reminder. Shoot The Other Node In The Head is the mechanism which fences node (s). It's essentially use to tell the cluster about the state of given resource. Several scenario may end up to a split brain situation, this will require the usage of STONITH. For instance a network communication issues, the node can communicate with the rest of the cluster.

At the end, keep in mind that STONITH is equivalent to this situation:

![STONITH Death Match](/images/stonith-death-match.jpg)

Some good reading:

* [Fencing and Stonith by Dejan Muhamedagic](http://www.clusterlabs.org/doc/crm_fencing.html)
* [Stonith Deathmatch explained](http://ourobengr.com/ha/)

<br />

# II. Setup libvirt with LXC

First manage your LXC with libvirt, install it:

```bash
$ sudo apt-get install libvirt-bin -y
```

According to your current configuration create xml for your container.

Here is my current container, the one used from my previous article:

```bash
$ ls /var/lib/lxc/
mon-conteneur  mon-conteneur-2

$ ls /var/lib/lxc/mon-conteneur/
config  fstab  rootfs  rootfs.hold
```

The most important directory is `rootfs`. Now define define your libvirt domain like so:

```xml
<domain type='lxc'>
  <name>mon-conteneur</name>
  <memory>332768</memory>
  <os>
    <type>exe</type>
    <init>/sbin/init</init>
  </os>
  <vcpu>1</vcpu>
  <clock offset='utc'/>
  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>
  <devices>
    <emulator>/usr/lib/libvirt/libvirt_lxc</emulator>
    <filesystem type='mount'>
      <source dir='/var/lib/lxc/mon-conteneur/rootfs'/>
      <target dir='/'/>
    </filesystem>
    <interface type='network'>
      <source network='default'/>
    </interface>
    <console type='pty' />
  </devices>
</domain>
```

You can now start up your container like so:

```bash
$ sudo virsh -c lxc:/// define mon-conteneur.xml
Domain mon-conteneur defined from mon-conteneur.xml
```

Finally run it!

```bash
$ sudo virsh -c lxc:/// start mon-conteneur
Domain mon-conteneur started
```

Perform the same operation for your second container. At the end you should have something like this:

```bash
$ sudo virsh list
 Id Name                 State
----------------------------------
1752 mon-conteneur-2      running
26982 mon-conteneur        running
```

Laziness! By default the virsh uri is `qemu:///system`, virsh looks at an environment variable to set it:

    export VIRSH_DEFAULT_CONNECT_URI=lxc:///

You can verify with:

```bash
$ virsh uri
lxc:///
```

To get inside your container you have 2 options:

* tty console
* SSH

Try with the console:

```bash
$ sudo virsh -c lxc:/// console mon-conteneur

Ubuntu 12.04.1 LTS mon-conteneur tty1

mon-conteneur login: 
```

By SSH, but first find the IP address given by dnsmasq:

```bash
$ arp -an | grep virbr0
? (192.168.122.30) at 52:54:00:76:31:f9 [ether] on virbr0
? (192.168.122.58) at 52:54:00:bd:fe:2f [ether] on virbr0

$ ssh ubuntu@192.168.122.30
```

<br />

# III. Pacemaker fencing

## III.1. Quick pacemaker installation

Install pacemaker within each container:

```bash
$ sudo apt-get install pacemaker -y
```

Quickly edit your corosync.conf and modify the `bindnetadd` with the subnet of your container. Since your containers are manage by libvirt (and if you didn't specify anything else), they will get an IP address from the dnsmasq instance affiliate to libvirt-bin. So basically you should use the configuration below:

    interface {
        # The following values need to be set based on your environment 
        ringnumber: 0
        bindnetaddr: 192.168.122.0
        mcastaddr: 226.94.1.1
        mcastport: 5405
    }

Finally start corosync on both containers:

```bash
$ sudo service corosync start
$ sudo crm_mon -1
============
Last updated: Fri Aug 31 20:14:27 2012
Last change: Fri Aug 31 20:14:20 2012 via crmd on mon-conteneur-2
Stack: openais
Current DC: mon-conteneur-2 - partition with quorum
Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
2 Nodes configured, 2 expected votes
0 Resources configured.
============

Online: [ mon-conteneur mon-conteneur-2 ]
```

## III.2. Fencing prerequisite

Configure **every** machine (host and containers) and modify the libvirt behavior by editing your `/etc/libvirt/libvirtd.conf`. For the containers you will need to install the package `libvirt-bin` too and perform the same operation as above:

    listen_tls = 0
    listen_tcp = 1
    tcp_port = "16509"
    auth_tcp = "none"

And your `/etc/default/libvirtd-bin` with:

    libvirtd_opts="-d -l"

Finally restart libvirt-bin and verify that libvirt is listenning :). Also don't forget to allow the containers to connect to the host:

```bash
$ sudo iptables -I INPUT -m tcp -p tcp --dport 16509 -j ACCEPT
```

You should be able to run this test from one of your container:

```bash
$ sudo virsh --connect=lxc+tcp://192.168.0.1 list --all
 Id Name                 State
 ----------------------------------
 4982 mon-conteneur-2      running
 14916 mon-conteneur        running
```

Here the IP 192.168.0.1 is the address of the host machine.

## III.3. STONITH resources

Configure your stonith resources:

```bash
$ sudo crm configure primitive p_fence_mon_conteneur stonith:external/libvirt \
params hostlist="mon-conteneur" hypervisor_uri="lxc+tcp://192.168.0.1"
op monitor interval="60"
```

```bash
$ sudo crm configure primitive p_fence_mon_conteneur-2 stonith:external/libvirt \
params hostlist="mon-conteneur-2" hypervisor_uri="lxc+tcp://192.168.0.1"
op monitor interval="60"
```

Please notice that 

* `hypervisor_uri` is the IP address of the host running my containers. Driver (lxc) + Transport (tcp) + IP
* `hostlist` the name of the container to fence (use the name shown by `virsh list`)

Modify these values according to your setup.

We keep away each resource from their own server. Location rules are set like this because by convention STONITH doesn't fence his own node.

```bash
$ sudo crm configure location loc_fench_node1 fence_mon_conteneur p_fence_mon_conteneur -inf: mon-conteneur
$ sudo crm configure location loc_fench_node2 fence_mon_conteneur_2 p_fence_mon_conteneur-2 -inf: mon-conteneur-2
$ sudo crm configure property no-quorum-policy=ignore
$ sudo crm configure property stonith-enabled=true
```

You should end up we something like this:

    ============
    Last updated: Sat Sep  1 05:48:37 2012
    Last change: Sat Sep  1 05:48:34 2012 via cibadmin on container
    Stack: openais
    Current DC: mon-conteneur-2 - partition with quorum
    Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
    2 Nodes configured, 2 expected votes
    2 Resources configured.
    ============

    Online: [ mon-conteneur-2 mon-conteneur ]

    p_fence_mon_conteneur   (stonith:fence_virsh):  Started mon-conteneur-2
    p_fence_mon_conteneur-2 (stonith:fence_virsh):  Started mon-conteneur

<br />

# IV. Shoot!

From one of your container you can easily simulate a fencing operation:

```bash
$ sudo stonith -t external/libvirt hostlist=mon-conteneur hypervisor_uri="lxc+tcp://192.168.146.195" -T off mon-conteneur
external/libvirt[1279]: notice: Domain mon-conteneur was stopped
```

Perform a reboot:

```bash
$ sudo stonith -t external/libvirt hostlist=mon-conteneur hypervisor_uri="lxc+tcp://192.168.146.195" -T reset mon-conteneur
external/libvirt[2088]: notice: Domain mon-conteneur was stopped
external/libvirt[2088]: notice: Domain mon-conteneur was started
```

If you want to get more information about this STONITH plugin:

```bash
$ sudo stonith -m -t external/libvirt
<?xml version="1.0"?>
<!DOCTYPE resource-agent SYSTEM "ra-api-1.dtd">
<resource-agent name="external/libvirt">
<version>1.0</version>
<longdesc lang="en">
libvirt-based Linux host reset for Xen/KVM guest domain through hypervisor

</longdesc>
<shortdesc lang="en">libvirt STONITH device
</shortdesc>
<parameters>
<parameter name="hostlist" unique="1" required="1">
<content type="string" />
<shortdesc lang="en">
List of hostname[:domain_id]..
</shortdesc>
<longdesc lang="en">
List of controlled hosts: hostname[:domain_id]..
The optional domain_id defaults to the hostname. 
</longdesc>
</parameter>

<parameter name="hypervisor_uri" required="1">
<content type="string" />
<shortdesc lang="en">
Hypervisor URI
</shortdesc>
<longdesc lang="en">
URI for connection to the hypervisor.
driver[+transport]://[username@][hostlist][:port]/[path][?extraparameters]
e.g.
qemu+ssh://my_kvm_server.mydomain.my/system   (uses ssh for root)
xen://my_kvm_server.mydomain.my/              (uses TLS for client)

virsh must be installed (e.g. libvir-client package) and access control must
be configured for your selected URI.
</longdesc>
</parameter>
</parameters>

<actions>
<action name="start"   timeout="60" />
<action name="stop"    timeout="15" />
<action name="status"  timeout="60" />
<action name="monitor" timeout="60" interval="3600" />
<action name="meta-data"  timeout="15" />
</actions>
<special tag="heartbeat">
<version>2.0</version>
</special>
</resource-agent>
```

<br />

> Et voilà! This article didn't aim to do an LXC how-to but if you want to go further you can visit the [Ubuntu documentation](https://help.ubuntu.com/12.04/serverguide/lxc.html). LXC is a growing technology which involves more and more production use case. Hope it helps!
