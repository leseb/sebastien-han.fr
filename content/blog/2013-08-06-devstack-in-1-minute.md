---
title: DevStack in 1 minute
date: 2013-08-08 23:00:00
slug: devstack-in-1-minute
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![DevStack in 1 minute](/images/devstack.jpg)

DevStack in 1 minute! Ready, steady, GO!

<!--more-->

Install it:

```bash
root@devstack:~# git clone https://github.com/openstack-dev/devstack.git
root@devstack:~# cd devstack && ./stack.sh
...
...
WAIT WITH COFFEE
...
...
root@devstack:~# su - stack
stack@devstack:~$ cd devstack/
```

Almost ready to start, by default DevStack installs 2 mains users:

* admin
* demo

This is how you use the credentials of the user demo:

```bash
stack@devstack:~/devstack$ source openrc
```

This is how you use the credentials of the user admin:

```bash
stack@devstack:~/devstack$ source openrc admin admin
```

To go back to the user demo simply do:

```bash
stack@devstack:~/devstack$ source openrc demo demo
```

Here you go!

Now you can start to use devstack:

```bash
stack@devstack:~/devstack$ nova list
+----+------+--------+------------+-------------+----------+
| ID | Name | Status | Task State | Power State | Networks |
+----+------+--------+------------+-------------+----------+
+----+------+--------+------------+-------------+----------+
```

If you want to interact with the services, just remember that DevStack doesn't use any script init (upstart or service don't exist).
It simply runs the services in a standalone mode (foreground running daemon).
To bring up all the services DevStack uses a big parent screen where it encapsulates child screens.
This how to access them:

```bash
stack@devstack:~/devstack$ ./rejoin-stack.sh
```

The good old `screen -x <screen-name>` works just fine too.

How to navigate through the child screens? Tip `ctrl + a + "` inside the parent one, you'll get the general overview:

    Num Name                                                                                                                                                                                              Flags

      0 shell                                                                                                                                                                                                 $
      1 key                                                                                                                                                                                                   $
      2 horizon                                                                                                                                                                                               $
      3 g-reg                                                                                                                                                                                                 $
      4 g-api                                                                                                                                                                                                 $
      5 n-api                                                                                                                                                                                                 $
      6 n-cond                                                                                                                                                                                                $
      7 n-cpu                                                                                                                                                                                                 $
      8 n-crt                                                                                                                                                                                                 $
      9 n-net                                                                                                                                                                                                 $
     10 n-sch                                                                                                                                                                                                 $
     11 n-novnc                                                                                                                                                                                               $
     12 n-xvnc                                                                                                                                                                                                $
     13 n-cauth                                                                                                                                                                                               $
     14 n-obj                                                                                                                                                                                                 $
     15 c-api                                                                                                                                                                                                 $
     16 c-sch                                                                                                                                                                                                 $
     17 c-vol
    
     0$ shell  1$ key  2$ horizon  3$ g-reg  4$ g-api  5$ n-api  6$ n-cond  7$ n-cpu  8$ n-crt  9$ n-net  10$ n-sch  11$ n-novnc  12$ n-xvnc  13$ n-cauth  14$ n-obj  15$ c-api  16-$ c-sch   17$ c-vol*  (devs

Select one and press enter to get into one child screen. If you want to change the behavior of a daemon, let's say nova-api, just modify your `nova.conf` then kill the process in the child `n-api` with `ctrl + c`, re-run it (last command) and you're good.

Other commands like `ctrl + a + p` (previous) child or `n` (next child work great too!)

Finally this how to detach the screen `ctrl + a + d`.

## Bonus

As requested, here's a simple `localrc` file with the support of Neutron (new code name for Quantum) and all the main projects:

    # Misc
    DATABASE_PASSWORD=password
    ADMIN_PASSWORD=password
    SERVICE_PASSWORD=password
    SERVICE_TOKEN=password
    RABBIT_PASSWORD=password

    # Enable Logging

    LOGFILE=/opt/stack/logs/stack.sh.log
    VERBOSE=True
    LOG_COLOR=True
    SCREEN_LOGDIR=/opt/stack/logs

    # Pre-requisite
    ENABLED_SERVICES=rabbit,mysql,key
    
    # Horizon (always use the trunk)
    ENABLED_SERVICES+=,horizon
    HORIZON_REPO=https://github.com/openstack/horizon
    HORIZON_BRANCH=master
    
    # Nova
    ENABLED_SERVICES+=,n-api,n-crt,n-obj,n-cpu,n-cond,n-sch
    IMAGE_URLS+=",https://launchpad.net/cirros/trunk/0.3.0/+download/cirros-0.3.0-x86_64-disk.img"

    # Glance
    ENABLED_SERVICES+=,g-api,g-reg

    # Neutron
    ENABLED_SERVICES+=,q-svc,q-agt,q-dhcp,q-l3,q-meta,neutron

    # Cinder
    ENABLED_SERVICES+=,cinder,c-api,c-vol,c-sch

<br />

> Hope it helps!
