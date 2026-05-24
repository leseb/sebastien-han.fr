---
title: Xtradb/Galera and bonded interface
date: 2012-10-05 00:42:00
slug: xtradb-slash-galera-and-bonded-interface
draft: false
categories: ["galera"]
tags: ["galera"]
---

![Xtradb Galera and bonded interface](/images/galera-bonded.jpg)

Very short post about an issue I've been through while deploying a new XtraDB cluster.

<!--more-->

Like I said in the header of this post, I've been through a tricky issue.

The message from `syslog`, **not relevant at all**:

    /etc/init.d/mysql[7189]: 0 processes alive and '/usr/bin/mysqladmin --defaults-file=/etc/mysql/debian.cnf ping' resulted in
    /etc/init.d/mysql[7189]: #007/usr/bin/mysqladmin: connect to server at 'localhost' failed
    /etc/init.d/mysql[7189]: error: 'Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)'
    /etc/init.d/mysql[7189]: Check that mysqld is running and that the socket: '/var/run/mysqld/mysqld.sock' exists!

How much more useless can you get?

Fortunately the MySQL error log were *a bit* clearer (`/var/lib/mysql/c2-controller-02.err`)

    [Note] WSREP: wsrep_load(): loading provider library '/usr/lib/libgalera_smm.so'
    [Note] WSREP: wsrep_load(): Galera 2.2(r115) by Codership Oy <info@codership.com> loaded succesfully.
    [Warning] WSREP: Failed to autoguess base node address
    [Warning] WSREP: Could not open saved state file for reading: /var/lib/mysql//grastate.dat
    [Note] WSREP: Found saved state: 00000000-0000-0000-0000-000000000000:-1
    [Note] WSREP: Preallocating 134219048/134219048 bytes in '/var/lib/mysql//galera.cache'...
    [Note] WSREP: Passing config to GCS: gcache.dir = /var/lib/mysql/; gcache.keep_pages_size = 0; gcache.mem_size = 0; gcache.name = /var/lib/mysql//galera.cache; gcache.page_size = 128M; gcache.size = 128M; gcs.fc_debug = 0; gcs.fc_factor = 0.5; gcs.fc_limit = 16; gcs.fc_master_slave = NO; gcs.max_packet_size = 64500; gcs.max_throttle = 0.25; gcs.recv_q_hard_limit = 9223372036854775807; gcs.recv_q_soft_limit = 0.25; gcs.sync_donor = NO; replicator.causal_read_timeout = PT30S; replicator.commit_order = 3
    [Note] WSREP: Flushing memory map to disk...
    [ERROR] WSREP: non-standard exception
    [ERROR] WSREP: wsrep::init() failed: 6, must shutdown
    [ERROR] Aborting

At the first, I thought that `ERROR` messages were pretty *common*, but while looking closely I saw:

    [Warning] WSREP: Failed to autoguess base node address 

It's not so explicit, especially the facility used by the log `[Warning]`, pretty surprising anyway... Basically Galera function to auto-discover the IP address of your current doesn't work really well when you have a lot of interfaces.

The solution is to set the IP address inside your `my.cnf` with the following option:

    wsrep_node_address=ip_address

After this everything works like a charm.
<br />

> I hope that some of you will save some time thanks to this!
