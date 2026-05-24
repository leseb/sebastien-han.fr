---
title: Cleanup keystone tokens
date: 2012-12-12 19:56:00
slug: cleanup-keystone-tokens
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Cleanup keystone tokens](/images/cleanup-keystone-tokens.jpg)

Every once in a while you really want to cleanup the token table of the Keystone database. A couple of weeks ago while backuping my cloud controller I noticed that the backup of the Keystone database was longer than the other databases. After that, I checked the size of the dump (compressed) 60MB. Hummm but there is almost nothing in the Keystone database: users, tenants... wait.. could it be TOKENS?!

<!--more-->

The token validity is manage via the following options in `keystone.conf`:

    [token]
    driver = keystone.token.backends.sql.Token
    
    # Amount of time a token should remain valid (in seconds)
    expiration = 86400

One option could be to use different backend to store the tokens:

* The keystone.token.backends.memcache, Memcached storage backend
* The keystone.token.backends.kvs, Key Value storage backend

I will prefer another backend to store the tokens in order to make database dump shorter and smaller. I'm not quite sure if memcache is a good candidat though. This could make things harder for some reasons like:

* Does the token remain forever in memcache?
* Cache consistency, if a server crash
* Makes the setup more complex, try to achieve a replicated memcache

See this [launchpad discussion](https://bugs.launchpad.net/keystone/+bug/843127) for more details.

Every nova/glance/cinder commands ask for a token while trying to execute a command.

I personnally end up with the following:

```sql
$ sudo mysql -uroot -p -e 'USE keystone; SELECT * FROM token;' | wc -l
Enter password: 
1970938
```

The setup runs for 2 months now and already **1970938** and I **don't** run a public cloud. I can't imagine the nightmare with a public cloud...

Little bash script:

```bash
#!/bin/bash

mysql_user=
mysql_password=
mysql_host=

mysql -u${mysql_user} -p${mysql_password} -h${mysql_host} -e 'USE keystone ; DELETE FROM token WHERE NOT DATE_SUB(CURDATE(),INTERVAL 2 DAY) <= expires;'
```

If during the process you endup with this error:

    ERROR 1205 (HY000) at line 1: Lock wait timeout exceeded; try restarting transaction

Simply increase the `innodb_lock_wait_timeout`:

```sql
mysql> show variables like 'innodb_lock_wait_timeout';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| innodb_lock_wait_timeout | 50    |
+--------------------------+-------+
1 row in set (0.00 sec)

mysql> set innodb_lock_wait_timeout=100;
Query OK, 0 rows affected (0.00 sec)

mysql> show variables like 'innodb_lock_wait_timeout';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| innodb_lock_wait_timeout | 100   |
+--------------------------+-------+
```

Then re-run your command again.


Note: I volontary let a retention of 2 days in the command since I work with days and not with hours. It's not always day per day, thus some token could overlap and be valid. So 2 days are fine.

<br />

# II. Bonus

## II.1. Retrieve a token with curl

If you want to retrieve a token via `curl`:

```bash
$ curl -s -d "{\"auth\":{\"passwordCredentials\": {\"username\": \"admin\", \"password\": \"admin\"}, \"tenantName\": \"admin\"}}" -H "Content-type: application/json" http://127.0.0.1:5000/v2.0/tokens | tr ',' 'n' | grep '"id":' | cut -d'"' -f12 | head --lines 1
ff2d33b0de69431d9203a5fa43efa903
```

## II.2. Cron task for the cleanup script

Script to execute periodically:

```bash
#!/bin/bash

# Purpose of the script
# Everytime a service wants to be do 'something' it has to retrieve an autentication token
# Nova/Glance/Cinder services are manage by Pacemaker and monitor functions (from the RA) ask for a token every 10 sec
# There is no cleanup procedure nor periodical task running to delete expire token

mysql_user=keystone
mysql_password=********
mysql_host=
mysql=$(which mysql)

logger -t keystone-cleaner "Starting Keystone 'token' table cleanup"

logger -t keystone-cleaner "Starting token cleanup"
mysql -u${mysql_user} -p${mysql_password} -h${mysql_host} -e 'USE keystone ; DELETE FROM token WHERE NOT DATE_SUB(CURDATE(),INTERVAL 2 DAY) <= expires;'
valid_token=$($mysql -u${mysql_user} -p${mysql_password} -h${mysql_host} -e 'USE keystone ; SELECT * FROM token;' | wc -l)
logger -t keystone-cleaner "Finishing token cleanup, there is still $valid_token valid tokens..."

exit 0
```

## II.3. Use memcached to store Keystone tokens

Install memcached:

```bash
$ sudo apt-get install memcached -y
```

Put the following option in your `keystone.conf`:

    [token]
    driver = keystone.token.backends.memcache.Token

Then restart the service Keystone:

```bash
$ sudo service keystone restart
```

Check if the connection is well established:

```bash
$ sudo lsof -i :11211
COMMAND     PID     USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
memcached  2900 memcache   26u  IPv4 20295625      0t0  TCP localhost:11211 (LISTEN)
memcached  2900 memcache   27u  IPv4 20295626      0t0  UDP localhost:11211 
memcached  2900 memcache   29u  IPv4 20307867      0t0  TCP localhost:11211->localhost:37623 (ESTABLISHED)
memcached  2900 memcache   30u  IPv4 20307869      0t0  TCP localhost:11211->localhost:37626 (ESTABLISHED)
memcached  2900 memcache   31u  IPv4 20307925      0t0  TCP localhost:11211->localhost:37634 (ESTABLISHED)
keystone- 10599 keystone   10u  IPv4 20308147      0t0  TCP localhost:37623->localhost:11211 (ESTABLISHED)
keystone- 10599 keystone   13u  IPv4 20308153      0t0  TCP localhost:37626->localhost:11211 (ESTABLISHED)
keystone- 10599 keystone   15u  IPv4 20308221      0t0  TCP localhost:37634->localhost:11211 (ESTABLISHED)
```

Retrieve cache object count:

```bash
$ sudo telnet 127.0.0.1 11211
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
stats items
STAT items:9:number 4
STAT items:9:age 314
STAT items:9:evicted 0
STAT items:9:evicted_nonzero 0
STAT items:9:evicted_time 0
STAT items:9:outofmemory 0
STAT items:9:tailrepairs 0
STAT items:9:reclaimed 0
STAT items:9:expired_unfetched 0
STAT items:9:evicted_unfetched 0
STAT items:10:number 1310
STAT items:10:age 511
STAT items:10:evicted 0
STAT items:10:evicted_nonzero 0
STAT items:10:evicted_time 0
STAT items:10:outofmemory 0
STAT items:10:tailrepairs 0
STAT items:10:reclaimed 0
STAT items:10:expired_unfetched 0
STAT items:10:evicted_unfetched 0
END
quit
Connection closed by foreign host.
```

You should see the `STAT items:10:number` growing and growing.
<br />

> Simply run the script aaaaaannnd it's gone!
