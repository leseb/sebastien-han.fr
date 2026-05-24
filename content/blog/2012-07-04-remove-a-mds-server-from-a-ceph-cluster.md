---
title: Remove a MDS server from a Ceph cluster
date: 2012-07-04 15:15:00
slug: remove-a-mds-server-from-a-ceph-cluster
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Quick tip.

If you don't use CephFS, you don't need a MDS server. However if you installed it simply to try CephFS and if you'r done playing with it here is how to delete the MDS server.

<!--more-->

First stop every MDS running daemon:

```bash
$ sudo service ceph stop mds
=== mds.0 === 
Stopping Ceph mds.0 on server-3...kill 1190...done
```

Remove the MDS section in your `ceph.conf` configuration file:

    [mds]
        keyring = /etc/ceph/keyring.$name
    [mds.0]
        host = server-3

And so on for every MDS server.

Now run this command:

```bash
$ ceph mds rm mds.0
mds gid 0 dne
```

Sometimes (for unknow reason), after deleting the MDS, this message will remain on the ceph log:

```bash
$ ceph health
HEALTH_WARN mds 0 is laggy
$ ceph mds stat
e35: 1/1/1 up {0=0=up:active(laggy or crashed)}
```

To overcome this problem run:

```bash
$ ceph mds newfs metadata data --yes-i-really-mean-it
new fs with metadata pool 0 and data pool 0
$ ceph health
HEALTH_OK
```

<span class="text_quote">R </span>Note: as Gregory Farnum mentioned it, the new cephfs command needs pool IDs as an argument and **not** pool name. :-)

This command will remove the MDS map.

Eventually uninstall all the packages related to CephFS:

```bash
$ sudo apt-get purge ceph-fuse ceph-mds libcephfs1 -y
```

<br />

>Et voilà!

