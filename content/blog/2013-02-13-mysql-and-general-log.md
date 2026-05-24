---
title: MySQL and general logs
date: 2013-02-21 11:45:00
slug: mysql-and-general-log
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

Update the `general_log` variable while MySQL runs.

<!--more-->

Somehow one of my MySQL server had the variable `general_log` set to 1, which is pretty anoying because the file keeps growing and growing. See the symptom below:

```bash
$ sudo lsof /var/log/mysql
COMMAND  PID  USER   FD   TYPE DEVICE    SIZE/OFF NODE NAME
mysqld  6849 mysql    3u   REG  252,7         160   12 /var/log/mysql/mysql-bin.index
mysqld  6849 mysql   11w   REG  252,7 19042985830   14 /var/log/mysql/mysql.log.1 (deleted)
mysqld  6849 mysql   40w   REG  252,7    52876402   17 /var/log/mysql/mysql-bin.000029
mysqld  6849 mysql   72u   REG  252,7    52876402   17 /var/log/mysql/mysql-bin.000029
```

Don't forget to edit your `my.cnf` and then change the value of the global variable:

```sql
mysql> SET GLOBAL general_log=0;
Query OK, 0 rows affected (13.17 sec)
```

This might take a couple of seconds to remove the file entirely, you can still `watch` your `lsof` command and see the size dicreasing.

<br />

> As always, I hope it helps :)
