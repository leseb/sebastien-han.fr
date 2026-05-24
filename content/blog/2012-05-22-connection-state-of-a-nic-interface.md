---
title: Connection state of a NIC
date: 2012-05-22 10:15:00
slug: connection-state-of-a-nic-interface
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

Sometimes you want to know if the network cable is plug but you don't want to go to the server room.

<!--more-->

In my case it was the `eth2` interface.
First check if the interface is well connected and detected by the kernel:

``` bash
$ cat /proc/net/dev | grep eth2
   eth2:       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
```

Now check the connection status:

``` bash
$ grep "" /sys/class/net/eth2/operstate
down
```

See an ordered list of all parameters:

``` bash
$ grep "" /sys/class/net/eth2/*
/sys/class/net/eth2/addr_assign_type:0
/sys/class/net/eth2/address:00:04:23:ad:98:a4
/sys/class/net/eth2/addr_len:6
/sys/class/net/eth2/broadcast:ff:ff:ff:ff:ff:ff
grep: /sys/class/net/eth2/carrier: Invalid argument
/sys/class/net/eth2/dev_id:0x0
grep: /sys/class/net/eth2/dormant: Invalid argument
grep: /sys/class/net/eth2/duplex: Invalid argument
/sys/class/net/eth2/flags:0x1002
/sys/class/net/eth2/ifindex:4
/sys/class/net/eth2/iflink:4
/sys/class/net/eth2/link_mode:0
/sys/class/net/eth2/mtu:1500
/sys/class/net/eth2/netdev_group:0
/sys/class/net/eth2/operstate:down
grep: /sys/class/net/eth2/speed: Invalid argument
/sys/class/net/eth2/tx_queue_len:1000
/sys/class/net/eth2/type:1
/sys/class/net/eth2/uevent:INTERFACE=eth2
/sys/class/net/eth2/uevent:IFINDEX=4
```

The `Invalid argument` seems logic since the interface is not connected

You can also simply check the kernel logs like so:

``` bash
$ dmesg | grep eth2
[    1.174034] e1000 0000:04:02.0: eth2: (PCI-X:133MHz:64-bit) 00:04:23:ad:98:a4
[    1.174042] e1000 0000:04:02.0: eth2: Intel(R) PRO/1000 Network Connection
[    5.940934] ADDRCONF(NETDEV_UP): eth2: link is not ready
```

> At the end, I went to the server room...
Can be useful :)
