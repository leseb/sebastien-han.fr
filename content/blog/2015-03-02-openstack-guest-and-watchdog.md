---
title: OpenStack guest and watchdog
date: 2015-03-09 12:04:00
slug: openstack-guest-and-watchdog
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack guest and watchdog](/images/openstack-watchdog-device.jpg)

Libvirt has the ability to configure a watchdog device for QEMU guests.
When the guest operating system hangs or crashes the watchdog device is used to automatically trigger some actions.
The watchdog support was added in OpenStack Icehouse.

<!--more-->

<br />

# Watchdog?

The device can be configured with different values:

* poweroff: shutdown the instance
* reset: restart the instance
* pause: pause the instance
* none: don't do anything

```bash
$ glance image-update d658c7b8-d782-44ed-9fed-7ccddb3ee68e --property hw_watchdog_action=pause
```

Looking at the xml file the device is present:

    <watchdog model='i6300esb' action='pause'>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0'/>
    </watchdog>

<br />

> This is a first step to recover from guest failures.
