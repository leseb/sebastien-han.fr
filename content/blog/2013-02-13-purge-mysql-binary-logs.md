---
title: Purge some MySQL binary logs
date: 2013-02-15 11:20:00
slug: purge-mysql-binary-logs
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

The default value of the variable `expire_logs_days` is 10 days, most of the time this is way too long. This mini how-to shows how to change this value. Fortunately `expire_logs_days` is a [dynamic variable](http://dev.mysql.com/doc/refman/5.5/en/dynamic-system-variables.html) so we can edit it while MySQl runs, we don't need to restart the server.

<!--more-->

First check your slave status:

```sql
mysql> show slave status\G;
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 10.20.1.51
                  Master_User: replication
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000029
          Read_Master_Log_Pos: 52089474
               Relay_Log_File: mysqld-relay-bin.000036
                Relay_Log_Pos: 52089620
        Relay_Master_Log_File: mysql-bin.000029
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 52089474
              Relay_Log_Space: 52089820
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 1
```

As we can see the current `Master_Log_File` is `mysql-bin.000029`, so we have to purge all binaries prior to this one. Then check the master binary logs status

```sql
mysql> SHOW BINARY LOGS;
+------------------+-----------+
| Log_name         | File_size |
+------------------+-----------+
| mysql-bin.000022 | 104858289 |
| mysql-bin.000023 | 104857671 |
| mysql-bin.000024 | 104857898 |
| mysql-bin.000025 | 104857690 |
| mysql-bin.000026 | 104860121 |
| mysql-bin.000027 | 104858120 |
| mysql-bin.000028 | 104858421 |
| mysql-bin.000029 |  52091311 |
+------------------+-----------+
```

In my case, I want a retention of 5 days so I can start by deleting from `mysql-bin.000024` to `mysql-bin.000022`.

```sql
mysql> PURGE BINARY LOGS TO 'mysql-bin.000025';
Query OK, 0 rows affected (0.45 sec)

mysql> SHOW BINARY LOGS;
+------------------+-----------+
| Log_name         | File_size |
+------------------+-----------+
| mysql-bin.000025 | 104857690 |
| mysql-bin.000026 | 104860121 |
| mysql-bin.000027 | 104858120 |
| mysql-bin.000028 | 104858421 |
| mysql-bin.000029 |  52313463 |
+------------------+-----------+
5 rows in set (0.00 sec)
```

Eventually set the new value for `expire_logs_days` and don't forget to edit your `my.cnf`:

```sql
mysql> SET GLOBAL expire_logs_days=5;
Query OK, 0 rows affected (0.00 sec)


mysql> SHOW VARIABLES LIKE 'expire_logs_days';
+------------------+-------+
| Variable_name    | Value |
+------------------+-------+
| expire_logs_days | 5     |
+------------------+-------+
1 row in set (0.00 sec)
```

* [http://dev.mysql.com/doc/refman/5.5/en/dynamic-system-variables.html](http://dev.mysql.com/doc/refman/5.5/en/dynamic-system-variables.html)
