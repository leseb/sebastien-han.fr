---
title: "Ceph tip: build your monitor map"
date: 2012-08-09 01:21:00
slug: ceph-build-your-monitor-map
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph monitor map](/images/monmap.jpg)

If you want to change or rebuild a new set of monitor servers, you will need to manipulate the monmap. This monmap is exchange between every monitors.

<!--more-->

First get your current monmap whithout any changes:

```bash
$ ceph mon getmap -o /tmp/monmap
got latest monmap

$ monmaptool --print /tmp/monmap 
monmaptool: monmap file /tmp/monmap
epoch 1
fsid dea89929-963c-4173-9eaf-8e832d6d9dd1
last_changed 2012-07-01 17:10:16.085277
created 2012-07-01 17:10:16.085277
0: 192.168.146.195:6789/0 mon.0
1: 192.168.146.196:6789/0 mon.1
2: 192.168.146.197:6789/0 mon.2
```

Now create a new one, just be sure to use the **same fsid** as your current monmap:

```bash
$ monmaptool --create --add mon.1 10.0.1.1:6789 --add mon.2 10.0.1.2:6789 --add mon.3 10.0.1.3:6789 --fsid dea89929-963c-4173-9eaf-8e832d6d9dd1 --clobber monmap
monmaptool: monmap file monmap
monmaptool: set fsid to dea89929-963c-4173-9eaf-8e832d6d9dd1
monmaptool: writing epoch 0 to monmap (3 monitors)

$ monmaptool --print monmap 
monmaptool: monmap file monmap
epoch 0
fsid dea89929-963c-4173-9eaf-8e832d6d9dd1
last_changed 2012-07-27 01:18:43.321681
created 2012-07-27 01:18:43.321681
0: 10.0.1.1:6789/0 mon.mon.1
1: 10.0.1.2:6789/0 mon.mon.2
2: 10.0.1.3:6789/0 mon.mon.3
```

<br />

<span class="text_quote">W </span> **DON'T PLAY WITH THE MONITOR WITH A PRODUCTION CLUSTER**

<br />

> After that, you can run your mkcephfs, Chef or Puppet!

<br />

<span class="text_quote">K </span>Reference links: 

* [http://ceph.com/docs/master/man/8/monmaptool/](http://ceph.com/docs/master/man/8/monmaptool/)
* [http://ceph.com/docs/master/ops/manage/grow/mon/](http://ceph.com/docs/master/ops/manage/grow/mon/)
