---
title: Ceph cli output analysis
date: 2012-08-31 01:55:00
slug: ceph-cli-output-analysis
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph cli output analysis](/images/ceph-cli.jpg)

Brief analysis of the `ceph -s` command :)

<!--more-->

# I. Ceph in action!

If you are running a Ceph cluster you are certainly aware of the `ceph -s` command, which provides useful information about the state of your Ceph cluster. Let's describe his output line by line:

```bash
$ ceph -s
   health HEALTH_OK
   monmap e1: 3 mons at {0=172.17.1.4:6789/0,1=172.17.1.5:6789/0,2=172.17.1.7:6789/0}, election epoch 44, quorum 0,1,2 0,1,2
   osdmap e455: 3 osds: 3 up, 3 in
   pgmap v498444: 592 pgs: 592 active+clean; 33513 MB data, 54010 MB used, 136 GB / 199 GB avail
   mdsmap e39: 0/0/1 up
```

## I.1. Health

Health state:

    health HEALTH_OK

Several state are available with this format: `HEALTH_WARN MESSAGE`. As I can remember you can get these messages:

* osds are down
* nearfull osds
* full osds

Come with these message the state of the PGs, the PGs `stale`.

## I.2. monmap

Monitors

    monmap e1: 3 mons at {0=172.17.1.4:6789/0,1=172.17.1.5:6789/0,2=172.17.1.7:6789/0}, election epoch 44, quorum 0,1,2 0,1,2

Line description:

* Number of monitor
* IP address of every monitors and listenned port
* The map version: epoch
* Quorum status

For further information about the quorum you can use the following command:

```bash
$ ceph quorum_status
{ "election_epoch": 22,
  "quorum": [
        0,
        1,
        2],
  "monmap": { "epoch": 1,
      "fsid": "d1b8d687-0d00-40d5-aa14-8734fc1e4c58",
      "modified": "2012-08-08 18:04:24.572191",
      "created": "2012-08-08 18:04:24.572191",
      "mons": [
            { "rank": 0,
              "name": "1",
              "addr": "172.17.1.6:6789\/0"},
            { "rank": 1,
              "name": "2",
              "addr": "172.17.1.7:6789\/0"},
            { "rank": 2,
              "name": "0",
              "addr": "172.17.1.12:6789\/0"}]}}
```

## I.3. osdmap

OSDs map 

    osdmap e455: 3 osds: 3 up, 3 in

Line description:

* Version of the map
* Number of OSDs
* OSDs status:
    * up: online and reacheable
    * in: devices are included in the crush map


## I.4. pgmap

Placement group map:

    pgmap v498444: 592 pgs: 592 active+clean;

Line description:

* **pgmap**: placement group map
* **v498444**: map version
* **592 pgs**: number of placement group
* **active+clean**: state of these pgs.
  * active: retrievable
  * clean: number of replica is ok

End of the line, data description:

* **33513 MB data**: raw data stored
* **54010 MB used**: real used space, take a replica size into account. Roughly if you see 20G in `data`, you should see a little bit less than 40G in `used`. The `used` description is more or less (`data`x replica_count) - journals_size_combined.
* **136 GB / 199 GB avail**: (total_raw_space) - (`used` space)


## I.5. mdsmap

Metadata server's map

    mdsmap e39: 0/0/1 up

This output isn't really surpising since I don't run any MDS daemon. This line describe:

* Version of the mdsmap
* Number of MDS server up

<br />

>Hope this little analysis will help your understanding of the ceph output

