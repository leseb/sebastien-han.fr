---
title: Highly Available LVS
date: 2012-10-19 01:17:00
slug: highly-available-lvs
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

![Highly Available LVS](/images/pacemaker-lvs.jpg)

Highly Available LVS.

<!--more-->

# I. The Linux Virtual Server

Official website definition:

The Linux Virtual Server is a highly scalable and highly available server built on a cluster of real servers, with the load balancer running on the Linux operating system. The architecture of the server cluster is fully transparent to end users, and the users interact as if it were a single high-performance virtual server.
LVS is protocol agnostic and can manage several services like http, ftp, ntp, pop, database, ssh, etc. Possibility are endless. LVS works on the layer 4.

## I.1. Alphabet soup

See below some technical vocabulary review:

* VIP: Virtual IP address, used by the director.
* RIP: Real IP address, IP configured on the interface of the machine behind the director.
* DIP: Director IP address, IP configured on the interface of the director. Commonly used by the real servers as a gateway.
* Director: server managing all the LVS servers.
* Real server: endpoint connection. Servers behind the director (eg. webservers)
* ipvsadm: cli which manages the LVS server.
* Weight: weight value for a real server. As big is the weight as many connection it will accept.


## I.2. Operation modes

### I.2.1. LVS-NAT

**LVS-NAT**: Network Address Translation: as his name suggests, LVS-NAT is based on the NAT networking model. When a client accesses the LVS server, the director acts as a router and performs a network address translation. The packet will go the a real server, which sends back his answer to a gateway (configured on the director). The client only sees the director, as the real servers only see the director. There are no direct communications between the client and the real servers. LVS and real servers must be in the same network or subnet and the gateway of the real servers must be the private IP address of a director. LVS-NAT is definitely the easiest implementation of LVS. LVS-NAT is OS agnostic, which means that every clients using an IP stack can use it, this makes it really universal. On a performance side, after a certain amount of connections and clients simultanetly connected, LVS-NAT could show some limitations. Keep in mind that **every** requests go through the director. Thus each request is translated and re-written by the director. A good solution is to scale out: adding more servers in the LVS pool, to load-balance accross multiple servers. Another solution consists to the use of LVS-DR.


                                ________
                               |        |
                               | client |
                               |________|
                               CIP=192.168.1.254
                                   |
                                (router)
                                   |
                     __________    |
                    |          |   |   VIP=192.168.1.110 (eth0:110)
                    | director |---|
                    |__________|   |   DIP=10.1.1.9 (eth0:9)
                                   |
                                   |
                  -----------------------------------
                  |                |                |
                  |                |                |
           RIP1=10.1.1.2      RIP2=10.1.1.3   RIP3=10.1.1.4 (all eth0)
           _____________     _____________    _____________
          |             |   |             |  |             |
          | realserver  |   | realserver  |  | realserver  |
          |_____________|   |_____________|  |_____________|


[Source drawing](http://www.austintek.com/LVS/LVS-HOWTO/HOWTO/LVS-HOWTO.LVS-NAT.html)

<br />

### I.2.2. LVS-DR 

**LVS-DR**: Direct Routing, this implementation is really close to LVS-NAT, every requests go through the director but the answers from the real servers directly go to the client. There is no more network address translation. Basically every real servers share the VIP with the director. The VIP is configured on the director on an interface (commonly loopback) to avoid ARP resolution problem. The "routage" is done on the layer 2 and packets are send by the director to MAC addresses. At the end, the director only modifies the IP frame, not the entire packet. It simply replaces the MAC address by the MAC address of a real server. Then the real server directly answers from his VIP to the client. The main avantage of this method is that the director only revieves the request and the reply goes from the real server to the client without any intermediary. The load on the director is reduced very significantly. The major inconvenient is the ARP resolution that it implies. **Only** the director should answer on a request to the VIP and not the real servers, because the director is supposed to read the client requests and assign them to a real server. In the meantime, because of the design the real servers need the VIP to answer directly to the client. This could lead to ARP resolution conflicts. To avoid those problem we generally configure the VIP on the loopback interface (or other interface it doesn't really matter) **and** two more things: 

* we ignore ARP resolution like so `echo 1 > /proc/sys/net/ipv4/conf/<interface>/arp_ignore` 
* `echo 2 >/proc/sys/net/ipv4/conf/<interface>/arp_announce`


<br />
                                   ________
                                  |        |
                                  | client |
                                  |________|
                                  CIP=192.168.1.254
                                      |
                           CIP->VIP | |
                                    v |
                                      |
                                   ________
                                  |        | R
                                  | router |------------- 
                                  |________|             | 
                                      | D                |
                                      |                  |
                         VIP=192.168.1.110 (eth0:1, arps)|
                                  __________             |
                                 |          |            |
                                 | director |            |
                                 |__________|            |
                                DIP=10.0.1.1 (eth1)      | 
                                      |                  |  ^             
        MAC_DIP->MAC_RIP1(CIP->VIP) | |                  |  |  VIP->CIP 
                                    v |                  |
                                      |                  |
                     -------------------------------------
                     |                |                  |
                     |                |                  |
              RIP1=10.0.1.2     RIP2=10.0.1.3     RIP3=10.0.1.4 (eth0)
              VIP=192.168.1.110 VIP=192.168.1.110 VIP=192.168.1.110 (all lo:0, non-arping)
             ______________     _____________      _____________
            |              |   |             |    |             |
            |lo:  CIP->VIP |   |             |    |             |
            |eth0:VIP->CIP |   |             |    |             |
            | realserver   |   | realserver  |    | realserver  |
            |______________|   |_____________|    |_____________|


[Source drawing](http://www.austintek.com/LVS/LVS-HOWTO/HOWTO/LVS-HOWTO.LVS-DR.html)

<br />

### I.2.3. LVS-TUN

**LVS-TUN**: IP Tunneling, the implementation is closer to LVS-DR than LVS-NAT because the director doesn't translate anything. It encapsulates the packet in another IP packet. It means that the IP tunneling should be configured between the director and the real servers. The most relevant advantage of this method is the location and the network of the real servers, which does not really matter. You can use machines on different datacenters. The only requirement is that the real servers need to support IP tunneling.


                               ________
                              |        |
                              | client |
                              |________|
                              CIP=x.x.x.1
                                  |
                    CIP->VIP |    |---------------------------------
                             v    |                                 |
                              __________                            | 
                             |          |                           |
                             | D-router |                           |
                             |__________|                           |
                                  |                                 |
                    CIP->VIP |    |                                 |
                             v    |                                 |
                                  |                                 |
                        VIP=y.y.y.110(eth0, arps)                   |
                              __________                            |
                             |          |                           |
                             | director |                           |
                             |__________|                           |
                        DIP=176.0.0.1 (eth1)                        |
                                  |                              ^  |
          DIP->RIP1(CIP->VIP) |   |                     VIP->CIP |  |
                              v   |                                 |
                              __________                       __________
                             |          |                     |          | 
                             | R-router |  R,C-Router do not  | C-Router |
                             |__________|   advertise VIP     |__________|
                                  |                                 |
                                  |                              ^  |
          DIP->RIP1(CIP->VIP) |   |                     VIP->CIP |  |
                              v   |                                 |
                                  |                                 |
                 ----------------------------------------------------
                 |                           |
                 |                           |
          RIP1=10.0.0.1(eth0)       RIP2=10.0.0.2(eth0)
          VIP=y.y.y.110(tunl0)      VIP=y.y.y.110(tunl0)
                 |                           |
          _________________         ___________________     
         |                 |       |                   | 
         | realserver      |       | realserver        |
         | tunl0: CIP->VIP |       |                   |
         | eth0:  VIP->CIP |       |                   | 
         |_________________|       |___________________|


[Source drawing](http://www.austintek.com/LVS/LVS-HOWTO/HOWTO/LVS-HOWTO.LVS-Tun.html)

<br />

## I.3. Load-balancing algorithm

The LVS scheduler supports several algorithms:

* **rr** : Round-Robin, the load is balanced circularly accross all the real servers.
* **wrr** : Weighted Round-Robin, same as the Round-Robin despiste of the act that the `weight` is taken into account for the load repartition.
* **lc** : least Connection, the load is balanced on the less busy server.
* **wlc** : Weighted Least-Connection, efficient combinaison between wrr and lc. The load is balanced according to the weight and the usage/load of a server.
* **lblc** : Locality Based Least Connection,  the connections always stick with the same servers, unless the server is over-loaded. The director keeps track of the real server that have been assigned to a client.

<br />

# II. LVS-NAT setup

In order to achieve HA we are going to use corosync and pacemaker.

## II.1. Pre-requisite

I assume that you already have a Pacemaker cluster up and running. I'll explain the LVS HA configuration not the Pacemaker setup. Install the packages:

```bash
$ sudo apt-get install ldirectord -y
```

We need to route packets from a network to an another. Uncomment the line in `/etc/sysctl.conf` and put 1 instead of 0:

    net.ipv4.ip_forward = 1

Finally apply the changes:

```bash
$ sudo sysctl -p
```

See below my configuration file:

    # Global Directives
    checktimeout=10
    checkinterval=15
    fallback=127.0.0.1:80
    autoreload=yes
    logfile="/var/log/ldirectord.log"
    logfile="local0"
    quiescent=yes
    callback="/usr/local/bin/sync_ldirectord"
    
    # Virtual Server for HTTP
    virtual=192.168.0.1:80
            real=172.16.0.1:80 masq 100
            real=172.16.0.2:80 masq 100
            real=172.16.0.3:80 masq 100
            service=http
            request="check_lvs.html"
            receive="up"
            scheduler=wlc
            persistent=600
            protocol=tcp
            checktype=negotiate

I like to use the Weighted Least-Connection algorithm because it offers a lot of flexibility. You can easily play around with the weight of the servers, it could be really useful during a brutal and unexpected load pic.

## II.2. Pacemaker configuration

First configure the VIP:

```bash
$ sudo crm configure primitive p_vip_lvs ocf:heartbeat:IPaddr2 \
    params ip="192.168.0.1" cidr_netmask="24" nic="eth0" iflabel="vip_lvs"
```

Then configure the RIP of the director (gateway for the real servers):

```bash
$ sudo crm configure primitive p_rip_gw \
    params ip="172.16.0.1" cidr_netmask="24" nic="eth1" iflabel="rip_gw" 
```

Note that if you use LVS-DR, you need to use the `lvs_support=true` parameter.

And configure the ldirector RA:

```bash
$ sudo crm configure primitive p_ldirectord ocf:heartbeat:ldirectord \
    params configfile="/etc/ha.d/ldirectord.cf"
    op monitor interval="20" timeout="10"
```

Finally create a group for those resources:

```bash
$ sudo crom configure group g_lvs  p_vip_lvs p_rip_gw  p_ldirectord
```

Now you should see something like:

    ============
    Last updated: Mon Oct 15 17:15:51 2012
    Last change: Mon Oct 15 12:24:22 2012 via crm_attribute on c2-lvs-01
    Stack: openais
    Current DC: c2-lvs-02 - partition with quorum
    Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
    2 Nodes configured, 2 expected votes
    3 Resources configured.
    ============

    Online: [ lvs-01 lvs-02 ]

     Resource Group: g_lvs
         p_vip_lvs (ocf::heartbeat:IPaddr2):   Started lvs-01
         p_rip_gw    (ocf::heartbeat:IPaddr2):   Started lvs-01
         p_ldirectord   (ocf::heartbeat:ldirectord):    Started lvs-01

<br />

## II.3. Keep configuration file up-to-date

For this purpose, we use the `callback` option. If this directive is defined, ldirectord automatically calls the executable /path/to/callback after the configuration file has changed on disk.

See below an example:

    callback="/usr/local/bin/sync_ldirectord"

The `sync_ldirectord` script:

```bash
#!/bin/bash
# This script maintains an up to date configuration file for ldirectord, everytime the server 'autoreload', the ldirectord.cf is synced.

rsync -aq /etc/ha.d/ldirectord.cf lvs-02-ha:/etc/ha.d/ldirectord.cf
```


## II.4. Keep the connection state after a failover

First of all the option `-c` allows you to see the current connections:

```bash
$ sudo ipvsadm -Lnc
IPVS connection entries
pro expire state       source           virtual           destination
TCP 00:18  SYN_RECV    *.*.*.*:55212    192.168.0.1:80    172.16.0.1:80
TCP 00:18  SYN_RECV    *.*.*.*:55214    192.168.0.1:80    172.16.0.2:80
TCP 00:18  SYN_RECV    *.*.*.*:55213    192.168.0.1:80    172.16.0.2:80
```

`*.*.*.*` are public IP addresses

Server State Sync Demon, syncd (saving the director's connection state on failover):

```bash
$ sudo dpkg-reconfigure ipvsadm
```

Some steps are required to reconfigure the package:

* Do you want automaticcally load IPVS rules on boot? **Yes**
* Daemon method: **Both**
* Multicast interface for ipvadm: **eth0** ?

At the end of the last step, you should see:

    update-rc.d: warning: ipvsadm start runlevel arguments (2 3 4 5) do not match LSB Default-Start values (2 3 5)
     * Clearing the current IPVS table...                                                                                         [ OK ] 
     * Loading IPVS configuration...                                                                                              [ OK ] 
     * Starting IPVS Connection Synchronization Daemon master                                                                     [ OK ] 

Now both master and backup daemon are running on both LVS servers and synchronized the connection state.
If you check your open port, you will see the multicast address:

    Proto Recv-Q Send-Q Local Address           Foreign Address         State       User       Inode       PID/Program name
    udp        0      0 172.20.1.62:56809       224.0.0.81:8848         ESTABLISHED 0          291194      -               
    udp        0      0 224.0.0.81:8848         0.0.0.0:*                           0          293624      -    

Ok, but does it work? If you go the second node (inactive), you can check the connection status. You must see the same number of connections as the active node. An easy test could lead to something like:

```bash
lvs-01:~$ sudo ipvsadm -Lnc | wc -l
12
lvs-02:~$ sudo ipvsadm -Lnc | wc -l
12
```

We have exactly the same number of connections :-).

## II.5. Efficiency corner

In order to don't cut the client connections, put this in your `/etc/sysctl.conf` file:

    # LVS
    net.ipv4.vs.expire_nodest_conn=1
    net.ipv4.vs.expire_quiescent_template=1

Finally apply the changes:

```bash
$ sudo sysctl -p
net.ipv4.vs.expire_nodest_conn = 1
net.ipv4.vs.expire_quiescent_template = 1
```

Man page quote:

* expire_nodest_conn - BOOLEAN - 0 - disabled (default) - not 0 - enabled
The default value is 0, the load balancer will silently drop packets when its destination server is not available. It may be useful, when user-space monitoring program deletes the destination server (because of server overload or wrong detection) and add back the server later, and the connections to the server can continue.

If this feature is enabled, the load balancer will expire the connection immediately when a packet arrives and its destination server is not available, then the client program will be notified that the connection is closed. This is equivalent to the feature some people requires to flush connections when its destination is not available.

* expire_quiescent_template - BOOLEAN - 0 - disabled (default) - not 0 - enabled
When set to a non-zero value, the load balancer will expire persistent templates when the destination server is quiescent. This may be useful, when a user makes a destination server quiescent by setting its weight to 0 and it is desired that subsequent otherwise persistent connections are sent to a different destination server.  By default new persistent connections are allowed to quiescent destination servers.

If this feature is enabled, the load balancer will expire the persistence template if it is to be used to schedule a new connection and the destination server is quiescent.

For a deep understanding go to the [Linux Virtual Server Holy Bible](http://www.austintek.com/LVS/LVS-HOWTO/HOWTO/).

<br />

>As you can see now, LVS is an amazing software, in this article I barely show his potential. I hope it helps!
