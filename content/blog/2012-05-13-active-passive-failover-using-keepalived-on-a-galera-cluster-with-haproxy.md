---
title: Active/Passive failover using Keepalived on a MySQL Galera cluster with HAProxy
date: 2012-05-13
slug: active-passive-failover-using-keepalived-on-a-galera-cluster-with-haproxy
draft: false
categories: ["galera"]
tags: ["galera"]
---

![](/images/keepalived.png)

The simplest and the quickest implementation of heartbeat check.

<!--more-->

I. Installation
===============

In this tutorial, I will re use my previous architecture which is composed by a galera cluster (3 nodes) and 2 HAProxy nodes. All of this are up and running.

We install [Keepalived](http://www.keepalived.org/) on **both servers**:

```
ubuntu@haproxy-node01:~$ sudo apt-get install keepalived
```

As we wanted a virtual ip address we have to active the local binding on the kernel like this, always on both nodes:

```
ubuntu@haproxy-node01:~$ sudo echo 1 >/proc/sys/net/ipv4/ip_nonlocal_bind
```

I.1. Node 1 configuration
-------------------------

The configuration is located in `/etc/keepalived/keepalived.conf`:

```
vrrp_script chk_haproxy {
        script "killall -0 haproxy" # verify the pid is exist or not
	script "sudo service haproxy start"
        interval 1                      # check every 2 seconds
        weight 2                        # add 2 points of prio if OK
}
 
vrrp_instance VI_1 {
        interface eth1			# interface to monitor
        state MASTER
        virtual_router_id 51		# Assign one ID for this route
        priority 101                    # 101 on master, 100 on backup
        virtual_ipaddress {
            10.0.0.200		        # the virtual IP
        }
        track_script {
            chk_haproxy
        }
}
```

I.2. Node 2 configuration
-------------------------

The configuration is still located in `/etc/keepalived/keepalived.conf`:

```
vrrp_script chk_haproxy {
        script "killall -0 haproxy" # verify the pid is exist or not
	script "sudo service haproxy start"
        interval 1                      # check every 2 seconds
        weight 2                        # add 2 points of prio if OK
}
 
vrrp_instance VI_1 {
        interface eth1			# interface to monitor
        state MASTER
        virtual_router_id 51		# Assign one ID for this route
        priority 100                    # 101 on master, 100 on backup
        virtual_ipaddress {
            10.0.0.200		        # the virtual IP
        }
        track_script {
            chk_haproxy
        }
}
```

The little trick here is to add an extra line in your configuration file, the option will prevent failures from the haproxy daemon. Since the resource failovered Keepalived will always attempt to run haproxy. If haproxy is running it's not a big deal but if haproxy is not running it can be really useful.

```
script "sudo service haproxy start"
```

We launch the Keepalived daemon on **bot nodes**:

```
ubuntu@haproxy-node01:~$ sudo service keepalived start
```

Et voilà! Easier and quicker than Pacemaker implementation, but provides less features.
