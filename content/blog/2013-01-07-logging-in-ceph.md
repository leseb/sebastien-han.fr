---
title: Logging in Ceph
date: 2013-01-07 13:06:00
slug: logging-in-ceph
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Logging in Ceph](/images/ceph-logging.jpg)

Configure logging in Ceph.

<!--more-->

If you have read my previous article about [OpenStack and Rsyslog](http://www.sebastien-han.fr/blog/2012/12/05/openstack-and-rsyslog/), you already know that I don't like to log INFO or basically all severities below 5. I also like to centralized my ERROR log to a rsyslog server.

In order to **only** enable logs in syslog, perform the following changes in your `ceph.conf`:

    [global]
    ...
    log file = none
    log to syslog = true
    err to syslog = true
    ...
    ...
    
    [mon]
    ...
    mon cluster log to syslog = true
    mon cluster log file = none
    ...
    ...

<br />
<span class="text_quote">R </span>Note: if you don't set `none`, monitors and OSDs will keep writing into a file, so you will end up with both syslog and file filled.

At the moment it's not possible to restrict log level to a certain severity nor a certain facility, simply because LOG_USER has been hardcoded.

See the feature opened on the [Ceph Tracker](http://tracker.newdream.net/issues/3704).

If you want to dive into all the debugging options, I recommend you to read [Ceph official documentation](http://ceph.com/docs/master/rados/configuration/log-and-debug-ref/).

<br />

> I really look forward a better logging implementation :-).
