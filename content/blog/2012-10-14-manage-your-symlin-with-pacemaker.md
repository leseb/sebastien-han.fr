---
title: Manage your symlinks with Pacemaker
date: 2012-11-01 01:07:00
slug: manage-your-symlin-with-pacemaker
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

![Manage your symlinks with Pacemaker](/images/drbd-links.jpg)

Manages symlinks into a shared partition, which is shared among several machines.

<!--more-->

Some setup can require multiple software on the same machine, since we care about uptime and HA we use DRBD in combinaison with Pacemaker. However we also need to manage configuration files instead of data. Basically we keep config files and application data in a DRBD partition. This is why you need to use symlinks to change the location of your config file (default /etc/) and point it to your DRBD partition. You can end up with this kind of infrastructure:

![Utility Servers](/images/utility-infra.jpg)

Pacemaker is full of amazing contributions such as this resource agent called SYMLINK. You might already have guesses that this resource agent manages symlinks. Let's take a common example with the following stack:

* DRBD resource
* Filesystem
* Symlink
* Floating IP
* Your application

So now, I assume that your configuration looks more or less like the stack above. In the example below, I only add the management of the symlink:

```bash
$ sudo crm configure primitive p_sym_leseb ocf:heartbeat:symlink \
        params target="/mnt/drbd/util1/leseb" link="/etc/leseb" backup_suffix=".active"
```

Some colocation and ordering, to be sure to always run p_sym_leseb with and after the DRBD resource:

```bash
$ sudo crm configure colocation col_sym_with_util1 inf: p_sym_leseb ms_drbd_util1:Master
$ sudo crm configure order ord_sym_after_util1 inf: ms_drbd_util1:promote p_sym_leseb:start
```

What does the RA do? Basically it checks if a file called `leseb` in /etc exists, if it does it simply rename `leseb.active` after the symlink is created. If it does not it directly creates the symlink.


Note a software called DRBDLinks also exists, it basically manage your symlinks for your application, check out the [DRBDLinks website](http://www.tummy.com/Community/software/drbdlinks/). The only bad thing is DRBDLinks is a huge python (I have nothing against python btw), and there is no RA for it. But it can be integrated as a resource in pacemaker. In my opinion, the Symlink RA has a better integration to the Pacemaker stack, so it's wiser to use it instead of DRBDLinks.

<br />

>Handy! Isn't it?

