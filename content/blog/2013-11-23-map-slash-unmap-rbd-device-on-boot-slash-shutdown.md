---
title: Map/unmap RBD device on boot/shutdown
date: 2013-11-22 19:42:00
slug: map-slash-unmap-rbd-device-on-boot-slash-shutdown
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Map-unmap RBD device on boot-shutdown](/images/ceph-automount-at-boot.jpg)

Quick how-to on mapping/unmapping a RBD device during startup and shutdown.

<!--more-->

We are going to use an init script provided by the `ceph` package.
During the boot sequence, the init script first looks at `/etc/rbdmap` and will map devices accordingly.
Then, it will trigger `mount -a`.
As soon as the system is halted or rebooted, the script will unmount and unmap the devices.

Since you are not going to map/unmap RBD devices from one of your Ceph node you have to download the init script and install it on the client machine.


Download the init script and add it to the boot sequence:

```bash
$ sudo wget https://raw.github.com/ceph/ceph/a4ddf704868832e119d7949e96fe35ab1920f06a/src/init-rbdmap -O /etc/init.d/rbdmap
$ sudo chmod +x /etc/init.d/rbdmap
$ sudo update-rc.d rbdmap defaults
 Adding system startup for /etc/init.d/rbdmap ...
   /etc/rc0.d/K20rbdmap -> ../init.d/rbdmap
   /etc/rc1.d/K20rbdmap -> ../init.d/rbdmap
   /etc/rc6.d/K20rbdmap -> ../init.d/rbdmap
   /etc/rc2.d/S20rbdmap -> ../init.d/rbdmap
   /etc/rc3.d/S20rbdmap -> ../init.d/rbdmap
   /etc/rc4.d/S20rbdmap -> ../init.d/rbdmap
   /etc/rc5.d/S20rbdmap -> ../init.d/rbdmap
$ sudo apt-get install ceph-common -y
```

Create the device:

```bash
$ sudo rbd -p leseb create boot --size 10240
```

Assuming the pool `leseb` is readable and writable by a user `leseb` who has the corresponding key.

Edit `/etc/ceph/rbdmap`:

    # RbdDevice     Parameters
    leseb/boot        id=leseb,keyring=/etc/ceph/ceph.client.leseb.keyring

Format your device:

```bash
$ sudo mkfs.xfs /dev/rbd/leseb/boot
log stripe unit (4194304 bytes) is too large (maximum is 256KiB)
log stripe unit adjusted to 32KiB
meta-data=/dev/rbd/rbd/boot      isize=256    agcount=17, agsize=162816 blks
         =                       sectsz=512   attr=2, projid32bit=0
data     =                       bsize=4096   blocks=2621440, imaxpct=25
         =                       sunit=1024   swidth=1024 blks
naming   =version 2              bsize=4096   ascii-ci=0
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=8 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
```

Then edit your fstab with:

    /dev/rbd/leseb/boot /mnt/  xfs defaults,_netdev        0       0

Manual testing:

```bash
$ sudo /etc/init.d/rbdmap start
 * Starting RBD Mapping                                                          [ OK ]
 * Mounting all filesystems...                                                   [ OK ]
```

Verify:

```bash
$ sudo rbd showmapped
id pool   image snap device
1  leseb  boot  -    /dev/rbd1

$ sudo mount | grep mnt
/dev/rbd1 on /mnt type xfs (rw,_netdev)
```

<br />

> Obviously you definitely want to reboot your system to try it out :)
