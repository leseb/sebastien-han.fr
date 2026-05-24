---
title: Easily deploy containerized Ceph daemons with Vagrant
date: 2016-02-08 11:13:00
slug: easily-deploy-containerized-ceph-daemons-with-vagrant
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

![Easily deploy containerized Ceph daemons with Vagrant](/images/vagrant-ceph-containerized.jpg)

This weekend I just pushed a new [feature](https://github.com/ceph/ceph-ansible/pull/521) in [ceph-ansible](https://github.com/ceph/ceph-ansible), which adds the ability to deploy containerized Ceph daemons.

<!--more-->

It is quite easy to get going with this, simply do the following:

```bash
$ git clone https://github.com/ceph/ceph-ansible
$ cd ceph-ansible
$ cp site-docker.yml.sample site-docker.yml
$ cp vagrant_variables.yml.sample vagrant_variables.yml
$ sed -i "s/docker: false/docker: true/" vagrant_variables.yml
$ sed -i "s/mon_vms: 1/mon_vms: 3/" vagrant_variables.yml
$ vagrant up

...
...

$ vagrant ssh mon0 -c "sudo docker exec ceph-mon0 ceph -s"
    cluster 5b1f9b36-c589-42ef-8d19-cb37f3a71e43
     health HEALTH_ERR
            64 pgs stuck inactive
            64 pgs stuck unclean
            no osds
     monmap e3: 3 mons at {ceph-mon0=192.168.42.10:6789/0,ceph-mon1=192.168.42.11:6789/0,ceph-mon2=192.168.42.12:6789/0}
            election epoch 6, quorum 0,1,2 ceph-mon0,ceph-mon1,ceph-mon2
     osdmap e1: 0 osds: 0 up, 0 in
      pgmap v2: 64 pgs, 1 pools, 0 bytes data, 0 objects
            0 kB used, 0 kB / 0 kB avail
                  64 creating
Connection to 127.0.0.1 closed.
```

Now move away from the keyboard and go grab a coffee.
The process should not last long, most of the time is spent on:

* booting the virtual machines
* install packages
* fetch docker images

<br />

> More improvement coming soon :)
