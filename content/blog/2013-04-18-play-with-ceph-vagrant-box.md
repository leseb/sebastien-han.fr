---
title: Play with Ceph - Vagrant Box
date: 2013-04-22 11:14:00
slug: play-with-ceph-vagrant-box
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Play with Ceph - Vagrant Box](/images/vagrant-logo.png)

Materials to start playing with Ceph. This Vagrant box contains a all-in-one Ceph installation.

<!--more-->

# I. Setup

First [Download](http://downloads.vagrantup.com/) and [Install](http://docs.vagrantup.com/v2/installation/index.html) Vagrant.

Download the Ceph box: [here](https://www.dropbox.com/s/hn28qgjn59nud6h/ceph-all-in-one.box). This box contains one virtual machine:

  * Ceph VM contains 2 OSDs (1 disk each), 1 MDS, 1 MON, 1 RGW. A modified CRUSH Map, it simply represents a full datacenter and applies a replica per OSD
  * VagrantFile for both VM client and ceph
  * Other include files

Download an extra VM for the client [here](http://dl.dropbox.com/u/1537815/precise64.box), note that Debian and Red Hat based system work perfectly, thus it's up to you:

  * Client: just an Ubuntu installation

Initialize the Ceph box:

```bash
$ wget https://www.dropbox.com/s/hn28qgjn59nud6h/ceph-all-in-one.box
...
...
$ vagrant box add big-ceph ceph-all-in-one.box
[vagrant] Downloading with Vagrant::Downloaders::File...
[vagrant] Copying box to temporary location...
[vagrant] Extracting box...
[vagrant] Verifying box...
[vagrant] Cleaning up downloaded box...
```

Initialize the Client box:

```bash
$ wget http://dl.dropbox.com/u/1537815/precise64.box
$ vagrant box add ubuntu-12.04.1 precise64.box
[vagrant] Downloading with Vagrant::Downloaders::File...
[vagrant] Copying box to temporary location...
[vagrant] Extracting box...
[vagrant] Verifying box...
[vagrant] Cleaning up downloaded box...
```

Check your boxes:

```bash
$ vagrant box list
ceph-all-in-one
ubuntu-12.04.1
```

Import all the files from the box:

```bash
$ mkdir setup
$ cp /Users/leseb/.vagrant.d/boxes/ceph-all-in-one/include/* setup/
$ mv setup/_Vagrantfile Vagrantfile
```

In order to make the setup easy, I assume that your working directory is `$HOME/ceph`. At the end, your tree directory looks like this:

    .
    ├── Vagrantfile
    ├── ceph-all-in-one.box
    ├── precise64.box
    └── setup
        ├── ceph.conf
        ├── ceph.sh
        └── keyring

<br />

# II. Start it!

Check the state of your virtual machines:

```bash
$ vagrant status
Current VM states:

client                   poweroff
ceph                     poweroff

This environment represents multiple VMs. The VMs are all listed
above with their current state. For more information about a specific
VM, run `vagrant status NAME`.
```

Eventually run them:

```bash
$ vagrant up ceph && vagrant up client
...
...
```

The next time, you'll run the client, run it this way to don't re-provision the machine:

```bash
$ vagrant up --no-provision client
```

Eventually SSH on your client:

```bash
$ vagrant ssh client
...

vagrant@ceph:~$ sudo ceph -s
   health HEALTH_OK
   monmap e3: 1 mons at {1=192.168.251.100:6790/0}, election epoch 1, quorum 0 1
   osdmap e179: 2 osds: 2 up, 2 in
    pgmap v724: 96 pgs: 96 active+clean; 9199 bytes data, 2071 MB used, 17906 MB / 19978 MB avail; 232B/s wr, 0op/s
   mdsmap e54: 1/1/1 up {0=0=up:active}

vagrant@ceph:~$ sudo ceph osd tree
# id  weight  type name up/down reweight
-1  2 root default
-4  2   datacenter dc
-5  2     room laroom
-6  2       row larow
-3  2         rack lerack
-2  2           host ceph
0 1             osd.0 up  1
1 1             osd.1 up  1
```

<br />

# III. Bonus upgrades

## III.1. Ceph upgrades

It's fairly easy to upgrade the box to last stable version Cuttlefish. For this simply edit `/etc/apt/sources.list.d/ceph.list/ceph.list` with the following:

    deb http://ceph.com/debian-cuttlefish/ precise main

Then run:

```bash
$ sudo apt-get update && apt-get install ceph
$ sudo service ceph restart
$ sudo ceph -v
ceph version 0.61 (237f3f1e8d8c3b85666529860285dcdffdeda4c5)
```

## III.2. Vagrant version 2

Thanks to freshteapot.

Vagrant file:

    Vagrant.configure("2") do |config|
     
      config.vm.define :ceph do |role|
        role.vm.box = "big-ceph"
        role.vm.network :private_network, ip: "192.168.251.100"
        role.vm.hostname = "ceph"
      end
     
      config.vm.define :client do |role|
        role.vm.box = "ubuntu1304"
        role.vm.hostname = "ceph-client"
        role.vm.provision :shell, :path => "setup/ceph.sh"
        role.vm.network :private_network, ip: "192.168.251.101"
      end
     
    end

Then run:

```bash
$ vagrant halt [vm-name]
$ vagrant up [vm-name]
```

<br />

<span class="text_quote">R </span>Note: if for some reasons you get a status were only 1/2 OSDs are up, just restart the mon. This should do the trick :-).

<br />

> I use this box everyday for all my test, it's quite handy to destroy and rebuild it within a minute. Build, destroy, build destroy, I think you got it! Hope it ;-)
