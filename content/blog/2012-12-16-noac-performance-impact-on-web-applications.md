---
title: NFS attribute caching performance impact on web applications
date: 2012-12-18 21:58:00
slug: noac-performance-impact-on-web-applications
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![NFS attribute caching performance impact on web applications](/images/nfs-perf-noac.jpg)

A couple of days ago, I had some issues with NFS consistency, not every servers were up to date. Some servers had the good version of the file some hadn't. However performing a `ls -l` seemed to fixed tempory the problem after each update (where a simple `ls` didn't). Indeed issuing `ls` with the `-l` option triggers stat() where `ls` doesn't, just because file attributes are called from the `stats()` function. I needed to investigate...

<!--more-->

<br />

# I. Story

We determined that some web virtual didn't delivered the same content, some page weren't updated properly. We quickly figured out that the issue was located of the NFS attribute caching, by default too long, at least in our setup. The first change we made was to enable the `noac` option on the client mount. However while trying to enhance the consistency of the NFS data, the performance impact was pretty high. The impact was easy to detect and reproduce. Basically everytime a page was request from the webser, the client had to request the NFS server to be sure to deliver the latest version. As I said, it's quite easy to notice it, espacially the impact on the Time To First Bite value. You will mainly notice that the website takes a lot of time to load and all of sudden the content is quickly delivered.

Quick definition of the TTFB, stolen from Wikipedia, Time To First Byte or TTFB is a measurement that is often used as an indication of the responsiveness of a webserver or other network resources.

A bad TTFB can be related to a lot of things:

* HTTP KeepAlive
* Slow storage backend
* Limited webserver connection

To mesure the Time To First Bite, I always use the following command (see example for my Website):

```bash
$ curl -o /dev/null -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total time: %{time_total} \n" -s http://sebastien-han.fr
Connect: 0,042 TTFB: 0,223 Total time: 0,224 
```

Quite fast :)

<br />

# II. Tests

Now see the performance impact by using different options/behavior to cache file attribute on a NFS mount (client side).

## II.1. NOAC option

Stolen from the [NFS man page](http://linux.die.net/man/5/nfs).

NOAC: Use the noac mount option to achieve attribute cache coherence among multiple clients. Almost every file system operation checks file attribute information. The client keeps this information cached for a period of time to reduce network and server load. When noac is in effect, a client's file attribute cache is disabled, so each operation that needs to check a file's attributes is forced to go back to the server. This permits a client to see changes to a file very quickly, at the cost of many extra network operations.

```bash
$ for i in `seq 5`; do curl -o /dev/null -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total time: %{time_total} \n" -s http://one-of-the-website-I-host ; done
Connect: 0,018 TTFB: 9,265 Total time: 9,322 
Connect: 0,009 TTFB: 7,150 Total time: 7,195 
Connect: 0,012 TTFB: 7,172 Total time: 7,220 
Connect: 0,010 TTFB: 7,082 Total time: 7,156 
Connect: 0,019 TTFB: 10,663 Total time: 10,743 
```

## II.2. lookupcache=none

Stolen from the [NFS man page](http://linux.die.net/man/5/nfs).

If the client ignores its cache and validates every application lookup request with the server, that client can immediately detect when a new directory entry has been either created or removed by another client. You can specify this behavior using lookupcache=none. The extra NFS requests needed if the client does not cache directory entries can exact a performance penalty. Disabling lookup caching should result in less of a performance penalty than using noac, and has no effect on how the NFS client caches the attributes of files.

```bash
$ for i in `seq 5`; do curl -o /dev/null -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total time: %{time_total} \n" -s http://one-of-the-website-I-host ; done
Connect: 0,011 TTFB: 3,654 Total time: 3,696 
Connect: 0,011 TTFB: 3,350 Total time: 3,392 
Connect: 0,010 TTFB: 3,535 Total time: 3,581 
Connect: 0,009 TTFB: 3,416 Total time: 3,460 
Connect: 0,009 TTFB: 3,312 Total time: 3,356 
```

## II.3. actimeo=3

Stolen from the [NFS man page](http://linux.die.net/man/5/nfs).

Using actimeo sets all of acregmin, acregmax, acdirmin, and acdirmax to the same value.

* acregmin=n, The minimum time (in seconds) that the NFS client caches attributes of a regular file before it requests fresh attribute information from a server. If this option is not specified, the NFS client uses a 3-second minimum.
* acregmax=n, The maximum time (in seconds) that the NFS client caches attributes of a regular file before it requests fresh attribute information from a server. If this option is not specified, the NFS client uses a 60-second maximum.
* acdirmin=n, The minimum time (in seconds) that the NFS client caches attributes of a directory before it requests fresh attribute information from a server. If this option is not specified, the NFS client uses a 30-second minimum.
* acdirmax=n, The maximum time (in seconds) that the NFS client caches attributes of a directory before it requests fresh attribute information from a server. If this option is not specified, the NFS client uses a 60-second maximum.


```bash
$ for i in `seq 5`; do curl -o /dev/null -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total time: %{time_total} \n" -s http://one-of-the-website-I-host ; done
Connect: 0,010 TTFB: 2,592 Total time: 2,639 
Connect: 0,010 TTFB: 1,592 Total time: 1,636 
Connect: 0,010 TTFB: 1,679 Total time: 1,727 
Connect: 0,010 TTFB: 1,592 Total time: 1,656 
Connect: 0,010 TTFB: 1,695 Total time: 1,740 
```

## II.4. actimeo=1

```bash
$ for i in `seq 5`; do curl -o /dev/null -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total time: %{time_total} \n" -s http://one-of-the-website-I-host ; done
Connect: 0,010 TTFB: 1,726 Total time: 1,769 
Connect: 0,009 TTFB: 1,739 Total time: 1,782 
Connect: 0,009 TTFB: 1,704 Total time: 1,750 
Connect: 0,009 TTFB: 3,136 Total time: 3,212 
Connect: 0,014 TTFB: 1,730 Total time: 1,770 
```

<br />

> Use this mount option _only_ if you have really good reason... From my experience, the `noactimeo` option did the job pretty well.
