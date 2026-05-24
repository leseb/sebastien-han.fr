---
title: Migrate Ceph cluster from one distro to another
date: 2016-03-07 11:28:00
slug: migrate-ceph-cluster-from-one-distro-to-another
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

![Migrate Ceph cluster from one distro to another](/images/migrate-ceph-cluster-from-ubuntu-to-rhel.jpg)

One of the recent use case I had was to migrate an Ubuntu based Ceph cluster to RHEL.
We had strict requirements and did not want to have any data being migrated.
It is yet another beauty from Ceph and particularly OSDs, where they basically have the ability to run on any machines.
Let's say you have an OSD, you can pull out the disk and plug in on another machine seamlessly.
The approach taken here was a bit different, but relies on this capability.

<!--more-->

I built the automation using Ansible.
The procedure is rather simple and could be decoupled as follow.
Note that all the tasks are being serialized.

For monitors:

* Compress the monitor store
* Archive the monitor store
* Copy the archive to the Ansible server
* Stop the monitor
* Stop the server and install RHEL **using your own provisioning method**, the playbook only calls `reboot`.
* Once the server is up we copy the archive on the new machine (**make sure Ceph is installed with the exact same version**)
* Archive and copy back the files
* Start the monitor and wait to form a quorum with the others.
* We repeat this for the remaining monitors

For OSDs:

* Set `noout` flag, so no recovery will be triggered
* Archive OSD bootstrap key and `ceph.conf`
* Copy the archive to the Ansible server
* Stop the OSDs
* Stop the server and install RHEL **using your own provisioning method**, the playbook only calls `reboot`.
* Once the server is up we copy the archive on the new machine (**make sure Ceph is installed with the exact same version**)
* Archive and copy back the files
* Start the OSD and wait for PGs to be clean, once their state is `active+clean` we start another OSD host

In practice, you simple need to:

```bash
$ git clone https://github.com/ceph/ceph-ansible.git
$ cd ceph-ansible
$ ansible-playbook cluster-os-migration.yml
```

<br />

> Happy migration! One last note, the procedure does not trigger any data movement, so this operations runs on live, is rolling and does **not** impact connected clients.
