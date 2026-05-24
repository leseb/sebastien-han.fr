---
title: Ceph zap device container
date: 2016-07-25 11:24:43
slug: Ceph-Zap-device-container
draft: false
categories: ["containers"]
tags: ["containers", "ceph"]
---

![Title](/images/zap-device-container.jpg)

Some use cases might require to zap a device (destroy partition tables) prior to run your Ceph OSD container with a dedicated disk.
While running development environment this is particularly interesting as this allows us to quickly bootstrap and tear down sandboxes.

<!--more-->

The container will be ephemeral, meaning it will exit as soon as the zap command is done.
Calling this container is pretty straightforward, example with a `/dev/sdd` device:

```bash
$ docker run -d --privileged=true -v /dev/:/dev/ -e OSD_DEVICE=/dev/sdd ceph/daemon zap_device
```

<br />

> This feature is also part of ceph-ansible while deploying a containerized Ceph cluster.
