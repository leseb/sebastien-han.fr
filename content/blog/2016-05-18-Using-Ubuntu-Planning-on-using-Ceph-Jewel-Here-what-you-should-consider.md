---
title: Using Ubuntu? Planning on using Ceph Jewel? Here what you should consider
date: 2016-05-18 23:49:14
slug: Using-Ubuntu-Planning-on-using-Ceph-Jewel-Here-what-you-should-consider
draft: false
categories: ["ceph"]
tags: ["ceph", "ansible"]
---

![Title](/images/ubuntu-migration-ceph-upgrade.jpg)

The new Ubuntu LTS 16.04, code name: Xenial Xerus was just released a couple of weeks ago.
Interestingly the new Ceph LTS, code name Jewel also just got released!
Being a really lover of Ansible, I just got what I would call an interesting idea.

<!--more-->

A year ago, I was writing, how you could perform rolling upgrade of your [Ceph cluster using Ansible](http://www.sebastien-han.fr/blog/2015/03/30/ceph-rolling-upgrades-with-ansible/).
A couple of months ago, I was explaining how you could [upgrade or swap your operating system](http://www.sebastien-han.fr/blog/2016/03/07/migrate-ceph-cluster-from-one-distro-to-another/) to migrate your Ceph cluster using a playbook I wrote.

I think you have started to understood where I'm going :)
Indeed, I believe it is the right time to non-only upgrade your Ceph cluster but also upgrade your Operating system with it!

This scenario has a couple of assumptions:

* you have an image based bootstrapping method to install your operating system.
This makes the process a lot easier as operating system images are versioned and everything is already installed.
So after bootstrapping, what you get is a consistent, reproducible and idempotent state of your system.
* you use Ansible, that one is easy and hopefully already solve. If not what are you waiting for?

**Important note, the migration process does not have anything to do with Ubuntu in particular**, I just happened to have the idea because both latest Ceph and Ubuntu LTS almost came out at the same time.
So the operating system migration can be done from any distro to any distro.
This won't change the process.

Now going back to our migration.
Ideally you would be running Ceph Infernalis and any Ubuntu distribution (Trusty 14.04 for instance).
Then you build your new Ubuntu 16.04 image, and install Ceph Jewel on it.
Now fire the `cluster-os-migration.yml`
Obviously you bootstrap system will proceed as soon as the node is being rebooted.
When the operating system comes up, Ceph processes will start under their respective new versions.

What can alternatively be done is to re-use the logic in `cluster-os-migration.yml` for your own needs.
The most important pieces of the playbook are:

* For monitors: compress the monitor store (not mandatory but always good)
* For monitors: [archive the monitor store](https://github.com/ceph/ceph-ansible/blob/master/cluster-os-migration.yml#L126-L131)
* For monitors: [quorum check](https://github.com/ceph/ceph-ansible/blob/master/cluster-os-migration.yml#L219-L228)
* For OSDS: set the following flag: `noout`, `nobackfill`, `nodeep-scrub`, `noscrub`.
* For OSDs: [PG check](https://github.com/ceph/ceph-ansible/blob/master/cluster-os-migration.yml#L408-L417)
* For OSDs: unset cluster flags

The idea would be use the OS migration playbook.

> Hope you will consider this approach ;-)
