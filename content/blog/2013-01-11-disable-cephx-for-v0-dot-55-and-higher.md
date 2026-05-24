---
title: Disable CephX for v0.55 and higher
date: 2013-01-11 01:34:00
slug: disable-cephx-for-v0-dot-55-and-higher
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Disable CephX for v0.55 and higher](/images/disable-cephx.jpg)

A lot of new features came with the version 0.55 of Ceph, one of them is that CephX authentication is **enable by default**. If you run v0.48 Argonaut without CephX and want to update to the latest Bobtail, you might run through some problems if you don't edit your configuration file.

<!--more-->

In previous versions stable branch, you could simply use the following setting:

     auth supported = [cephx | none]

This option is now deprecated. Bobtail now integrates a new finer-grained authentication, it supports 3 new authentication methods:

* cluster: 
* service: internal daemons communication, for instance OSD to OSD connections
* client: client side, machine that tries to connect to the cluster

By default **daemons** require CephX authentication, which means that OSD, MON and MDS will now use CephX to connect to each others. ON the other side, **clients** will continue to connect with disabled authentication.

    [global]
    ...
    auth cluster required = none    
    auth service required = none
    ...

To disable client authentication as well:

    [global]
    ...
    auth client required = none
    ...

<br />
<span class="text_quote">W </span>Important: If your cluster does not currently have an `auth supported` line that enables authentication, you must explicitly turn it off in Bobtail using the settings below.::

<br />

> Et voilà !
