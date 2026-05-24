---
title: Ceph Docker better support for Bluestore
date: 2017-06-14 11:16:04
slug: Ceph-Docker-better-support-for-Bluestore
draft: false
categories: ["containers"]
tags: ["containers", "ceph"]
---

![Title](/images/better-bluestore-support-container.jpg)

I have been extensively working on [ceph-docker](https://github.com/ceph/ceph-docker) for the last few months and it's getting better.
With the upcoming arrival of Ceph Luminous (next LTS), Bluestore will be the default backend to store objects.
Thus, I had to spend some time working on improving the support for Bluestore.

<!--more-->

Now, if you want to prepare a device with Bluestore you can specify different device for:

* `OSD_DEVICE`: device where data will be stored
* `OSD_BLUESTORE_BLOCK_DB`: device that store RocksDB metadata
* `OSD_BLUESTORE_BLOCK_WAL`: device that stores RocksDB write-ahead journal

See it in action, this is the command to prepare a Bluestore OSD:

```
$ docker run -d \
--net=host \
--pid=host \
--privileged=true \
-v /etc/ceph:/etc/ceph \
-v /var/lib/ceph/:/var/lib/ceph/ \
-v /dev/:/dev/ \
-e OSD_DEVICE=/dev/sda \
-e OSD_BLUESTORE_BLOCK_WAL=/dev/sdb \
-e OSD_BLUESTORE_BLOCK_DB=/dev/sdc \
-e CEPH_DAEMON=OSD_CEPH_DISK_PREPARE \
-e OSD_BLUESTORE=1 \
ceph/daemon
```

Soon, Bluestore will be the 'real' default and the `OSD_BLUESTORE=1` won't be necessary anymore.

<br />

> Hopefully, more posts coming soon :).
