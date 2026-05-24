---
title: Ceph ansible now supports dmcrypt
date: 
slug: Ceph-ansible-now-supports-dmcrypt
draft: false
categories: ["ansible"]
tags: ["ansible", "ceph"]
---

![Ceph ansible now supports dmcrypt](/images/ceph-ansible-dmcrypt.jpg)

I recently worked on a new feature that ceph-ansible was laking of: support for dmcrypt.
This dmcrypt scenario basically allows you to deploy encrypted OSD data directories.
The encrypted key is stored on the monitor's key/value store.
Until recently ceph-ansible wasn't capable of deploying such configuration.
Let's see how this can be configured.

<!--more-->

Within the dmcrypt implementation we support 2 sub scenarios:

* dmcrypt_journal_collocation: where the OSD journal is collocated on the same device as the OSD data directory
* dmcrypt_dedicated_journal: where the OSD journal is stored on a different device than the OSD data directory

This is quite straightforward simply open your `group_vars/osds` and uncomment the following:

    dmcrypt_journal_collocation: true
    devices:
      - /dev/sdb
      - /dev/sdc

Same for dedicated journal device:

    dmcrypt_dedicated_journal: true
    devices:
      - /dev/sdb
      - /dev/sdc
    raw_journal_devices:
      - /dev/sdd
      - /dev/sdd

<br />

> Let's encrypt everything!
