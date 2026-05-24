---
title: Feel the awk power
date: 2015-04-14 17:54:00
slug: feel-the-awk-power
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

Some of my favorite AWK expressions:

```bash
OSD_LISTEN_PORTS:$(netstat -tlpn | awk -F ":" '/ceph-osd/ { sub (" .*", "", $2); print $2 }' | uniq)
NETWORK=$(ip -4 -o a | awk '/eth0/ {print $4}')
IP=$(ip -4 -o a | awk '/eth0/ { sub ("./..", "", $4); print $4 }')
```

<br />

> Because `grep foo | awk '{print $1}'` is **not** elegant!

<!--more-->
