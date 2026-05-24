---
title: Access a Docker container without ssh
date: 2014-01-27 00:01:00
slug: access-a-container-without-ssh
draft: false
categories: ["containers"]
tags: ["containers"]
---

![Access a Docker container without ssh](/images/docker-nsenter.jpg)

Quick tip to access a container without SSH.

<!--more-->

<br />

Let's run a simple memcached server:

```bash
$ sudo docker run -d -p 11211 bacongobbler/memcached memcached /usr/bin/memcached -m 64 -p 11211 -u memcache -l 0.0.0.0
```

```bash
$ sudo docker ps
CONTAINER ID        IMAGE                                      COMMAND                CREATED             STATUS              PORTS                      NAMES
0a9856723f90        192.168.0.127:5042/memcached:latest        memcached /usr/bin/m   2 seconds ago       Up 2 seconds        0.0.0.0:49153->11211/tcp   pensive_pasteur
```

This is important you **must** grab the PID of the first running process inside the container, the one with PID 1.
So on the host run:

```bash
root@docker:~# ps faux |grep memcached
syslog   29123  0.0  0.0 323216  1184 ?        Sl   22:40   0:00          \_ memcached /usr/bin/memcached -m 64 -p 11211 -u memcache -l 0.0.0.0
```

The `nsenter` command is part of the `util-linux` package, however it only appeared during the 2.23 release.
Unfortunately, if you are running Ubuntu, the latest version available is 2.20, so you have to install the last version manually.

```bash
$ wget https://www.kernel.org/pub/linux/utils/util-linux/v2.24/util-linux-2.24.tar.bz2
$ bzip2 -d -c util-linux-2.24.tar.bz2 | tar xvf -
$ cd util-linux-2.24/
$ sudo ./configure --without-ncurses
$ make nsenter
$ cp nsenter /usr/local/bin
```

Now let's enter the container:

```
$ sudo nsenter -m -u -i -n -p -t 29123 /bin/sh
$ sudo ps faux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root        11  0.0  0.0   4396   608 ?        S    22:41   0:00 /bin/sh
root        12  0.0  0.0  15272  1100 ?        R+   22:41   0:00  \_ ps faux
memcache     1  0.0  0.0 323216  1184 ?        Sl   22:40   0:00 memcached /usr/bin/memcached -m 64 -p 11211 -u memcache -l 0.0.0.0
```

Handy script:

```bash
#!/bin/bash
PID=$(sudo docker inspect --format \{{.State.Pid}}\ $1)
sudo nsenter --target $PID --mount --uts --ipc --net --pid
```

Use it like this: `./enter-container <container id>`.

> Tada!
