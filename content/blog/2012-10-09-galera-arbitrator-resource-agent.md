---
title: Galera arbitrator resource agent
date: 2012-10-10 14:50:00
slug: galera-arbitrator-resource-agent
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

![Galera arbitrator resource agent](/images/garbd.jpg)

If you run XtraDB/Galera in a 2 nodes cluster, it implies that on a split-brain event both nodes will goes down. That's the default behavior of the cluster management system of Galera. This could be changed but we don't really want that. This is why we use `garbd` in order to prevent split-brain situation. Basically it connects to your cluster and acts as a member. Let's say someone, inadvertently bring down the dedicated link interface of your cluster, you're in big trouble. In this particular situation `garbd` will act as a replication replay. That will let you some time to investigate about the outage without any downtime.

<!--more-->

This article doesn't aim to explain how Galera works neither garbd. For this you can refer to my [Galera post](http://www.sebastien-han.fr/blog/2012/04/01/mysql-multi-master-replication-with-galera/).

On both both cluster nodes, add the Percona repository

```bash
$ sudo echo "deb http://repo.percona.com/apt squeeze main" > /etc/apt/sources.list.d/percona.list
$ sudo echo " deb-src http://repo.percona.com/apt squeeze main" >> /etc/apt/sources.list.d/percona.list
$ sudo gpg --keyserver  hkp://keys.gnupg.net --recv-keys 1C4CBDCDCD2EFD2A
gpg: directory `/root/.gnupg' created
gpg: new configuration file `/root/.gnupg/gpg.conf' created
gpg: WARNING: options in `/root/.gnupg/gpg.conf' are not yet active during this run
gpg: keyring `/root/.gnupg/secring.gpg' created
gpg: keyring `/root/.gnupg/pubring.gpg' created
gpg: requesting key CD2EFD2A from hkp server keys.gnupg.net
gpg: /root/.gnupg/trustdb.gpg: trustdb created
gpg: key CD2EFD2A: public key "Percona MySQL Development Team <mysql-dev@percona.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
$ sudo gpg -a --export CD2EFD2A | sudo apt-key add -
OK
```

Download and install the package which contains `garbd`:

```bash
$ sudo apt-get update && sudo apt-get install percona-xtradb-cluster-galera-2.x -y
```

Prepare your system to properly work with garbd, any common user works fine. It just makes to me to create a garbd user to run the daemon:

```bash
$ sudo useradd garbd
$ sudo mkdir /var/log/garbd/
$ sudo chown garbd:garbd /var/log/garbd
```

I assume that you already have a Pacemaker cluster up and running. Thus download the RA and configure the pacemaker resource:

```bash
$ sudo wget https://raw.github.com/leseb/Scripts/master/garbd -O /usr/lib/ocf/resource.d/heartbeat/garbd
$ sudo chmod 755 /usr/lib/ocf/resource.d/heartbeat/garbd
$ sudo crm configure p_garbd ocf:heartbeat:garbd \
    params gcomm_url="172.20.1.54" donor_port="4567" \
    user="garbd" \
    cluster_name="cloud-controller-galera" \
    additional_parameters="-l /var/log/garbd/garbd.log" \
    op monitor interval="15s"
```

As always if you need more information about the RA:

```bash
$ sudo crm ra info ocf:heartbeat:garbd
Manages the Galera arbitrator Service (garbd) (ocf:heartbeat:garbd)

Resource agent for the Galera arbitrator (garbd). http://www.codership.com/wiki/doku.php?id=galera_arbitrator.

Parameters (* denotes required, [] the default):

binary (string, [garbd]): Galera arbitrator binary (garbd)
    Location of the Galera arbitrator binary (garbd)

user* (string, [garbd]): Galera arbitrator (garbd) user
    User running Galera arbitrator (garbd) service

pid (integer, [/var/run/resource-agents/undef.pid]): Galera arbitrator (garbd) pid file
    The pid file to use for this Galera arbitrator (garbd) process

donor_port* (integer): Donor listenning port
    The listening port number of the donor node.

gcomm_url* (string): Donor URL
    The gcomm url, ip address of a node member of the cluster

cluster_name* (string): Galera cluster name
    The name of your galera cluster. SHOW VARIABLES LIKE 'wsrep_cluster_name'; to find out the cluster name.

additional_parameters (string): Additional parameters for the Galera arbitrator
    Additional parameters to pass on to the Galera arbitrator (garbd)

Operations' defaults (advisory minimum):

    start         timeout=20
    stop          timeout=20
    status        timeout=20
    monitor       interval=20 timeout=30
```

As you can see some paramters are mandatory (starred once):

* user
* donor_port
* gcomm_url
* cluster_name

Once your resource is running, check your Galera cluster:

```sql
mysql> SHOW STATUS LIKE 'wsrep_cluster_size' ;
+--------------------+-------+
| Variable_name      | Value |
+--------------------+-------+
| wsrep_cluster_size | 3     |
+--------------------+-------+
```

It works!

<br />

> Enjoy! ;-)
