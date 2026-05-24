---
title: "VirtualBox Mac OS X 10.9: boot from an USB drive"
date: 2013-12-16 15:31:00
slug: virtualbox-mac-os-x-10-dot-9-boot-from-an-usb-drive
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![VirtualBox Mac OS X 10.9: boot from an USB drive](/images/virtualbox.jpg)

Quick How-to.

<!--more-->

First list all your device and identify your USB drive:

```bash
$ diskutil list
/dev/disk0
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *500.3 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:          Apple_CoreStorage                         499.4 GB   disk0s2
   3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
/dev/disk1
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:                  Apple_HFS Macintosh HD           *499.1 GB   disk1
/dev/disk2
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *8.1 GB     disk2
   1:                 DOS_FAT_32 ustack                  8.1 GB     disk2s4
```

What it's done, make sure it is not mounted:

```bash
$ diskutil unmountDisk /dev/disk2
Unmount of all volumes on disk2 was successful
```

The tricky part is that the VirtualBox process can only read/write files owned by the current user you are logged with.
However Mac OS X, had put root as owner.
With this default, you won't be able to import the disk file that we are going to create.
So the solution is too change the permission of the device.

```bash
$ ls -al /dev/disk2
brw-r-----  1 root  operator    1,   5 Nov 25 15:28 /dev/disk2

$ sudo chown leseb /dev/disk2
```

Then create the disk file:

```bash
$ VBoxManage internalcommands createrawvmdk -filename /Users/leseb/Documents/usbdrive.vmdk -rawdisk /dev/disk2
RAW host disk access VMDK file /Users/leseb/Documents/usbdrive.vmdk created successfully.
```

Eventually, add the disk file in your storage manager in VirtualBox.
