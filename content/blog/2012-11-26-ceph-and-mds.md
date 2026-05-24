---
title: Ceph and MDS
date: 2012-12-03 18:16:00
slug: ceph-and-mds
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph and MDS](/images/ceph-mds-ready.jpg)

I've been often asked a couple of time, why CephFS is not ready? Does this statment is still true?

<!--more-->

The Ceph developpers have been focusing on major components of Ceph:

* RADOS: the object store
* RBD: the RADOS Block Device

Those 2 components are really robust and production ready.

# I. CephFS

## I.1. Filesystem metadata

Metadata? Every filesystems store metadata. They record information about files. This can various be things:

* Permissions
* Hierarchy
* Names
* Timestamp
* Owners

And CephFS is no exception to the rule, it needs to keep track of those information, somewhere.

## I.2. The Metatadata Server

A bit about the Metadata Server:

* Manages metadata for a POSIX-compliant shared filesystem
* Directory hierarchy
* File metadata (owner, timestamps, mode, etc.)
* Stores metadata in RADOS
* Does **not** serve file data to clients
* Only required for shared filesystem

See below the big picture and how the MDS works:

![Ceph MDS works](/images/ceph-mds-work.jpg)

The MDS **only** stores metadata related to the files. It uses the RADOS object store as all the other component of Ceph.

As Sage mentionned it during the Ceph Day in Amsterdam, Ceph looks like this at the moment:

![Ceph State](/images/ceph-state.jpg)

## I.3. Is CephFS ready for production?

There we are, this was the original purpose of this article. I would personally say that you can use it, if you don't put heavy load on it. There are a couple things that you need to be aware of like:

* The MDS is not highly available: at the moment you can only run multiple MDS at the same time but **only one** is active. The others are waiting and ready to be active if the current MDS running fails.
* A lot of bugs need to be fixed. Thus if you want to use it, it's at your own risks. The CephFS hasn't been tested enough.

<br />

> Hope this will clarify minds ;-)
