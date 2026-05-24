---
title: "OpenStack: perform consistent snapshots"
date: 2012-12-10 10:30:00
slug: openstack-perform-consistent-snapshots
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack: perform consistent snapshots](/images/openstack-consistent-snapshots.jpg)

Make consistent instance or volume snapshots.

<!--more-->

It's not that easy to perform consistent snapshot, in one hand you want the latest data available and in another hand you want is to be as consistent as possible. The method below provides **high consistency** in your snapshot but it will completely freeze the snapshotted filesystem. It's fairly depend on what you want to backup. I see 2 situations:

* Volume snapshot
* VM snapshot

Both are extremely different:

* Volume snapshots, if they store static data, you can easily decide to stop writting into it.
* VM snapshots, you have to freeze the entire filesystem (`/`), so the system will see his writes delayed.

XFS tools provide several facilities to manage your filesystem, first download it:

```bash
$ sudo apt-get install xfsprogs -y
```

Log into your instance and first run the `sync` command. The sync writes dirty buffer (buffered block that have been modified but not written yet to the disk block) to disk, it's not enough to have a consistent filesystem but it's a beginning.

```bash
$ sync
```

Then we are going to use `xfs_freeze`, the tool is provided by XFS but it works at the VFS (Virtual Filesystem) level, so that's fine. I successfully used it under `ext4` filesystem. It should work with every filesystems since they all rely on this layer to perform I/O operations. Let's say I want to backup a Cinder volume. These are persistents, the next step is to make them consistent. I assume here that the device is detected as `/dev/vdb` and mounted on `/mnt`. The `xfs_freeze` is really easy to use and accepts 2 arguments:

* `-f`: freeze the filesystem
* `-u`: thaw the filesystem

Ideally you will perform something like this:


```bash
$ sudo xfs_freeze -f /mnt
```

<span class="text_quote">W </span> Important: the filesystem **must be mounted** before running the command.

<br />

Yes the volume will hang out and every I/O operations will be stopped and any attempts will be delayed and performed as soon as the filesystem will be un freeze. All ongoing transactions in the filesystem are allowed to complete, new write  system  calls  are  halted,  other calls  which  modify  the filesystem are halted. Most importantly all dirty data, metadata, and log information are written to disk. Now you can perform your snapshot:

```
$ nova image-create mon-instance mon-snapshot
```

When the snapshot is done, you can thaw the filesystem with the following command:

```bash
$ sudo xfs_freeze -u /mnt
```

If you want to backup the root filesystem you probably want to do something like this.

```bash
$ sudo xfs_freeze -f / && sleep 30 && sudo xfs_freeze -u /
```

Here 30 seconds should be fine since we only need to freeze the filesystem while the `qemu-img` command is initiated.

<span class="text_quote">R </span>Note: if you don't use the one-liner, your prompt will also freeze...

<br />

> Hope it helps! There is a really interesting project called "ec2-consistent-snapshot". It does way more things than we need for OpenStack, but it may be an excellent resource. Unfortunalety I don't have any time in mind to play with an OpenStack portability. Are there any volunteers to grab some inspiration from this project and integrate it to OpenStack? Who said an option in the nova command CLI? Or a procedure within the snapshot method itself? Please have a look at the [official page](https://github.com/alestic/ec2-consistent-snapshot) of the project.
