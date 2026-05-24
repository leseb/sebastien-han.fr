---
title: "Ceph Jewel: configure BlueStore with multiple devices"
date: 2016-05-04 15:25:35
slug: Ceph-Jewel-configure-BlueStore-with-multiple-devices
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph Jewel: configure BlueStore with multiple devices](/images/ceph-configure-bluestore.jpg)

As presented in [my preview of BlueStore](http://www.sebastien-han.fr/blog/2016/03/21/ceph-a-new-store-is-coming/), this new store has the ability tp be configured with multiple devices.
Since the `ceph-disk` utility does not support configuring multiple devices, OSD must be configured manually.
Let's see how we can configure this.

<!--more-->

## BlueStore

As a reminder, BlueStore supports 3 ways to store several kind of data and metadata.
Such as:

* **Data**: stored on a RAW block device, **typically a HDD**
* **Metadata**: stored on a RAW block device, **can be on a SSD**
* **RocksDB write-ahead log**: stored on a RAW block device, **can be on a Non-volatile Memory (NVM) or Non-volatile random-access memory (NVRAM) or persistent memory**

It is quite simple to configure those on separate devices, for this you have two options:

* Register an OSD section in your `ceph.conf`
* Use symlinks that point to the device partition

### Using ceph.conf

Register OSD IDs like so:

    [osd.0]
      host = ceph-01
      osd data = /var/lib/ceph/osd/ceph-0/
      bluestore block path = /dev/disk/by-partlabel/osd-device-0-block
      bluestore block db path = /dev/disk/by-partlabel/osd-device-0-db
      bluestore block wal path = /dev/disk/by-partlabel/osd-device-0-wal

### Using symlink

Simply create the following symlinks:

* `block`: pointing to the device where data will be stored
* `block.db`: pointing to the device that store RocksDB metada
* `block.wal`: pointing to the device that stores RocksDB write-ahead journal

So this will give us:

```bash
$ sudo ln -sf /dev/disk/by-partlabel/osd-device-0-block /var/lib/ceph/osd/ceph-0/block
$ sudo ln -sf /dev/disk/by-partlabel/osd-device-0-db /var/lib/ceph/osd/ceph-0/block.db
$ sudo ln -sf /dev/disk/by-partlabel/osd-device-0-wal /var/lib/ceph/osd/ceph-0/block.wal
```

<br />

> The support from `ceph-disk` should likely land in the next release of Jewel. **Yet another reminder regarding BlueStore. Don't get to excited, BlueStore is still early ages and should not be deployed on production environment with sensitive data. So make sure you always perform backup because the risk of losing data exists.**
