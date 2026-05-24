---
title: Multi MySQL instances with Galera
date: 2012-08-06 17:20:00
slug: multi-mysql-instances-with-galera
draft: false
categories: ["galera"]
tags: ["galera"]
---

![Multi MySQL instances with Galera](/images/galera-fleet.jpg)

No! This article is not about [Ben-Hur](http://www.imdb.com/title/tt0052618/) or some other ancient Rome's history facts. It's yet another article about Galera, I don't introduce Galera anymore. This how-to will help you to run multiple MySQL instance replicated thanks to Galera.

<!--more-->

# I. Principle

MySQL Multi?

This term stands for running multiple MySQL instances on the same server. Each instance will be completely isolated to the others. Indeed every running instance will have some dedicated stuff:

* User, running the MySQL process
* Socket
* Port: like 3306
* Directory: contains all the MySQL environment owned by the instance (database, bin-log, etc...)

For further information [visit the MySQL official documentation](http://dev.mysql.com/doc/refman/5.5/en/mysqld-multi.html).

In this article I assume that Galera is already installed. If you don't know how to setup Galera, [check my article about it](http://www.sebastien-han.fr/blog/2012/04/01/mysql-multi-master-replication-with-galera/). First make sure that you can run MySQL on both node with Galera replication fully functionnal. Since you validate that, we can start to work on MySQL multi.

What do you need?

* An existing Galera setup
* The [mysqld_multi script](https://github.com/leseb/Scripts/blob/master/mysqld_multi.sh). This script seeks for a **[mysqld]** section in `my.cnf` and executes the instance according to the number used as argument. Example: [mysqld1]
* The [INIT script for mysqld_multi](https://github.com/leseb/Scripts/blob/master/mysqld_multi_init.sh)
* A **good knowledge** of Galera, I highly suggest you to read my previous article about Galera

<br />

# II. Setup

## II.1. Requirements installation

Install the mysql multi management script (if not already present on your system):

```bash
$ sudo wget https://raw.github.com/leseb/Scripts/master/mysqld_multi.sh -O /usr/bin/mysql_multi
$ sudo chmod 755 /usr/bin/mysql_multi
```

Install the INIT script:

```bash
$ sudo wget https://raw.github.com/leseb/Scripts/master/mysqld_multi_init.sh -O /etc/init.d/mysql_multi
$ sudo chmod +x /etc/init.d/mysql_multi
$ sudo update-rc.d mysql_multi defaults
update-rc.d: warning: /etc/init.d/mysql_multi missing LSB information
update-rc.d: see <http://wiki.debian.org/LSBInitScripts>
 Adding system startup for /etc/init.d/mysql_multi ...
   /etc/rc0.d/K20mysql_multi -> ../init.d/mysql_multi
   /etc/rc1.d/K20mysql_multi -> ../init.d/mysql_multi
   /etc/rc6.d/K20mysql_multi -> ../init.d/mysql_multi
   /etc/rc2.d/S20mysql_multi -> ../init.d/mysql_multi
   /etc/rc3.d/S20mysql_multi -> ../init.d/mysql_multi
   /etc/rc4.d/S20mysql_multi -> ../init.d/mysql_multi
   /etc/rc5.d/S20mysql_multi -> ../init.d/mysql_multi
```

## II.2. MySQL multi and Galera

### II.2.1. MySQL Multi

Here we are!

The use case designed here is the following: you have multiple customers and you provide a database shared storage (as a service or not). You need a complete isolation between all the instances. For use case purpose we setup 2 instances. Each instances will be one customer.

First create a directory for mysqld_multi, this directory will store the logs of the management script:

```bash
$ sudo mkdir -p /mysql/mysqld_multi/
```

Use case **customer 01**:

```bash
$ sudo mkdir -p /mysql/customer01/{data,innodb,innodb_log,binlog,relaylog,log,tmp,socket}
$ sudo useradd -r -c "MySQL customer01" -d /mysql/customer01 -s /sbin/nologin -u 1001 customer01
$ sudo chown -R customer01 /mysql/customer01/
$ sudo 750 /mysql/customer01/
```

Use case **customer 02**:

```bash
$ sudo mkdir -p /mysql/customer02/{data,innodb,innodb_log,binlog,relaylog,log,tmp,socket}
$ sudo useradd -r -c "MySQL customer02" -d /mysql/customer02 -s /sbin/nologin -u 1002 customer02
$ sudo chown -R customer02 /mysql/customer02/
$ sudo 750 /mysql/customer02/
```

Now create the MySQL environment for each instances. `mysql_install_db` initializes the MySQL data directory and creates the system tables that it contains, if they do not exist.

```bash
$ sudo mysql_install_db --user=customer01 --datadir=/mysql/customer01/data
$ sudo mysql_install_db --user=customer02 --datadir=/mysql/customer02/data
```

<span class="text_quote">W </span>**ATTENTION: those actions need to be performed on EVERY nodes.**

### II.2.2. The Galera trick

Since we use Galera, you have to **completely understand** how the replication works internally, rather the `gcomm://` URL purpose. It's already explained in my first article about Galera. But here is a little reminder:

* wsrep_cluster_address: Address to connect to cluster. For example `gcomm://10.0.0.1:5675`.
* wsrep_provider_options="gmcast.listen_addr=tcp://0.0.0.0:5675". Address at which Galera listens to connections from other nodes

During your first setup, your first node needs to use this `gcomm://`, since it's the beginning of the setup there is no member to connect with. The first node will act as the donnor for the next once. This is why the other node will use the type of URL: gcomm://donnor-ip address. 
Since we run multiple instance, there is as many replication as the number of of instance. Each instance will listen to connection from other nodes with the `gmcast.listen_addr` parameter.

Picture speaks louder than workds:

![Replication way](/images/replication-way-galera-multi.png)

<span class="text_quote">W </span>** NEVER EVER KEEP THE GCOMM URL LIKE THIS: gcomm://0.0.0.0. This address becomes 'useless' when the node is connected to the cluster. This is the 'first shot' to connect to your cluster after that evert node will be connected to each others. If you let this address unchanged your server will attempt to create/declare a new cluster at every restart.**

<span class="text_quote">W </span>**AFTER YOU SETUP HAS 2 MEMBERS CHANGE THIS URL WITH THE ADDRESS OF ONE OF THE MEMBER OF YOUR CLUSTER.**

## II.3. Server 01 configuration

Now make sure those directories are **empty**:

* `/etc/mysql/`
* `/etc/mysql/conf.d/`

And create this configuration file: `/etc/mysql/my.cnf` and fulfill it with the following content:

    [mysqld_multi]
    mysqld     = /usr/sbin/mysqld
    mysqladmin = /usr/bin/mysqladmin
    user       = mysql_super_user
    password   = mysql_super_user_secure_password
    log        = /mysql/mysqld_multi/mysqld_multi.log
    
    [mysqld1]
    bind-address = 0.0.0.0
    socket     = /mysql/customer01/socket/customer01.pid
    port       = 3307
    pid-file   = /mysql/customer01/customer01.pid
    datadir    = /mysql/customer01/data
    user       = customer01
    tmpdir     = /mysql/customer01/tmp
    log-bin    = /mysql/customer01/binlog/binlog
    log-bin-index = /mysql/customer01/binlog/binlog.index
    log-error         = /mysql/customer01/log/mysql.err
    general_log_file  = /mysql/customer01/log/mysql.log
    general_log       = 1
    wsrep_provider=/usr/lib/galera/libgalera_smm.so
    wsrep_cluster_name="my_wsrep_cluster"
    wsrep_cluster_address="gcomm://0.0.0.0:5674"
    wsrep_provider_options="gmcast.listen_addr=tcp://0.0.0.0:5674"
    wsrep_certify_nonPK=1
    wsrep_convert_LOCK_to_trx=0
    wsrep_auto_increment_control=1
    wsrep_drupal_282555_workaround=0
    wsrep_causal_reads=0
    wsrep_sst_method=rsync
    
    # Must have and Performance values
    binlog_format=ROW
    default-storage-engine=innodb
    sync_binlog=0
    innodb_flush_log_at_trx_commit=0
    innodb_doublewrite=0
    innodb_autoinc_lock_mode=2
    innodb_locks_unsafe_for_binlog=1
    query_cache_size=0
    query_cache_type=0
    
    [mysqld2]
    bind-address = 0.0.0.0
    socket     = /mysql/customer02/socket/customer02.pid
    port       = 3308
    pid-file   = /mysql/customer02/customer02.pid
    datadir    = /mysql/customer02/data
    user       = customer02
    tmpdir     = /mysql/customer02/tmp
    log-bin    = /mysql/customer02/binlog/binlog
    log-bin-index = /mysql/customer02/binlog/binlog.index
    log-error         = /mysql/customer02/log/mysql.err
    general_log_file  = /mysql/customer02/log/mysql.log
    general_log       = 1
    wsrep_provider=/usr/lib/galera/libgalera_smm.so
    wsrep_cluster_name="my_wsrep_cluster"
    wsrep_cluster_address="gcomm://0.0.0.0:5675"
    wsrep_provider_options="gmcast.listen_addr=tcp://0.0.0.0:5675"
    wsrep_certify_nonPK=1
    wsrep_convert_LOCK_to_trx=0
    wsrep_auto_increment_control=1
    wsrep_drupal_282555_workaround=0
    wsrep_causal_reads=0
    wsrep_sst_method=rsync
     
    # Must have and Performance values
    binlog_format=ROW
    default-storage-engine=innodb
    sync_binlog=0
    innodb_flush_log_at_trx_commit=0
    innodb_doublewrite=0
    innodb_autoinc_lock_mode=2
    innodb_locks_unsafe_for_binlog=1
    query_cache_size=0
    query_cache_type=0


<span class="text_quote">R </span> The IP address of this node is **10.0.0.1**.

Finally start your instances, without any argument the script will run every instance one by one:

```bash
$ sudo mysqld_multi start 
```

Don't worry, if everything is ok, you won't have any output, you can show the status of your instance with this command:

```bash
$ sudo mysqld_multi report
Reporting MySQL servers
MySQL server from group: mysqld1 is running
MySQL server from group: mysqld2 is running
```

You can also check the process:

```bash
$ sudo ps aux | grep mysqld
1001     23366  0.0  1.6 913536 67172 pts/1    Sl   21:51   0:00 /usr/sbin/mysqld --bind-address=0.0.0.0 --socket=/mysql/customer01/socket/customer01.pid --port=3307 --pid-file=/mysql/customer01/customer01.pid1 --datadir=/mysql/customer01/data --user=customer01 --tmpdir=/mysql/customer01/tmp --log-bin=/mysql/customer01/binlog/binlog --log-bin-index=/mysql/customer01/binlog/binlog.index --log-error=/mysql/customer01/log/mysql.err --general_log_file=/mysql/customer01/log/mysql.log --general_log=1 --wsrep_provider=/usr/lib/galera/libgalera_smm.so --wsrep_cluster_name=my_wsrep_cluster --wsrep_cluster_address=gcomm://10.0.0.2:5674 --wsrep_provider_options=gmcast.listen_addr=tcp://0.0.0.0:5674 --wsrep_slave_threads=1 --wsrep_certify_nonPK=1 --wsrep_max_ws_rows=131072 --wsrep_max_ws_size=1073741824 --wsrep_debug=0 --wsrep_convert_LOCK_to_trx=0 --wsrep_retry_autocommit=1 --wsrep_auto_increment_control=1 --wsrep_drupal_282555_workaround=0 --wsrep_causal_reads=0 --wsrep_notify_cmd= --wsrep_sst_method=rsync
1002     23472  0.1  1.6 913536 67176 pts/1    Sl   21:52   0:00 /usr/sbin/mysqld --bind-address=0.0.0.0 --socket=/mysql/customer02/socket/customer02.pid --port=3308 --pid-file=/mysql/customer02/customer02.pid --datadir=/mysql/customer02/data --user=customer02 --tmpdir=/mysql/customer02/tmp --log-bin=/mysql/customer02/binlog/binlog --log-bin-index=/mysql/customer02/binlog/binlog.index --log-error=/mysql/customer02/log/mysql.err --general_log_file=/mysql/customer02/log/mysql.log --general_log=1 --wsrep_provider=/usr/lib/galera/libgalera_smm.so --wsrep_cluster_name=my_wsrep_cluster --wsrep_cluster_address=gcomm://10.0.0.2:5675 --wsrep_provider_options=gmcast.listen_addr=tcp://0.0.0.0:5675 --wsrep_slave_threads=1 --wsrep_certify_nonPK=1 --wsrep_max_ws_rows=131072 --wsrep_max_ws_size=1073741824 --wsrep_debug=0 --wsrep_convert_LOCK_to_trx=0 --wsrep_retry_autocommit=1 --wsrep_auto_increment_control=1 --wsrep_drupal_282555_workaround=0 --wsrep_causal_reads=0 --wsrep_notify_cmd= --wsrep_sst_method=rsync
```

Grant the mysql_super_user user with some options in order to able the mysqld_multi script to manipulate each instances:

```bash
$ sudo echo "GRANT SHUTDOWN ON *.* TO 'mysql_super_user'@'localhost' IDENTIFIED BY 'mysql_super_user_secure_password'" | mysql --socket=/mysql/customer01/socket/customer01.pid
$ sudo echo "GRANT SHUTDOWN ON *.* TO 'mysql_super_user'@'localhost' IDENTIFIED BY 'mysql_super_user_secure_password'" | mysql --socket=/mysql/customer02/socket/customer02.pid
```

## II.4. Server 02

Here only the Galera configuration changes, so :

    [mysqld_multi]
    mysqld     = /usr/sbin/mysqld
    mysqladmin = /usr/bin/mysqladmin
    user       = mysql_super_user
    password   = mysql_super_user_secure_password
    log        = /mysql/mysqld_multi/mysqld_multi.log

    [mysqld1]
    bind-address = 0.0.0.0
    socket     = /mysql/customer01/socket/customer01.pid
    port       = 3307
    pid-file   = /mysql/customer01/customer01.pid
    datadir    = /mysql/customer01/data
    user       = customer01
    tmpdir     = /mysql/customer01/tmp
    log-bin    = /mysql/customer01/binlog/binlog
    log-bin-index = /mysql/customer01/binlog/binlog.index
    log-error         = /mysql/customer01/log/mysql.err
    general_log_file  = /mysql/customer01/log/mysql.log
    general_log       = 1
    wsrep_provider=/usr/lib/galera/libgalera_smm.so
    wsrep_cluster_name="my_wsrep_cluster"
    wsrep_cluster_address="gcomm://10.0.0.1:5674"
    wsrep_provider_options="gmcast.listen_addr=tcp://0.0.0.0:5674"
    wsrep_certify_nonPK=1
    wsrep_convert_LOCK_to_trx=0
    wsrep_auto_increment_control=1
    wsrep_drupal_282555_workaround=0
    wsrep_causal_reads=0
    wsrep_sst_method=rsync
     
    # Must have and Performance values
    binlog_format=ROW
    default-storage-engine=innodb
    sync_binlog=0
    innodb_flush_log_at_trx_commit=0
    innodb_doublewrite=0
    innodb_autoinc_lock_mode=2
    innodb_locks_unsafe_for_binlog=1
    query_cache_size=0
    query_cache_type=0
    
    [mysqld2]
    bind-address = 0.0.0.0
    socket     = /mysql/customer02/socket/customer02.pid
    port       = 3308
    pid-file   = /mysql/customer02/customer02.pid
    datadir    = /mysql/customer02/data
    user       = customer02
    tmpdir     = /mysql/customer02/tmp
    log-bin    = /mysql/customer02/binlog/binlog
    log-bin-index = /mysql/customer02/binlog/binlog.index
    log-error         = /mysql/customer02/log/mysql.err
    general_log_file  = /mysql/customer02/log/mysql.log
    general_log       = 1
    wsrep_provider=/usr/lib/galera/libgalera_smm.so
    wsrep_cluster_name="my_wsrep_cluster"
    wsrep_cluster_address="gcomm://10.0.0.1:5675"
    wsrep_provider_options="gmcast.listen_addr=tcp://0.0.0.0:5675"
    wsrep_certify_nonPK=1
    wsrep_convert_LOCK_to_trx=0
    wsrep_auto_increment_control=1
    wsrep_drupal_282555_workaround=0
    wsrep_causal_reads=0
    wsrep_sst_method=rsync
    
    # Must have and Performance values
    binlog_format=ROW
    default-storage-engine=innodb
    sync_binlog=0
    innodb_flush_log_at_trx_commit=0
    innodb_doublewrite=0
    innodb_autoinc_lock_mode=2
    innodb_locks_unsafe_for_binlog=1
    query_cache_size=0
    query_cache_type=0

<span class="text_quote">R </span> The IP address of this node is **10.0.0.2**.

## II.5. Final! 

Stop every instance on the server 1:

```bash
$ sudo mysqld_multi stop
```

Finally change Galera's options with the IP of the server 2 in order to enable the cross replication:

* for the instance 1: `wsrep_cluster_address="gcomm://10.0.0.2:5674"`
* for the instance 2: `wsrep_cluster_address="gcomm://10.0.0.2:5675"`

Finally start MySQL again on the server 1:

```bash
$ sudo mysqld_multi start
```

## II.6. Garbd

Last but not least, configure your arbitrator like so:

```bash
$ garbd -a gcomm://10.0.0.1:5674 -g my_wsrep_cluster -l /tmp/1.out -d
$ garbd -a gcomm://10.0.0.1:5675 -g my_wsrep_cluster -l /tmp/1.out -d
```

<span class="text_quote">R </span> Remenber that garbd is **always** running on a different and reliable machine outside your cluster.

Et voilà!

<br />

# III. Bonus script

As always I wrote a little script to check your Galera accross all your socket. Put this script in `/usr/bin/`, pass a parameter to the script while execute it:

```bash
#!/bin/bash

echo "Enter your MySQL user"                                                                                                                                                                                              
read MYSQL_USER                                                                                                                                                                                                           

echo "Enter your MySQL password"                                                                                                                                                                                          
stty -echo
read MYSQL_PASSWD                                                                                                                                                                                                         
stty echo

ID=$1

STATUS=$(mysql -uroot -proot -N -s -S /mysql/customer$ID/socket/customer$ID.pid -e "show status like 'wsrep_ready';" | awk '{print $2}')
SIZE=$(mysql -uroot -proot -N -s -S /mysql/customer$ID/socket/customer$ID.pid -e "show status like 'wsrep_cluster_size' ;" | awk '{print $2}')

if [[ ${STATUS} = "ON" ]] ; then
        if [[ ${SIZE} -lt "2" ]] ; then
                echo "Split-brain!"
        else
                echo "Galera is perfectly working"
        fi
else
        echo "ERROR: Galera is NOT working"
fi
```

Ideally this script should be merged with the mysqlq_multi perl script.

<br />

> You should already have noticied that the process of adding a new instances is fearly easy to script. Happy multi mysql with Galera!

