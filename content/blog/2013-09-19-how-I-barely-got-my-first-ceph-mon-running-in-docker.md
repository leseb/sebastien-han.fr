---
title: How I barely got my first Ceph monitor running in Docker
date: 2013-09-19 22:37:00
slug: how-I-barely-got-my-first-ceph-mon-running-in-docker
draft: false
categories: ["containers"]
tags: ["containers"]
---

![Your first ceph-mon with Docker](/images/docker-ceph-mon.jpg)

Docker is definitely the new trend. Thus I quickly wanted to try to put a Ceph monitor inside a Docker container. Story of a tough journey...

<!--more-->

<br />

First let's start with the DockerFile, this makes the setup easy and repeatable by anybody:

    FROM    ubuntu:latest
    MAINTAINER Sebastien Han <han.sebastien@gmail.com>
    
    # Hack for initctl not being available in Ubuntu
    RUN dpkg-divert --local --rename --add /sbin/initctl
    RUN ln -s /bin/true /sbin/initctl
    
    # Repo and packages
    RUN echo deb http://archive.ubuntu.com/ubuntu precise main | tee /etc/apt/sources.list
    RUN echo deb http://archive.ubuntu.com/ubuntu precise-updates main | tee -a /etc/apt/sources.list
    RUN echo deb http://archive.ubuntu.com/ubuntu precise universe | tee -a /etc/apt/sources.list
    RUN echo deb http://archive.ubuntu.com/ubuntu precise-updates universe | tee -a /etc/apt/sources.list
    RUN apt-get update
    RUN apt-get install -y --force-yes wget lsb-release sudo
    
    # Fake a fuse install otherwise ceph won't get installed
    RUN apt-get install libfuse2
    RUN cd /tmp ; apt-get download fuse
    RUN cd /tmp ; dpkg-deb -x fuse_* .
    RUN cd /tmp ; dpkg-deb -e fuse_*
    RUN cd /tmp ; rm fuse_*.deb
    RUN cd /tmp ; echo -en '#!/bin/bash\nexit 0\n' > DEBIAN/postinst
    RUN cd /tmp ; dpkg-deb -b . /fuse.deb
    RUN cd /tmp ; dpkg -i /fuse.deb
    
    # Install Ceph
    CMD wget -q -O- 'https://ceph.com/git/?p=ceph.git;a=blob_plain;f=keys/release.asc' | apt-key add -
    RUN echo deb http://ceph.com/debian-dumpling/ $(lsb_release -sc) main | tee /etc/apt/sources.list.d/ceph-dumpling.list
    RUN apt-get update
    RUN apt-get install -y --force-yes ceph ceph-deploy
    
    # Avoid host resolution error from ceph-deploy
    RUN echo ::1    ceph-mon | tee /etc/hosts
    
    # Deploy the monitor
    RUN ceph-deploy new ceph-mon
    
    EXPOSE 6789

Then build the image:

```bash
$ sudo docker build -t leseb/ceph-mon .
...
...
...
 ---> 113b00f4dc3a
Step 23 : RUN echo ::1    ceph-mon | tee /etc/hosts
 ---> Running in 1f67db0c963a
::1 ceph-mon
 ---> 556d638a365b
Step 24 : RUN ceph-deploy new ceph-mon
 ---> Running in 547e61297891
/usr/lib/python2.7/dist-packages/pushy/transport/ssh.py:323: UserWarning: No paramiko or native ssh transport
  warnings.warn("No paramiko or native ssh transport")
[ceph_deploy.new][DEBUG ] Creating new cluster named ceph
[ceph_deploy.new][DEBUG ] Resolving host ceph-mon
[ceph_deploy.new][DEBUG ] Monitor ceph-mon at ::1
[ceph_deploy.new][DEBUG ] Monitor initial members are ['ceph-mon']
[ceph_deploy.new][DEBUG ] Monitor addrs are ['::1']
[ceph_deploy.new][DEBUG ] Creating a random mon key...
[ceph_deploy.new][DEBUG ] Writing initial config to ceph.conf...
[ceph_deploy.new][DEBUG ] Writing monitor keyring to ceph.mon.keyring...
 ---> 2b087f2f3ead
Step 25 : EXPOSE 6789
 ---> Running in 0c174fbe7a5b
 ---> 460e2d2c900a
Successfully built 460e2d2c900a
```

Now we almost have th full image, we just need to instruct Docker to install the monitor.
For this, we simply run the image that we just created and we pass the command that creates the monitor:

```bash
$ docker run -d -h="ceph-mon" leseb/ceph-mon ceph-deploy --overwrite-conf mon create ceph-mon
e2f48f3cca26
```

Check if it works properly:

```bash
$ docker logs e2f48f3cca26
/usr/lib/python2.7/dist-packages/pushy/transport/ssh.py:323: UserWarning: No paramiko or native ssh transport
  warnings.warn("No paramiko or native ssh transport")
[ceph_deploy.mon][DEBUG ] Deploying mon, cluster ceph hosts ceph-mon
[ceph_deploy.mon][DEBUG ] detecting platform for host ceph-mon ...
[ceph_deploy.mon][INFO  ] distro info: Ubuntu 12.04 precise
[ceph-mon][DEBUG ] deploying mon to ceph-mon
[ceph-mon][DEBUG ] remote hostname: ceph-mon
[ceph-mon][INFO  ] write cluster configuration to /etc/ceph/{cluster}.conf
[ceph-mon][INFO  ] creating path: /var/lib/ceph/mon/ceph-ceph-mon
[ceph-mon][DEBUG ] checking for done path: /var/lib/ceph/mon/ceph-ceph-mon/done
[ceph-mon][DEBUG ] done path does not exist: /var/lib/ceph/mon/ceph-ceph-mon/done
[ceph-mon][INFO  ] creating keyring file: /var/lib/ceph/tmp/ceph-ceph-mon.mon.keyring
[ceph-mon][INFO  ] create the monitor keyring file
[ceph-mon][INFO  ] Running command: ceph-mon --cluster ceph --mkfs -i ceph-mon --keyring /var/lib/ceph/tmp/ceph-ceph-mon.mon.keyring
[ceph-mon][INFO  ] ceph-mon: mon.noname-a [::1]:6789/0 is local, renaming to mon.ceph-mon
[ceph-mon][INFO  ] ceph-mon: set fsid to b8344267-3857-4ead-bb38-2fb54566341e
[ceph-mon][INFO  ] ceph-mon: created monfs at /var/lib/ceph/mon/ceph-ceph-mon for mon.ceph-mon
[ceph-mon][INFO  ] unlinking keyring file /var/lib/ceph/tmp/ceph-ceph-mon.mon.keyring
[ceph-mon][INFO  ] create a done file to avoid re-doing the mon deployment
[ceph-mon][INFO  ] create the init path if it does not exist
[ceph-mon][INFO  ] Running command: initctl emit ceph-mon cluster=ceph id=ceph-mon
```

Then commit the last version of your image to save the latest change:

```bash
$ docker commit e2f48f3cca26 leseb/ceph-mon
86f44bce988e
```

Finally run the monitor in a new container:

```bash
$ docker run -d -p 6789 -h="ceph-mon" leseb/ceph ceph-mon --conf /ceph.conf --cluster=ceph -i ceph-mon -f
12974394437d
root@hp-docker:~# docker ps
ID                  IMAGE               COMMAND                CREATED             STATUS              PORTS
12974394437d        leseb/ceph:latest   ceph-mon --conf /cep   2 seconds ago       Up 1 seconds        49175->6789
```

Now the tough part, because of the use of `ceph-deploy` the monitor listens to the IPv6 local address.
Which in normal circonstances is not a problem since we can access from either its local IP (lo) or its private address (eth0 or something else).
However with Docker, things are a little bit different, the monitor is only accessible from its namespace, so even if you expose a port this won't work.
Basically exposing a port creates an Iptables DNAT rule, that says: everything that goes from anywhere to the host IP address on a specific port is redirected to the IP address within the container namespace.
In the end, if you try to access the monintor using the IP address of the host plus the exposed port you will get something like this:

    .connect claims to be [::1]:6804/1031425 not [::1]:6804/31537 - wrong node!

Although there is a way to access the monitor! We need to access it from host directly through the namespace.

First grab your container's ID:

```bash
$ docker ps
ID                  IMAGE               COMMAND                CREATED             STATUS              PORTS
9cfa541f6be9        leseb/ceph:latest   ceph-mon --conf /cep   25 hours ago        Up 25 hours         49156->6789
```

Use this script, **stolen and adapt** from Jérôme Petazzoni [here](https://github.com/jpetazzo/pipework/blob/master/pipework#L54).
This script creates the entry point on the host to access the namespace of the container.

```bash
#!/bin/bash
set -e

GUESTNAME=$1

# Second step: find the guest (for now, we only support LXC containers)
CGROUPMNT=$(grep ^cgroup.*devices /proc/mounts | cut -d" " -f2 | head -n 1)
[ "$CGROUPMNT" ] || {
    echo "Could not locate cgroup mount point."
    exit 1
}

N=$(find "$CGROUPMNT" -name "$GUESTNAME*" | wc -l)
case "$N" in
    0)
        echo "Could not find any container matching $GUESTNAME."
        exit 1
        ;;
    1)
        true
        ;;
    *)
        echo "Found more than one container matching $GUESTNAME."
        exit 1
        ;;
esac

NSPID=$(head -n 1 $(find "$CGROUPMNT" -name "$GUESTNAME*" | head -n 1)/tasks)
[ "$NSPID" ] || {
    echo "Could not find a process inside container $GUESTNAME."
    exit 1
}
mkdir -p /var/run/netns
rm -f /var/run/netns/$NSPID
ln -s /proc/$NSPID/ns/net /var/run/netns/$NSPID

echo ""
echo "Namespace is ${NSPID}"
echo ""

ip netns exec $NSPID ip a s eth0
```

Execute it:

```bash
$ ./pipework.sh 9cfa541f6be9

Namespace is 10660

607: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether b6:96:a3:c3:c7:1f brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.8/16 brd 172.17.255.255 scope global eth0
    inet6 fe80::b496:a3ff:fec3:c71f/64 scope link
       valid_lft forever preferred_lft forever
```

Now, get the monitor's key:

```bash
$ cp /var/lib/docker/containers/9cfa541f6be97821131355b4005bc24b509baf3028759f0f871bf43840399f96/rootfs/ceph.mon.keyring ceph.mon.docker.keyring
[mon.]
key = AQANAipSAAAAABAApGcUJIxy+DO56vP4UpIV5g==
caps mon = allow *
```

Ouahh YEAH!

```bash
$ sudo ip netns exec 10660 ceph -k ceph.mon.docker.keyring -n mon. -m 172.17.0.8 -s
  cluster c957629f-525d-4b60-a6b7-e1ccd9494063
   health HEALTH_ERR 192 pgs stuck inactive; 192 pgs stuck unclean; no osds
   monmap e1: 1 mons at {ceph-mon=172.17.0.8:6789/0}, election epoch 2, quorum 0 ceph-mon
   osdmap e1: 0 osds: 0 up, 0 in
    pgmap v2: 192 pgs: 192 creating; 0 bytes data, 0 KB used, 0 KB / 0 KB avail
   mdsmap e1: 0/0/1 up
```

<br />

# III. Issues and caveats

I'm not really convinced by this first shot. The biggest issue here is that the monitor needs to be known.

Wow that was a hell of a job to get this working.
At the end, the effort is quite useless since nothing can reach the monitor except the host itself.
Thus, other Ceph components will only work if they share the same network namespace as the monitor.
Sharing all the containers namespace into one could quite difficult as well.
But what's the point to have a Ceph cluster stuck within some namespaces, without any clients accessing it?

<br />

> I have to admit that this was pretty fun to hack. Although, in practice, that's not usable at all. Thus you can consider this as an experiment and a way to get into Docker ;-).
