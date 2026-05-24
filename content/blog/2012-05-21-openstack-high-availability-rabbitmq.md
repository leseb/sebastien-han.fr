---
title: "OpenStack High Availability: RabbitMQ"
date: 2012-05-21 11:28:00
slug: openstack-high-availability-rabbitmq
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![RabbitMQ](/images/rabbitmq-logo.png)

Rabbitmq has his own buildin cluster management system. Here, we don't need Pacemaker, everything is managed by RabbitMQ itself.

<!--more-->

RabbitMQ or more generally the management queues layer is a critical component of OpenStack because every requests/queries use this layer to communicate.

# I. Clustering setup

``` bash
$ sudo apt-get install rabbitmq-server
```

RabbitMQ generates a cookie for each server instance. This cookie must be the same on each member of the cluster:

``` bash
rabbitmq-01:~$ sudo cat /var/lib/rabbitmq/.erlang.cookie
ITCWRVSIDPHRSLGXBHCFc
rabbitmq-02:~$ rabbitmqctl stop_app
rabbitmq-02:~$ rabbitmqctl reset
rabbitmq-01:~$ sudo scp /var/lib/rabbitmq/.erlang.cookie rabbitmq-02:/var/lib/rabbitmq/.erlang.cookie
rabbitmq-02:~$ rabbitmqctl cluster rabbit@rabbitmq-01
Clustering node 'rabbit@rabbitmq-02' with ['rabbit@rabbitmq-01'] ...
...done.
```

Check your cluster status, on the node 01 or 02, whatever:

``` bash
rabbitmq-02:~$ sudo rabbitmqctl cluster_status
Cluster status of node 'rabbit@rabbitmq-02' ...
[{nodes,[{disc,['rabbit@rabbitmq-01']},{ram,['rabbitmq-02']}]},
 {running_nodes,['rabbit@rabbitmq-01','rabbit@rabbitmq-02']}]
 ...done.
```

Cluster nodes can be of two types: disk or ram. Disk nodes replicate data in ram and on disk, thus providing redundancy in the event of node failure and recovery from global events such as power failure across all nodes. Ram nodes replicate data in ram only and are mainly used for scalability. A cluster must always have at least one disk node.

You can also verify that the connection is well established between the node:

``` bash
$ sudo netstat -plantu | grep 10.0.
tcp        0      0 10.0.0.1:39958          10.0.0.2:46117          ESTABLISHED 5294/beam.smp
```

## I.1. Tips

### I.1.1. Change the IP or the hostname of a node

If you changed you IP address or your hostname, this is pretty nasty and harsh but it works:

``` bash
$ sudo rabbitmqctl stop_app
$ sudo dpkg-reconfigure rabbitmq-server
Stopping rabbitmq-server: RabbitMQ is not running
rabbitmq-server.
Starting rabbitmq-server: SUCCESS
rabbitmq-server.
```

The IP address and/or will be refresh in the rabbitmq database.

### I.1.2. Convert RAM node to Disk node

``` bash
rabbitmq-02:~$ sudo rabbitmqctl cluster_status
Cluster status of node 'rabbit@server-02' ...
[{nodes,[{disc,['rabbit@server-01']},{ram,['rabbit@server-02']}]},
 {running_nodes,['rabbit@server-01','rabbit@server-02']}]
...done.
rabbitmq-02:~$ sudo rabbitmqctl stop_app
Stopping node 'rabbit@server-02' ...
...done.
rabbitmq-02:~$ sudo rabbitmqctl cluster rabbit@server-01 rabbit@server-02
Clustering node 'rabbit@server-02' with ['rabbit@server-01',
                                         'rabbit@server-02'] ...
...done.
rabbitmq-02:~$ sudo rabbitmqctl start_app
Starting node 'rabbit@server-02' ...
...done.
rabbitmq-02:~$ sudo rabbitmqctl cluster_status
Cluster status of node 'rabbit@server-02' ...
[{nodes,[{disc,['rabbit@server-02','rabbit@server-01']}]},
 {running_nodes,['rabbit@server-01','rabbit@server-02']}]
...done.
```

# II. HAProxy configuration

Clustering doesn't mean high-availability, this is why I put a load-balancer on top. Here HAProxy will balance the request only on one node, if this node fails the request will be route to the other node. It's simple as that. The native port of HAproxy and the OpenStack queues ports are configured.

    global
        log 127.0.0.1   local0
        #log loghost    local0 info
        maxconn 1024
        #chroot /usr/share/haproxy
        user haproxy
        group haproxy
        daemon
        #debug
        #quiet

    defaults
        log     global
	#log 127.0.0.1:514 local0 debug
        log 127.0.0.1   local1 debug
        mode    tcp
        option  tcplog
        option  dontlognull
        retries 3
        option redispatch
        maxconn 1024

    # Default!
       timeout connect 5000ms
       timeout client 50000ms
       timeout server 50000ms

    listen rabbitmq_cluster 0.0.0.0:4369
        mode tcp
        balance roundrobin
        server server-07_active 172.17.1.8:4369 check inter 5000 rise 2 fall 3
        server server-08_backup 172.17.1.9:4369 backup check inter 5000 rise 2 fall 3

    listen rabbitmq_cluster_openstack 0.0.0.0:5672
        mode tcp
        balance roundrobin
        server server-07_active 172.17.1.8:5672 check inter 5000 rise 2 fall 3
        server server-08_backup 172.17.1.9:5672 backup check inter 5000 rise 2 fall 3

<span class="text_quote">W </span>** The use of HAProxy only makes sense if you have implemented the mirrored queues.**

<br />

<span class="text_quote">W </span>** Here we only have a RabbitMQ cluster which means that all data/state required for the operation of a RabbitMQ broker is replicated across all nodes, for reliability and scaling, with full ACID properties. An exception to this are message queues, which by default reside on the node that created them, though they are visible and reachable from all nodes. to achieve HA you need to implement mirrored queues in order to build a clustered mirrored queues RabbitMQ. This patch has been submitted on [Gerrit](https://review.openstack.org/#/c/10305/) and waiting for approval. This patch will only been available with Folsom.**

<br />

> At the moment a valid solution is to build something with Pacemaker/DRBD/RabbitMQ as an active/passive cluster. This setup is documented [on the RabbitMQ website](http://www.rabbitmq.com/pacemaker.html).
