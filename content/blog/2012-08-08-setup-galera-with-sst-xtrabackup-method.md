---
title: Setup Galera with SST XtraBackup method
date: 2012-08-29 11:53:00
slug: setup-galera-with-sst-xtrabackup-method
draft: false
categories: ["galera"]
tags: ["galera"]
---

![Setup Galera with SST XtraBackup method](/images/galera-sst-xtrabackup.jpg)

<!--more-->

# I. Considerations before going in production

## I.1. Synchronisation transfer

SST stands for State Snapshot Transfer, this method is used while adding a new node to the cluster.The current methods are availables:

* `mysqldump`: the donor node performs a mySQL dump and export it to the joiner node, you explicitly need the user and password of your MySQL database administor account
* `rsync`: the donor node rsync the database files to the joiner node
* `xtrabackup`: the donor uses the Percona binary to dump and export on fly the content of the database to the joiner

## I.2. Add a node process

It's really important to understand the big picture of adding a new node to a cluster. When a node is about to join the cluster, it sends a request through the gcomm url to a current member of the cluster. The chosen node status will changed from JOINED to DONOR and apparently a `FLUSH TABLES WITH READ LOCK` is performed by the SST method. During the process **only** the DONOR node is locked, that should be ok if your cluster is not really busy but if all the nodes are intensively in used you may consider one method rather than another. Indeed the **SST XtraBackup isn't a blocking method**.

<br />

# II. Setup

If you are familiar with MySQL and Galera you will notice that the installation and configuration are very trivials.

Add the Percona repository to your `/etc/apt/sources.list` file:

    deb http://repo.percona.com/apt squeeze main
    deb-src http://repo.percona.com/apt squeeze main

Add the repository key:

```bash
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

Install the related packages:

```bash
$ sudo apt-get update && sudo apt-get install percona-xtradb-cluster-client-5.5 percona-xtradb-cluster-server-5.5 percona-xtrabackup
```

Create a new configuration file called `my.cnf` and put the following content:

    [mysqld]

    # mysql general option
    bind-address = 0.0.0.0
    user            = mysql
    pid-file        = /var/run/mysqld/mysqld.pid
    socket          = /var/run/mysqld/mysqld.sock
    port            = 3306
    basedir         = /usr
    datadir         = /var/lib/mysql
    tmpdir          = /tmp
    lc-messages-dir = /usr/share/mysql
    skip-external-locking


    # galera related options
    wsrep_provider=/usr/lib/libgalera_smm.so
    wsrep_cluster_name="mon_beau_galera_cluster"
    wsrep_cluster_address="gcomm://0.0.0.0"
    wsrep_sst_auth=root:password
    wsrep_certify_nonPK=1
    wsrep_convert_LOCK_to_trx=0
    wsrep_auto_increment_control=1
    wsrep_drupal_282555_workaround=0
    wsrep_causal_reads=0
    wsrep_sst_method=xtrabackup

Finally start the service:

```bash
$ sudo service mysql start
$ sudo service mysql status
 * /usr/bin/mysqladmin  Ver 8.42 Distrib 5.5.24, for Linux on x86_64
 Copyright (c) 2000, 2011, Oracle and/or its affiliates. All rights reserved.

 Oracle is a registered trademark of Oracle Corporation and/or its
 affiliates. Other names may be trademarks of their respective
 owners.

 Server version     5.5.24-55
 Protocol version   10
 Connection     Localhost via UNIX socket
 UNIX socket        /var/run/mysqld/mysqld.sock
 Uptime:            22 min 37 sec

 Threads: 10  Questions: 178  Slow queries: 0  Opens: 171  Flush tables: 1  Open tables: 41  Queries per second avg: 0.131
```

Check if this node is ready to add member:

```mysql
mysql> SHOW status LIKE 'wsrep%';
+----------------------------+--------------------------------------+
| Variable_name              | Value                                |
+----------------------------+--------------------------------------+
| wsrep_local_state_uuid     | 3a018e96-e26b-11e1-0800-93b1b13c11f9 |
| wsrep_protocol_version     | 4                                    |
| wsrep_last_committed       | 0                                    |
| wsrep_replicated           | 0                                    |
| wsrep_replicated_bytes     | 0                                    |
| wsrep_received             | 37                                   |
| wsrep_received_bytes       | 2915                                 |
| wsrep_local_commits        | 0                                    |
| wsrep_local_cert_failures  | 0                                    |
| wsrep_local_bf_aborts      | 0                                    |
| wsrep_local_replays        | 0                                    |
| wsrep_local_send_queue     | 0                                    |
| wsrep_local_send_queue_avg | 0.000000                             |
| wsrep_local_recv_queue     | 0                                    |
| wsrep_local_recv_queue_avg | 0.000000                             |
| wsrep_flow_control_paused  | 0.000000                             |
| wsrep_flow_control_sent    | 0                                    |
| wsrep_flow_control_recv    | 0                                    |
| wsrep_cert_deps_distance   | 0.000000                             |
| wsrep_apply_oooe           | 0.000000                             |
| wsrep_apply_oool           | 0.000000                             |
| wsrep_apply_window         | 0.000000                             |
| wsrep_commit_oooe          | 0.000000                             |
| wsrep_commit_oool          | 0.000000                             |
| wsrep_commit_window        | 0.000000                             |
| wsrep_local_state          | 4                                    |
| wsrep_local_state_comment  | Synced (6)                           |
| wsrep_cert_index_size      | 0                                    |
| wsrep_causal_reads         | 0                                    |
| wsrep_cluster_conf_id      | 15                                   |
| wsrep_cluster_size         | 1                                    |
| wsrep_cluster_state_uuid   | 3a018e96-e26b-11e1-0800-93b1b13c11f9 |
| wsrep_cluster_status       | Primary                              |
| wsrep_connected            | ON                                   |
| wsrep_local_index          | 0                                    |
| wsrep_provider_name        | Galera                               |
| wsrep_provider_vendor      | Codership Oy <info@codership.com>    |
| wsrep_provider_version     | 2.1dev(r112)                         |
| wsrep_ready                | ON                                   |
+----------------------------+--------------------------------------+
```

The `wsrep_ready` value in **ON**, great!

Check the name of your cluster, it must be the same as the one you put in your `my.cnf`:

```mysql
mysql> SHOW variables LIKE 'wsrep_cluster_name';
+--------------------+--------------------------+
| Variable_name      | Value                    |
+--------------------+--------------------------+
| wsrep_cluster_name | mon_beau_percona_cluster |
+--------------------+--------------------------+
```

## I.4. Add a new node

Let say that the IP address of the current node is 10.0.0.1, repeat the same installation as above **except that you need to change the gcomm:// url**, you will put something like this:

* `gcomm://10.0.0.1`

After that change the URL of the first node, the address should be `gcomm://` so change it to `gcomm://10.0.0.2`, according to the IP address of the second node. Finally repeat the process to add more node.

As you add node, you will see this variable growing according to the number of node:

    +--------------------+-------+
    | Variable_name      | Value |
    +--------------------+-------+
    | wsrep_cluster_size | 3     |
    +--------------------+-------+

<br />

> Enjoy!
