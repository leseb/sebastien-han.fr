---
title: Failover active/passive on NFS using Pacemaker and DRBD
date: 2012-04-30 19:19:00
slug: failover-active-passive-on-nfs-using-pacemaker-and-drbd
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

Bring High-availability to your NFS server!

<!--more-->

# I. Hosts and IPs

    127.0.0.1	localhost

    # Pacemaker
    10.0.0.1	ha-node-01
    10.0.0.2	ha-node-02

For high-availability purpose, I recommend using bond interface, it's always better to have a dedicated link between the nodes. Don't forget the `ifenslave` package for setting up the bonding. Something of the parameter below can be specifics to a setup. Simply note that it's optinnal if you only want to try it with virtal machines.

    auto eth1
    iface eth1 inet manual
        bond-master ha
        bond-primary eth1 eth2
        pre-up		/sbin/ethtool -s $IFACE speed 1000 duplex full

    auto eth2
    iface eth2 inet manual
            bond-master ha
            bond-primary eth1 eth2
            pre-up          /sbin/ethtool -s $IFACE speed 1000 duplex full

    auto ha
    iface ha inet static
        address 10.0.0.1
        netmask 255.255.255.0
        mtu 9000
        bond-slaves none
            bond-mode balance-rr
        bond-miimon 100

Do the same setup for the second node.

# II. DRBD Setup

Create a logical volume. This volume will act as a DRBD device. Here I assume that you have a LVM based setup. I create a logical volume named `drbd` on my volume group `data`.

```bash
$ sudo lvcreate -L 10GB -n drbd data
```

And custom some LVM options `/etc/lvm/lvm.conf` for drbd:

    write_cache_state=0

```bash
$ sudo rm -rf /etc/lvm/cache/.cache
```

Check if the changes took effect:

```bash
$ sudo lvm dumpconfig | grep write_cache
    write_cache_state=0
```

**The following actions have to be done on each backend servers.**

Install DRBD and remove it from the boot sequence because pacemaker will manage it:

```bash
$ sudo aptitude install -y drbd8-utils
$ sudo update-rc.d -f drbd remove
```

The drbd global configuration file:

    global {
        usage-count yes;
        # minor-count dialog-refresh disable-ip-verification
    }
     
    common {
        protocol C;

        handlers {
        pri-on-incon-degr "/usr/lib/drbd/notify-pri-on-incon-degr.sh; /usr/lib/drbd/notify-emergency-reboot.sh; echo b > /proc/sysrq-trigger ; reboot -f";
        pri-lost-after-sb "/usr/lib/drbd/notify-pri-lost-after-sb.sh; /usr/lib/drbd/notify-emergency-reboot.sh; echo b > /proc/sysrq-trigger ; reboot -f";
        local-io-error "/usr/lib/drbd/notify-io-error.sh; /usr/lib/drbd/notify-emergency-shutdown.sh; echo o > /proc/sysrq-trigger ; halt -f";
        out-of-sync "/usr/lib/drbd/notify-out-of-sync.sh root";

        ## avoid split-brain in pacemaker cluster
        fence-peer "/usr/lib/drbd/crm-fence-peer.sh";
        split-brain "/usr/lib/drbd/notify-split-brain.sh root";
        after-resync-target "/usr/lib/drbd/crm-unfence-peer.sh";
        }

        startup {
            # reduce the timeouts when booting
        degr-wfc-timeout 1;
        wfc-timeout 1;
        }

        disk {
        on-io-error   detach;

        #avoid split-brain in pacemaker cluster
        fencing resource-only;
        }

        net {
        ## DRBD recovery policy
        after-sb-0pri discard-zero-changes;
        after-sb-1pri discard-secondary;
        after-sb-2pri disconnect;
        }

        syncer {
        rate 300M;
        al-extents 257;
        }
    }

The drbd resource configuration file (`/etc/drbd.d/r0.res`):

    resource r0 {
     
    on ha-node-01 {
        device /dev/drbd0;
        disk /dev/data/drbd;
        address 10.0.0.1:7788;
        meta-disk internal;
      }
     
    on ha-node-02 {
        device /dev/drbd0;
        disk /dev/data/drbd;
        address 10.0.0.2:7788;
        meta-disk internal;
      }
    }

Before continuing check your configuration file:

```bash
$ sudo drbdadm dump all
```

Now wipe off the device:

```bash
$ sudo dd if=/dev/zero of=/dev/data/drbd bs=1M count=128
```

Still on both servers launch, initialize the meta data and start the resource:

```bash
$ sudo drbdadm -- --ignore-sanity-checks create-md r0
$ sudo drbdadm up r0
```

**On the ha-node-01 run:**

```bash
$ sudo drbdadm -- --overwrite-data-of-peer primary r0
```

Watch the synchronisation state:

```bash
$ sudo watch -n1 cat /proc/drbd
version: 8.3.7 (api:88/proto:86-91)
srcversion: EE47D8BF18AC166BE219757
1: cs:SyncSource ro:Primary/Secondary ds:UpToDate/Inconsistent C r----
    ns:3096 nr:0 dw:0 dr:3296 al:0 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:b oos:2082692
    [>....................] sync'ed:  0.4% (2082692/2085788)K
```

**Also on the ha-node-01 run:**

```bash
$ sudo mkfs.ext3 /dev/drbd0
```

Mount your resource and check his state:

```bash
$ sudo mount /dev/drbd0 /mnt/data/
$ sudo drbd-overview 
  0:r0  Connected Primary/Secondary UpToDate/UpToDate C r---- /mnt/data/ ext3 9.9G 151M 9.2G 2%
```

# III. NFS server setup

Install NFS tools:

```bash
$ sudo aptitude install nfs-kernel-server
```

Fill the /etc/exports file with:

    /mnt/data/     10.0.0.0/8(rw,async,no_root_squash,no_subtree_check)

**Always on ha-node-01**

Change in `/etc/default/nfs-kernel-server` this value:

    NEED_SVCGSSD=no

For rpc communication in `/etc/default/portmap` change this

    #OPTIONS="-i 127.0.0.1"

Now export the share:

```bash
$ sudo exportfs -ra
```

# IV. Pacemaker setup

Install pacemaker:

```bash
$ sudo aptitude install pacemaker
```

Configure corosync:

```bash
$ sudo sed -i s/START=no/START=yes/ /etc/default/corosync
$ sudo corosync-keygen
Corosync Cluster Engine Authentication key generator.
Gathering 1024 bits for key from /dev/random.
Press keys on your keyboard to generate entropy.
Press keys on your keyboard to generate entropy (bits = 64).
Press keys on your keyboard to generate entropy (bits = 128).
Press keys on your keyboard to generate entropy (bits = 192).
Press keys on your keyboard to generate entropy (bits = 256).
Press keys on your keyboard to generate entropy (bits = 320).
Press keys on your keyboard to generate entropy (bits = 384).
Press keys on your keyboard to generate entropy (bits = 448).
Press keys on your keyboard to generate entropy (bits = 512).
Press keys on your keyboard to generate entropy (bits = 576).
Press keys on your keyboard to generate entropy (bits = 648).
Press keys on your keyboard to generate entropy (bits = 712).
Press keys on your keyboard to generate entropy (bits = 784).
Press keys on your keyboard to generate entropy (bits = 848).
Press keys on your keyboard to generate entropy (bits = 920).
Press keys on your keyboard to generate entropy (bits = 984).
Writing corosync key to /etc/corosync/authkey.
```

For the corosync-keygen you will need an entropy generator, run this from an other shell:

```bash
$ while /bin/true; do dd if=/dev/urandom of=/tmp/100 bs=1024 count=100000; for i in {1..10}; do cp /tmp/100 /tmp/tmp_$i_$RANDOM; done; rm -f /tmp/tmp_* /tmp/100; done
```

Copy the generated key and the corosync configuration on the other backend node:

```bash
$ sudo scp /etc/corosync/authkey /etc/corosync/corosync.conf root@ha-node-02:/etc/corosync/
```

Modify this section in `/etc/corosync/corosync.conf`

    interface {
        # The following values need to be set based on your environment 
        ringnumber: 0
        bindnetaddr: 10.0.0.0 
        mcastaddr: 226.94.1.1
        mcastport: 5405
    }

Run the corosync daemon on both backend node:

```bash
$ sudo service corosync start
```

At the first you should see something like this:

```bash
$ sudo crm_mon -1
============
Last updated: Thu Apr 19 15:54:33 2012
Stack: openais 
Current DC: ha-node-01 - partition with quorum
Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
2 Nodes configured, 2 expected votes
0 Resources configured.
============
 
Online: [ ha-node-01 ha-node-02 ]
```

## IV.1. Setup the failover

* Virtual IP address
* NFS ra
* DRBD ra

Use this configuration for pacemaker:

```bash
$ sudo crm configure show
node ha-node-01 \
    attributes standby="off"
node ha-node-02 \
    attributes standby="off"
primitive drbd_nfs ocf:linbit:drbd \
    params drbd_resource="r0" \
    op monitor interval="15s"
primitive fs_nfs ocf:heartbeat:Filesystem \
params device="/dev/drbd0" directory="/mnt/data/" fstype="ext3" options="noatime,nodiratime" \
    op start interval="0" timeout="60" \
    op stop interval="0" timeout="120"
primitive nfs lsb:nfs-kernel-server \
    op monitor interval="5s"
primitive vip ocf:heartbeat:IPaddr2 \
    params ip="10.0.0.100" nic="ha" \
    op monitor interval="5s"
group HA vip fs_nfs nfs \
    meta target-role="Started"
ms ms_drbd_nfs drbd_nfs \
    meta master-max="1" master-node-max="1" clone-max="2" clone-node-max="1" notify="true"
colocation ms-drbd-nfs-with-ha inf: ms_drbd_nfs:Master HA
order fs-nfs-before-nfs inf: fs_nfs:start nfs:start
order ip-before-ms-drbd-nfs inf: vip:start ms_drbd_nfs:promote
order ms-drbd-nfs-before-fs-nfs inf: ms_drbd_nfs:promote fs_nfs:start
property $id="cib-bootstrap-options" \
    dc-version="1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b" \
    cluster-infrastructure="openais" \
    expected-quorum-votes="2" \
    stonith-enabled="false" \
    no-quorum-policy="ignore"
rsc_defaults $id="rsc-options" \
resource-stickiness="100"
```

**Warning**: be sure that the name of your nfs init script is `nfs-kernel-server` or modify this line:

    lsb:nfs-kernel-server

With the correct script name.

At the end, you should see this:

```bash
$ sudo crm_mon -1
============
Last updated: Thu Apr 19 15:54:33 2012
Stack: openais 
Current DC: ha-node-01 - partition with quorum
Version: 1.0.9-74392a28b7f31d7ddc86689598bd23114f58978b
2 Nodes configured, 2 expected votes
2 Resources configured.
============
 
Online: [ ha-node-01 ha-node-02 ]
 
Resource Group: HA
     vip	(ocf::heartbeat:IPaddr2):	Started ha-node-01
     fs_nfs	(ocf::heartbeat:Filesystem):	Started ha-node-01
     nfs	(lsb:nfs-kernel-server):	Started ha-node-01
Master/Slave Set: ms_drbd_nfs
     Masters: [ ha-node-01 ]
     Slaves: [ ha-node-02 ]
```

Enjoy ;)
