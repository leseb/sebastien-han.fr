---
title: Devstack Ceph supports containerized Ceph
date: 2016-10-21 15:18:20
slug: Devstack-Ceph-supports-containerized-Ceph
draft: false
categories: ["openstack"]
tags: ["openstack", "ceph", "containers"]
---

![Devstack Ceph supports containerized Ceph](/images/devstack-ceph-container.jpg)

Yes people, I'm still alive :).
As you might noticed, I've been having a hard time to keep up the pace with blogging.
It's mainly due to me traveling a lot these days and preparing conferences.
It's a really busy end of the year for me :).

Fortunately, I'm still finding the time to work on some new features to projects I like.
As you might know, I've been busy working on ceph-ansible and ceph-docker, trying conciliate both and making sure they work well together.
In ceph-docker, we have an interesting container image, that I already presented [here](http://www.sebastien-han.fr/blog/2015/08/24/ceph-cluster-on-docker-for-testing/).
I was recently thinking we could use it to simplify the Ceph bootstrapping process in DevStack.
The patch I recently merge doesn't get ride of the "old" way to bootstrap, the path is just a new addition, a new deployment method.

In practice, this doesn't change anything for me, but at some point it allows us to validate that a containerized Ceph doesn't have any problem and bring the same functionality as a non-containerized Ceph.
Without further ado, let's jump into this!

<!--more-->

The commit introduces the support of deploying a containerized Ceph cluster.
It relies on the `ceph/demo` container image available as part of the [ceph-docker project](https://github.com/ceph/ceph-docker).

To enable this scenario, just set `CEPH_CONTAINERIZED` to `True` in your `localrc` file.
This will install Docker and run the `ceph/demo` container.
Obviously, all the previous available options will work.
So settings like `CEPH_LOOPBACK_DISK_SIZE` continue to work.

One thing to note is that this doesn't work with the Cinder backup service as we need to change DevStack core, the patch for this is currently [under review](https://review.openstack.org/#/c/389700/).

<br />

> I hope you will find this feature useful as much as I do. Next week, I'll be heading to OpenStack summit in Barcelona, hope to see you there ;).
