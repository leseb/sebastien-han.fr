---
title: First glimpse at CoreOS
date: 2013-09-03 00:10:00
slug: first-glimpse-at-coreos
draft: false
categories: ["containers"]
tags: ["containers"]
---

![First step with CoreOS](/images/coreos.png)

[CoreOS](http://coreos.com/) is an emergent project that aims to address one of the most pressing questions in the server's world.
We at eNovance, therefore released eDeploy: a tool that performs bare metal deployment and manages upgrades with ease.
Deploying and upgrading servers are currently two major concerns in the IT world since none (or at least very few people know how to do).
I couldn't resist trying CoreOS.

<!--more-->

<br />

# I. What is CoreOS?

## I.1. Genesis

The project is based on Google’s ChromeOS toolchain and uses similar mechanisms for managing upgrades.
By bringing a new way of thinking, CoreOS relies on several things:

1. Minimal OS: kernel + systemd
2. Docker compatible: Built for containers
3. Service discovery: Clustered by default with etcd a highly-available key value store for shared configuration

CoreOS provides a uniform basis for all applications since they sit inside containers powered by the excellent Docker.
This provides a general and perfect isolation between all the applications.
Then it becomes fairly easy to move applications from one CoreOS server to another.
Additionally CoreOS root filesystem is read-only mounted which is great since this ensures a perfect consistency from one server to another.

## I.2. Upgrades and security

Upgrading CoreOS is a bit different than the usual distros.
The update system is based on ChromeOS which does automatic upgrades.
CoreOS uses two root partitions: one is active (root A), the other is passive (root B).
Initially the system is booted into the root A partition.
During this sequence, CoreOS starts talking to the update service to find out if updates are available.
If so, they are downloaded and installed on root B.
While installing these updates on root B, the update process is being rate limited via cgroups.

If you to learn more updates, read the [blog post from CoreOS](http://coreos.com/blog/recoverable-system-upgrades/).

## I.3. Service discover ETCD

ETCD is a distributed configuration service
The ultimate goal is to share and configure Docker containers all at once and atomically across all the CoreOS servers.
Although nothing has been defined yet in this area.

ETCD is also responsible for service discovery.
Services running inside Docker containers register themselves in ETCD so they can be used by the cluster for later use.

More about ETCD on the [CoreOS blog](http://coreos.com/blog/distributed-configuration-with-etcd/).

<br />
<br />

# II. Deep dive into CoreOS

## II.1. The easy way: Vagrant

Quite recently, with the help of Vagrant's author, CoreOS team released a vagrant box. As always, this provides a simple way to try a new project.

```bash
$ git clone https://github.com/coreos/coreos-vagrant/
$ cd coreos-vagrant
$ vagrant up
$ vagrant ssh
Last login: Fri Aug  2 23:49:42 UTC 2013 from 10.0.2.2 on pts/0
   ______                ____  _____
  / ____/___  ________  / __ \/ ___/
 / /   / __ \/ ___/ _ \/ / / /\__ \
/ /___/ /_/ / /  /  __/ /_/ /___/ /
\____/\____/_/   \___/\____//____/
```

<br />

## II.2. The minimal OS

Note from the CoreOS website:

Linux kernel + systemd.
That's about it. CoreOS has just enough bits to run containers, but does not ship a package manager itself.
In fact, the root partition is completely read-only, to guarantee consistency and make updates reliable.

Ok so what do we have here? I briefly looked into id and found in this lightweight (240MB for root) **Gentoo 3.10.4+** VM. See [Alex Polvi's explanations](https://news.ycombinator.com/item?id=6129908) on that:

<br />

> We're based on the ChromeOS SDKs... which use emerge to build the binaries required to assemble the distro. You can think of emerge/gentoo as the toolchain used to build all the binaries. We also pull base system packages from upstream portage, then compile them all together in out image.

<br />

Additional details:

    NAME=CoreOS
    ID=coreos
    VERSION=32.0.0
    VERSION_ID=32.0.0
    BUILD_ID=32.0.0
    PRETTY_NAME="CoreOS 32.0.0 (Official Build) dev-channel amd64-generic test"
    ANSI_COLOR="1;32"
    HOME_URL="http://www.coreos.com/"

<br />

### II.2.1. Services running

See below all the running services (excluding Kernel daemons):

    USER       PID   STAT  COMMAND
    root         1   Ss    /sbin/init
    root       180   Ss    /usr/lib/systemd/systemd-journald
    root       201   Ss    /usr/lib/systemd/systemd-udevd
    root       256   Ss    /sbin/dhcpcd -q --nobackground
    201        259   Ss    /usr/bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation
    root       265   Ssl   /usr/sbin/update_engine -foreground -logtostderr -no_connection_manager
    root       266   Ss    /bin/bash /usr/sbin/update_engine_reboot_manager
    root       278   S      \_ dbus-monitor --system type=signal,interface='org.chromium.UpdateEngineInterface',member='StatusUpdate'
    root       279   S      \_ /bin/bash /usr/sbin/update_engine_reboot_manager
    root       270   Ss    /usr/lib/systemd/systemd-logind
    root       273   Ss+   /sbin/agetty --noclear tty1 38400 linux
    root       288   Ssl   /usr/bin/docker -d -D
    etcd       291   Ssl   /usr/bin/etcd -v -d /var/lib/etcd

Interesting businesses are:

* `etcd` processes running on port `7001` and `4001`
* `docker` running on port `4243`
* update_engine

<br />

### II.2.2. Partitioning


    Number  Start   End     Size    File system  Name             Flags
     1      32.8kB  134MB   134MB   fat16        EFI-SYSTEM       boot
     2      134MB   201MB   67.1MB               BOOT-B
     3      201MB   1275MB  1074MB  ext2         ROOT-A
     4      1275MB  2349MB  1074MB               ROOT-B
     5      2349MB  2349MB  512B                 ROOT-C
     6      2349MB  2483MB  134MB   ext4         OEM
     7      2483MB  2483MB  512B                 coreos-reserved
     8      2483MB  2483MB  512B                 coreos-reserved
     9      2483MB  5704MB  3221MB  ext4         STATE

<br />

### II.2.3. Mount points

As mentioned earlier, CoreOS's root partitions are mounted in READ ONLY. Yes yes, you **can't** write to the OS.

    /dev/sda3 on / type ext4 (ro,relatime)

Note: the fstab is empty since systemd mounts the partition during boot time. You can find every mount definitions in `/usr/lib/systemd/system`:

```bash
core@localhost ~ $ sudo ls -l /usr/lib/systemd/system/*.mount
-rw-r--r-- 1 root root 636 Aug  2 04:35 dev-hugepages.mount
-rw-r--r-- 1 root root 590 Aug  2 04:35 dev-mqueue.mount
-rw-r--r-- 1 root root 197 Aug  2 04:42 home.mount
-rw-r--r-- 1 root root 352 Aug  2 04:42 media-state.mount
-rw-r--r-- 1 root root 200 Aug  2 04:42 media.mount
-rw-r--r-- 1 root root 195 Aug  2 04:42 opt.mount
-rw-r--r-- 1 root root 603 Aug  2 04:35 proc-sys-fs-binfmt_misc.mount
-rw-r--r-- 1 root root 195 Aug  2 04:42 srv.mount
-rw-r--r-- 1 root root 681 Aug  2 04:35 sys-fs-fuse-connections.mount
-rw-r--r-- 1 root root 685 Aug  2 04:35 sys-kernel-config.mount
-rw-r--r-- 1 root root 628 Aug  2 04:35 sys-kernel-debug.mount
-rw-r--r-- 1 root root 591 Aug  2 04:35 tmp.mount
-rw-r--r-- 1 root root 291 Aug  2 04:42 usr-share-oem.mount
-rw-r--r-- 1 root root 541 Aug  2 04:35 var-lock.mount
-rw-r--r-- 1 root root 536 Aug  2 04:35 var-run.mount
-rw-r--r-- 1 root root 320 Aug  2 04:42 var.mount
```

Note that the following mounts are binded from `/media/state/overlays/`:

* `/home`
* `/opt`
* `/srv`
* `/var/lock`
* `/var/run`
* `/var`

<br />

### II.2.4. Possible interesting stuff

Vrak:

* /usr/sbin/write_gpt.sh
* /usr/lib/coreos/
* /usr/bin/coreos-c10n

<br />

## II.3. Docker ready

### II.3.1. What is Docker?

**Description stolen from the [Docker website](https://www.docker.io/learn_more/).**

Docker is an open-source engine that automates the deployment of any application as a lightweight, portable, self-sufficient container that will run virtually anywhere.

Docker containers can encapsulate any payload, and will run consistently on and between virtually any server. The same container that a developer builds and tests on a laptop will run at scale, in production*, on VMs, bare-metal servers, OpenStack clusters, public instances, or combinations of the above.

Common use cases for Docker include:

* Automating the packaging and deployment of applications
* Creation of lightweight, private PAAS environments
* Automated testing and continuous integration/deployment
* Deploying and scaling web apps, databases and backend services

Docker is built on top of LXC which offers namespaces capabilities such as PID, Network, IPS, mnt and UTS namespaces.
It also uses control groups to manage resource accounting and limiting.
All those things are provided by the Kernel itself.

Docker is growing really fast and it's even about to go into [OpenStack Havana as a new hypervisor](https://review.openstack.org/#/c/40759/).

<br />

### II.3.2. Play with Docker!

We are going to demonstrate the power of Docker with a simple memcached example.

By default, CoreOS doesn't ship any images with Docker, so we have to pull some:

```bash
core@localhost ~ $ docker pull ubuntu
Pulling repository base
Pulling image b750fe79269d2ec9a3c593ef05b4332b1d1a02a62b4accb2c21d589ff2f5f2dc (ubuntu-quantl) from base
Pulling b750fe79269d2ec9a3c593ef05b4332b1d1a02a62b4accb2c21d589ff2f5f2dc metadata
Pulling b750fe79269d2ec9a3c593ef05b4332b1d1a02a62b4accb2c21d589ff2f5f2dc fs layer
Downloading 10.24 kB/10.24 kB (100%)
Pulling 27cf784147099545 metadata
Pulling 27cf784147099545 fs layer
Downloading 94.86 MB/94.86 MB (100%)
```

Note that since Docker 0.6 you need root privileges to run the docker command. You revert your configuration with the `-H` flag, if you really want a normal to use the docker command.

By the way, if you get stuck with:

    [debug] server.go:457 Updating checksums
    [debug] server.go:463 Retrieving the tag list
    [debug] server.go:466 Get https://cdn-registry-1.docker.io/v1/repositories/library/base/tags: x509: certificate has expired or is not yet valid

This means that the time of your machine is before the SSL cert was issued or after it expired. Thus you need to manually set the date:

```bash
core@localhost ~ $ sudo date --set="Thu Aug  28 10:05:20 UTC 2013"
Wed Aug 28 10:05:20 UTC 2013
```

Start a container:

```bash
core@localhost ~ $ sudo docker run -i -t base /bin/bash
root@156ddbdd1dc2:/# apt-get update && apt-get install -y memcached
...
...
...
root@156ddbdd1dc2:/# ps auxf
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  18064  1944 ?        S    23:50   0:00 /bin/bash
memcache   197  0.0  0.1 327440  1244 ?        Sl   23:54   0:00 /usr/bin/memcached -m 64 -p 11211 -u memcache -l 127.0.0.1
root       209  0.0  0.1  15528  1108 ?        R+   23:58   0:00 ps auxf
root@156ddbdd1dc2:/# exit
exit
```


The container has been stopped but still in the local registry:

```
core@localhost ~ $ docker ps -a
ID                  IMAGE               COMMAND             CREATED             STATUS              PORTS
156ddbdd1dc2        base:latest         /bin/bash           12 minutes ago      Exit 0
5ec55e697129        base:latest         /bin/bash           12 minutes ago      Exit 0
core@localhost ~ $ docker commit 156ddbdd1dc2 leseb/memcached
abac19018985
```

As you can see now the image has been added to my local registry:

```bash
core@localhost ~ $ docker images
REPOSITORY          TAG                 ID                  CREATED              SIZE
base                latest              b750fe79269d        5 months ago         24.65 kB (virtual 180.1 MB)
base                ubuntu-12.10        b750fe79269d        5 months ago         24.65 kB (virtual 180.1 MB)
base                ubuntu-quantal      b750fe79269d        5 months ago         24.65 kB (virtual 180.1 MB)
base                ubuntu-quantl       b750fe79269d        5 months ago         24.65 kB (virtual 180.1 MB)
leseb/memcached     latest              abac19018985        About a minute ago   138.6 MB (virtual 318.7 MB)
```

Let's run it!

```bash
core@localhost ~ $ docker run -d -p 11211 leseb/memcached memcached /usr/bin/memcached -m 64 -p 11211 -u memcache -l 0.0.0.0
bfa0ba848450
core@localhost ~ $ docker ps
ID                  IMAGE                    COMMAND                CREATED             STATUS              PORTS
bfa0ba848450        leseb/memcached:latest   memcached /usr/bin/m   14 seconds ago      Up 13 seconds       49153->11211
```

Verify that the container properly runs and that it binds to the 49153 local port:

```bash
core@localhost ~ $ ps aux|grep [l]xc
root      1205  0.0  0.1  21088  1168 pts/1    S+   00:10   0:00 lxc-start -n bfa0ba8484505752635d43549853b51465c3e83765c8b1892f07c846304cb3d7 -f /var/lib/docker/containers/bfa0ba8484505752635d43549853b51465c3e83765c8b1892f07c846304cb3d7/config.lxc -- /sbin/init -g 172.17.42.1 -e HOME=/ -e PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin -e container=lxc -e HOSTNAME=bfa0ba848450 -- memcached /usr/bin/memcached -m 64 -p 11211 -u memcache -l 0.0.0.0

core@localhost ~ $ netstat -lantue|grep 49153
tcp        0      0 127.0.0.1:49153         0.0.0.0:*               LISTEN      0          13806
```

You might wonder (as I did) how to interact inside a running container.
Let's say the container runs and I want to allocate more memory to memcached.
Docker wasn't meant to perform live modifications, instead it prefers versioning all the containers.
Assuming the container is running in production, you might want to test what you're about to change in a safe environment, basically a new container.

<br />

## II.4. Service discovery: ETCD

**Description stolen from the [GitHub](https://github.com/coreos/etcd) project.**

A highly-available key value store for shared configuration and service discovery. etcd is inspired by zookeeper and doozer, with a focus on:

* Simple: curl'able user facing API (HTTP+JSON)
* Secure: optional SSL client cert authentication
* Fast: benchmarked 1000s of writes/s per instance
* Reliable: Properly distributed using Raft

Etcd is written in Go and uses the raft consensus algorithm to manage a highly-available replicated log.

ETCD recently went to v0.1.0, see the [official announcement](http://coreos.com/blog/etcd-v0.1.0-release/).

I'm not going to copy/paste the really nice instructions from the GitHub project documentation. So I highly suggest you to have a look at the [usage here](https://github.com/coreos/etcd#usage).
Also take a look at the [client tool](https://github.com/coreos/etcdctl).

<br />
<br />

> CoreOS is still Alpha but I found really surprising how far they alreay are with their OS. The community reactivity was excellent too. Let's hope that this'll continue like this!
