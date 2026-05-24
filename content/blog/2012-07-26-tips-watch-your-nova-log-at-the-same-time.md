---
title: "Tip: watch your nova log at the same time"
date: 2012-07-23 01:03:00
slug: tips-watch-your-nova-log-at-the-same-time
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

I never thought about blogging this, but I think it can be useful for those of you who don't know this little tool called: [Multitail](http://www.vanheusden.com/multitail/).

<!--more-->

This tool can really change everyday life for every system administrator.
Basically, multitail offers you the possibility to watch simultaneously several logs files, for this it will split your terminal window in the way you configured it.

First of all install it:

```bash
$ sudo apt-get install multitail
```

A good example, here the one I use to check the logs from my compute nodes. Ideally any [ccze](http://freecode.com/projects/ccze) support to color your logs would be appreciate otherwise you'll have to this task manually.

```bash
#!/bin/bash

multitail -s 2 \
  -t nova-compute.log -l "tail -f /var/log/nova/nova-compute.log" \
  -t nova-network.log -l "tail -f /var/log/nova/nova-network.log" \
  -t nova-api-metadata.log -l "tail -f /var/log/nova/nova-api-metadata.log"
```

> Hope it helps!
