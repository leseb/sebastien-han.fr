---
title: Ceph RBD mirror daemon available in containers
date: 2016-07-21 10:39:15
slug: RBD-mirror-daemon-available-in-containers
draft: false
categories: ["containers"]
tags: ["ceph", "containers"]
---

![Title](/images/rbd-mirror-container.jpg)

I recently pushed into [ceph-docker](https://github.com/ceph/ceph-docker) the support for thr RBD mirror.
This daemon is responsable for asynchronously replicating RBD images from one cluster to another.
The main purpose of the daemon is to address disaster recovery use cases.

<!--more-->

It is quite straightforward to deploy this container.
The implementation is part of the `daemon` image that contains all the Ceph daemons.
Simply run:

    sudo docker run -d --net=host ceph/daemon rbd_mirror

More recently, [ceph-ansible](https://github.com/ceph/ceph-ansible) also supports deploying containerized RBD mirror daemons.
As always you can play with Vagrant to check the result.
Just set `rbd_mirror_vms: 1` in your `vagrant_variables.yml` and run `vagrant up`.

<br />

> Since this deaemon is stateless we can easily run it in containers.
It doesn't have strong requirements.
However keep in mind that the RBD mirror daemon can only run once in Jewel but we will be able to chain multiple daemons in the Kraken release.
So it will be even better to run in containers.
