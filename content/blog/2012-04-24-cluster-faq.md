---
title: Cluster FAQ
date: 2012-04-24 10:05:00
slug: cluster-faq
draft: false
categories: ["pacemaker"]
tags: []
---

![](/images/pacemaker-faq.png)

Some useful tips and tricks for managing your pacemaker cluster.

<!--more-->

I. Change your virtual ip address
---------------------------------

```
# crm configure edit
commit
show
verify
end
quit
```

II. Change your text editor
---------------------------

```
# crm options editor vim
```

III. Add a new node to your cluster
-----------------------------------

Step by step:

1. Install pacemaker on the new node
2. Make sure that the new is on the same subnet as your current cluster nodes
3. Copy using `scp` your `/etc/corosync/corosync.conf` and your `/etc/authkey` on the new node
4. Start the corosync daemon on the new node `service corosync start`

IV. Put a node on standy
------------------------

```
# crm
crm(live)# node
crm(live)node# standby [your-node]
crm(live)node# quit
bye
```

V. Migrate a resource
---------------------

```
# crm
crm(live)# resource
crm(live)resource# list
failover-ip     (ocf::heartbeat:IPaddr) Started
crm(live)resource# migrate failover-ip cluster-node-1
crm(live)resource# bye
bye
```

VI. Stop and delete a cluster resource
--------------------------------------

```
# crm resource stop [your-resource]
# crm configure delete [your-resource]
```

VII. On which node is running your resource?
--------------------------------------------

```
# crm_resource -r failover-ip -W
resource failover-ip is running on: cluster-node-1
```

VIII. Resource OCF details
--------------------------

You can list the resource agent from each classes (lsb, ocf...) and from each provider (hearbeat...)
```
# crm ra list ocf heartbeat
AoEtarget           AudibleAlarm        CTDB                ClusterMon          Delay               Dummy               EvmsSCC             Evmsd               Filesystem          ICP
IPaddr              IPaddr2             IPsrcaddr           IPv6addr            LVM                 LinuxSCSI           MailTo              ManageRAID          ManageVE            Pure-FTPd
Raid1               Route               SAPDatabase         SAPInstance         SendArp             ServeRAID           SphinxSearchDaemon  Squid               Stateful            SysInfo
VIPArip             VirtualDomain       WAS                 WAS6                WinPopup            Xen                 Xinetd              anything            apache              db2
drbd                eDir88              iSCSILogicalUnit    iSCSITarget         ids                 iscsi               ldirectord          mysql               mysql-proxy         nfsserver
oracle              oralsnr             pgsql               pingd               portblock           postfix             proftpd             rsyncd              scsi2reservation    sfex
```

More ra details:

```
# crm ra meta IPaddr
Manages virtual IPv4 addresses (portable version) (ocf:heartbeat:IPaddr)

This script manages IP alias IP addresses
It can add an IP alias, or remove one.

Parameters (* denotes required, [] the default):

ip* (string): IPv4 address
	The IPv4 address to be configured in dotted quad notation, for example
	"192.168.1.1".

nic (string, [eth0]): Network interface
	The base network interface on which the IP address will be brought
	online.

	If left empty, the script will try and determine this from the
	routing table.

	Do NOT specify an alias interface in the form eth0:1 or anything here;
	rather, specify the base interface only.

cidr_netmask (string): Netmask
	The netmask for the interface in CIDR format. (ie, 24), or in
	dotted quad notation  255.255.255.0).

	If unspecified, the script will also try to determine this from the
	routing table.

broadcast (string): Broadcast address
	Broadcast address associated with the IP. If left empty, the script will
	determine this from the netmask.

iflabel (string): Interface label
	You can specify an additional label for your IP address here.

lvs_support (boolean, [false]): Enable support for LVS DR
	Enable support for LVS Direct Routing configurations. In case a IP
	address is stopped, only move it to the loopback device to allow the
	local node to continue to service requests, but no longer advertise it
	on the network.

local_stop_script (string):
	Script called when the IP is released

local_start_script (string):
	Script called when the IP is added

ARP_INTERVAL_MS (integer, [500]): milliseconds between gratuitous ARPs
	milliseconds between ARPs

ARP_REPEAT (integer, [10]): repeat count
	How many gratuitous ARPs to send out when bringing up a new address

ARP_BACKGROUND (boolean, [yes]): run in background
	run in background (no longer any reason to do this)

ARP_NETMASK (string, [ffffffffffff]): netmask for ARP
	netmask for ARP - in nonstandard hexadecimal format.

Operations' defaults (advisory minimum):

	start         timeout=20s
	stop          timeout=20s
	monitor_0     interval=5s timeout=20s
```

IX. How do I backup/restore my cluster configuration?
-----------------------------------------------------

There are 2 ways to backup and/or restore your cluster configuration.

First you can backup/restore your CIB configuration.

CIB Backup:
```
# crm configure save _BACKUP_PATH_
```

CIB restore:

```
# crm configure load replace _BACKUP_PATH
```

The second one is the xml configuration (which is the same but in xml format).

XML backup:

```
# cibadmin -Q > _BACKUP_PATH_
```

XML restore
```
# cibadmin --replace --xml-file _BACKUP_PATH_
```

X. Troubleshooting
---------------------

Use the crm command, you can as many `V` as you want.

```
# crm_verify -LV
```


