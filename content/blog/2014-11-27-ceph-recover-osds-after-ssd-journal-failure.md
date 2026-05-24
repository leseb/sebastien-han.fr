---
title: "Ceph: recover OSDs after SSD journal failure"
date: 2014-11-27 11:05:00
slug: ceph-recover-osds-after-ssd-journal-failure
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: recover OSDs after SSD journal failure](/images/ceph-recover-osd-ssd-journal.jpg)

A common recommendation is to store OSD journal on a SSD drive which implies loosing your OSD if this journal fails.
This article assumes that your OSDs have been originally deployed with `ceph-disk`.
You will also realise that it's really simple to bring your OSDs back to life after replacing your faulty SSD with a new one.

<!--more-->

Even if OSDs have segfaulted, data directories are still mounted so you can easily get the journal FSID:

```bash
$ journal_uuid=$(sudo cat /var/lib/ceph/osd/ceph-0/journal_uuid)
$ sudo sgdisk --new=1:0:+20480M --change-name=1:'ceph journal' --partition-guid=1:$journal_uuid --typecode=1:45b0969e-9b03-4f30-b4c6-b4b80ceff106 --mbrtogpt -- /dev/sdk
```

The journal symlink should not be broken anymore and available at `/var/lib/ceph/osd/ceph-0/journal`.
Now we recreate the journal on our new partition and start our OSD.

```bash
$ sudo ceph-osd --mkjournal -i 20
$ sudo service ceph start osd.20
```

Bonus script:

```bash
#!/bin/bash

osds="1 2 3"
journal_disk=/dev/sdk

for osd_id in $osds; do
  journal_uuid=$(sudo cat /var/lib/ceph/osd/ceph-$osd_id/journal_uuid)
  sudo sgdisk --new=0:0:+20480M --change-name=0:'ceph journal' --partition-guid=0:$journal_uuid --typecode=0:45b0969e-9b03-4f30-b4c6-b4b80ceff106 --mbrtogpt -- $journal_disk
  sudo ceph-osd --mkjournal -i $osd_id
  sudo service ceph start osd.$osd_id
done
```

<br />

> Simple right? To create more partitions, simply change the 1 in the sgdisk command with another number which represents the partition number.
