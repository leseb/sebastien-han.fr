---
title: Introducing FlashCache
date: 2012-06-17 22:56:00
slug: introducing-flashcache
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![Flash](/images/Flash.jpg)

FlashCache is a generic write back block level storage caching solution developed by Facebook. It's actively used in production within Facebook and released as GPL v2 license.

<!--more-->

# Introduction

As I mentioned above, FlashCache is a generic write back block level storage caching solution. Basically, in the Facebook context (but widely applicable to any company use case), the primary usage of FlashCache was for databases. It was built primarily as a block cache for InnoDB but can be used by other applications as well. Facebook has a large amount of database servers and needs to serve this data really quickly. Typically when a failover occurs there is a little timeout during which the data are not served. Thus you will faced a huge performance hit the next time the data is retrieved. These kinds of lags aren't acceptables for anyone. This is why Facebook developed FlashCache, mainly to improve performance hit and cold cache.

![My SSD is faster than your HDD](/images/my-ssd-is-faster-than-your-hdd.png)

The hypothetical solution would be to replace all the HDDs by SSDs but this solution is not affordable because it's really costly. The other solution is to use a combination of fast and expensive SSDs with a lot of slower but cheap HDDs.
The principe is truly simple, the first hit is served from the HDD --> cached in your FlashCache block device. The next time the data will be served by the FlashCache block device (cached in the SSD).

<br />
Of course everyone speaks about SSDs because it's the most efficient way to improve the cache but the caching devices can be:

* SSDs
* RAM disks
* tmpfs

Given that it's very well discribed in the [Github documentation](https://github.com/fghaas/flashcache/blob/master/doc/flashcache-doc.txt), FlashCache is a device mapper module because it uses the device mapper layer and can be built on top of it, like LVM for example. Thanks to that, FlashCache can be exposed as a simple block device.

By the way, I truly advise you to watch Florian Haas's excellent talk:

<iframe width="420" height="315" src="http://www.youtube.com/embed/l910kiEuHOM" frameborder="0" allowfullscreen></iframe>
