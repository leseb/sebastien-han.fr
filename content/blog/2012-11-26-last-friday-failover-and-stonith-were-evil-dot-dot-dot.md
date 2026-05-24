---
title: Last friday failover and Stonith were evil...
date: 2012-11-26 19:10:00
slug: last-friday-failover-and-stonith-were-evil-dot-dot-dot
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

![Last friday failover and Stonith were evil..](/images/pacemaker-evil.jpg)


Friday, end of the week, almost week-end, almost time to enjoy the warm weather of my hometown and yet...

<!--more-->

# I. Story

As I said in the introduction, we were friday and ready to go back in France for a weekend. But something went **wrong**... friday... of course... First we noticed that one of the server was down, hum? I *** this server got fenced, but why? I logged to the server and first check the available space, I always do. This how I discovered that `/` was full. But how in hell? I checked for the biggest file and saw something like:

    -rw-r--r--  1 root  root  1.6G Nov 26 15:57 rmtab

What? But rmtab is in `/var` and it has his own partition. For an unknown reason, at the next reboot the system hasn't been able to mount every partition and then put everything on `/`.

How everything collapsed?

The exportfs has been restarted one more time but for this kind of incident, once is once too often:

* Pacemaker attemped to restarted the exportfs resource
* The resource failed to stop because a function `backup_rmtab` was called
* This took ages and raised the timeout value in the configuration
* The node has been fenced
* The resource migrated and started on the other node
* The function `restore_rmtab` was called and from the shared storage restored all the content of the `rmtab` (~1.6G) in `/var/lib/nfs/rmtab`
* The other node went full (`/var` at least)
* Eventually got fenced by the other chaotic node
* Over and over again until I disabled Stonith

Hopefully, a quick search on Google and the linux-ha ML led me to the solution.

# II. Origin

Say thank you to the exportfs Pacemaker resource agent from the Official Ubuntu 12.04 repository! The rmtab contains the list of all the filesystems currently being mounted by remote machines. When a filesystem is unmounted by a remote machine, the line in the rmtab is just commented out, not deleted. `rmtab` is used by rpc.mountd. This file needs to be synchronized to ensure a smooth failover and client reconnection. An entry look like this, when the filesystem is mounted:

    10.100.20.13:/mnt/exportfs:0x00000001

When the filesystem is unmounted:

    10.100.20.13:/mnt/exportfs:0x00000002

Pacemaker backups (by default) the `rmtab` in the root of the mount point with the following format `<mount point>/.rmtab`.` This could be modified via the `rmbackup` primitive paramater but always needs to be on the shared export, otherwise the mecanism introduced by the RA doesn't make sense anymore. Since I already exposed who messed up everything, let's analyse the content of both functions.

Exportfs backup function from Official Ubuntu 12.04 repository:

```bash
backup_rmtab() {
    local rmtab_backup
    if [ ${OCF_RESKEY_rmtab_backup} != "none" ]; then
        rmtab_backup="${OCF_RESKEY_directory}/${OCF_RESKEY_rmtab_backup}"
        grep ":${OCF_RESKEY_directory}:" /var/lib/nfs/rmtab > ${rmtab_backup}
    fi
}
```

Exportfs restore function from Official Ubuntu 12.04 repository:

```bash
restore_rmtab() {
    local rmtab_backup
    if [ ${OCF_RESKEY_rmtab_backup} != "none" ]; then
        rmtab_backup="${OCF_RESKEY_directory}/${OCF_RESKEY_rmtab_backup}"
        if [ -r ${rmtab_backup} ]; then
            cat  ${rmtab_backup} >> /var/lib/nfs/rmtab
            ocf_log debug "Restored `wc -l ${rmtab_backup}` rmtab entries from ${rmtab_backup}."
        else
            ocf_log warn "rmtab backup ${rmtab_backup} not found or not readable."
        fi
    fi
}
```

As you can the see the problem is in the `restore_rmtab` function. It copies the content stored on the shared storage (the backup) in `/var/lib/nfs/rmtab`.

The upstream version of the RA (available on github) prevents the `rmtab` to grow infinitely by the `sort -u` command.

```bash
restore_rmtab() {
    local rmtab_backup
    if [ ${OCF_RESKEY_rmtab_backup} != "none" ]; then
    rmtab_backup="${OCF_RESKEY_directory}/${OCF_RESKEY_rmtab_backup}"
    if [ -r ${rmtab_backup} ]; then
        local tmpf=`mktemp`
        sort -u ${rmtab_backup} /var/lib/nfs/rmtab > $tmpf &&
        install -o root -m 644 $tmpf /var/lib/nfs/rmtab
        rm -f $tmpf
        ocf_log debug "Restored `wc -l ${rmtab_backup}` rmtab entries from ${rmtab_backup}."
    else
        ocf_log warn "rmtab backup ${rmtab_backup} not found or not readable."
    fi
    fi
}
```

Thanks to added piece of code, we don't experience this issue anymore.

# III. Problem in action

Simple pacemaker setup:

    ============
    Last updated: Mon Nov 26 21:43:28 2012
    Last change: Mon Nov 26 15:37:25 2012 via cibadmin on c2-nfs-01
    Stack: openais
    Current DC: c2-nfs-01 - partition with quorum
    Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
    2 Nodes configured, 2 expected votes
    3 Resources configured.
    ============

    Online: [ c2-nfs-01 c2-nfs-02 ]

     Resource Group: g_exportfs
         p_vip_exportfs (ocf::heartbeat:IPaddr2):   Started c2-nfs-01
         p_fs_exportfs  (ocf::heartbeat:Filesystem):    Started c2-nfs-01
         p_export   (ocf::heartbeat:exportfs):  Started c2-nfs-01


And then one client that mount the NFS share.
It was fairly easy to reproduce the problem and to see the grep action and the `>>` action from the `restore_`rmtab` function:

```bash
$ sudo cat /var/lib/nfs/rmtab
10.100.20.13:/mnt/exportfs:0x00000001
$ sudo crm resource restart g_exportfs
INFO: ordering g_exportfs to stop
waiting for stop to finish . done
INFO: ordering g_exportfs to start
$ sudo cat /var/lib/nfs/rmtab
10.100.20.13:/mnt/exportfs:0x00000001
10.100.20.13:/mnt/exportfs:0x00000001
$ sudo crm resource restart g_exportfs
INFO: ordering g_exportfs to stop
waiting for stop to finish . done
INFO: ordering g_exportfs to start
$ sudo cat /var/lib/nfs/rmtab
10.100.20.13:/mnt/exportfs:0x00000001
10.100.20.13:/mnt/exportfs:0x00000001
10.100.20.13:/mnt/exportfs:0x00000001
10.100.20.13:/mnt/exportfs:0x00000001
$ sudo for i in `seq 40`; do crm resource restart g_exportfs ; done
…
…
…
...
INFO: ordering g_exportfs to stop
waiting for stop to finish . done
INFO: ordering g_exportfs to start
INFO: ordering g_exportfs to stop
waiting for stop to finish .............^CCtrl-C, leaving
INFO: ordering g_exportfs to stop
^CCtrl-C, leaving
$ sudo cat /var/lib/nfs/rmtab | wc -l
33554432
$ sudo du -h /var/lib/nfs/rmtab 
1.2G    /var/lib/nfs/rmtab
```

I had to stop the process because my `/var` was almost full. At the end, around 30 times restart the resource and got 1.2G file.

Upgrade the exportfs RA:

```bash
$ sudo wget https://raw.github.com/ClusterLabs/resource-agents/master/heartbeat/exportfs
--2012-11-26 15:29:34--  https://raw.github.com/ClusterLabs/resource-agents/master/heartbeat/exportfs
Resolving raw.github.com (raw.github.com)... 207.97.227.243
Connecting to raw.github.com (raw.github.com)|207.97.227.243|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 10400 (10K) [text/plain]
Saving to: `exportfs'

100%[============================================================================>] 10,400      --.-K/s   in 0s      

2012-11-26 15:29:34 (289 MB/s) - `exportfs' saved [10400/10400]

$ sudo chmod +x exportfs 
$ sudo mv exportfs /usr/lib/ocf/resource.d/heartbeat/exportfs 
$ sudo crm resource start g_exportfs
$ sudo du -h /var/lib/nfs/rmtab 
4.0K    /var/lib/nfs/rmtab
```

It took 4 seconds to cleanup all the redundant entries in `/var/lib/nfs/rmtab`.

<br />

<span class="text_quote">K </span> Useful links:

* [Commit that fixed the issue](https://github.com/ClusterLabs/resource-agents/commit/bbc90e9de8636609842fb01219e8d9c789d8a623)
* [Reported ML discussion](http://www.gossamer-threads.com/lists/linuxha/users/78585)
* [Upstream Resource Agent](https://github.com/ClusterLabs/resource-agents/blob/master/heartbeat/exportfs)

<br />

> It almost looked like Friday 13...
