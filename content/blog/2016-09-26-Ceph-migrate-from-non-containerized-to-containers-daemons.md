---
title: Ceph migrate from non-containerized to containerized daemons
date: 2016-09-26 11:34:57
slug: Ceph-migrate-from-non-containerized-to-containers-daemons
draft: false
categories: ["ceph"]
tags: ["ceph", "containers"]
---

![Ceph migrate from non-containerized to containerized daemons](/images/ceph-migrate-non-container-to-container.jpg)

Long time no see!
I know, though times at the office, this won't probably stop until Christmas break, so I'll do my best to keep up the pace.
In this article, I will explain how to take over an existing Ceph bare metal deployment and use containers.
Spoiler: Ansible baby, Ansible!

<!--more-->

This is not a secret for anybody, more and more organizations are moving to containers and the world of microservices.

The procedure is pretty straighforward and there is no real magic behind it.
There are just a few things to pay attention to such:

* a bit obvious but make sure docker is installed and running
* set proper SeLinux profiles if we are running on Red Hat based system
* directory permissions: container images (Ubuntu, RHEL, Fedora...) can run on any base operating system, they just share the same kernel.
However in our scenario we need to re-use existing directories by relying on host path bind mounting.
On Red Hat based systems and Debian, the Ceph user has a different UID, which makes the transition a bit tricky.
Let's say the base operating system is Ubuntu, the current non-containerized daemons are running under the Ceph user with the 167 UID.
Now if you're looking at switching to Fedora container images (for whatever reasons) that image will have the Ceph user with the 64045 UID.
Ultimately runing the containers will result in denied permissions.
* unmount OSD directories

Obviouly prior to move to another node we always make sure monitor are back in quorum and that PGs are clean.
The playbook leaves on [Ceph Ansible](https://github.com/ceph/ceph-ansible/blob/master/infrastructure-playbooks/switch-from-non-containerized-to-containerized-ceph-daemons.yml).

You can run it like this:

```
$ ansible-playbook infrastructure-playbooks/switch-from-non-containerized-to-containerized-ceph-daemons.yml
Are you sure you want to switch from non-containerized to containerized ceph daemons? [no]: yes
```

<br />

> So with this, are you ready to move to containers? :)
