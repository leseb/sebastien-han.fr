---
title: Introducing ceph-deploy
date: 2012-10-02 22:53:00
slug: introducing-ceph-deploy
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Introducing ceph-deploy](/images/ceph-deploy.png)

It's been a while that I heard that `mkcephfs` was deprecated, but for the benefit of which tool? I have named `ceph-deploy`. The project is young and it's work in progress but at a reasonnable advancement. Let's get a first impression!

<!--more-->

So `ceph-deploy` acts as a replacement for the old `mkcephfs`. Does this mean that `mkcephfs` is dead? No of course but it will smoothly remove for `ceph-deploy`.

# I. Installation

First clone the github: (installing git may be necessary)

```bash
$ sudo apt-get install git unzip python-virtualenv -y
$ git clone https://github.com/ceph/ceph-deploy
Cloning into 'ceph-deploy'...
remote: Counting objects: 224, done.
remote: Compressing objects: 100% (81/81), done.
remote: Total 224 (delta 144), reused 216 (delta 136)
Receiving objects: 100% (224/224), 35.03 KiB, done.
Resolving deltas: 100% (144/144), done.
$ cd ceph-deploy/
```

Install pushy:

```bash
$ wget https://launchpad.net/pushy/0.5/0.5.1/+download/pushy-0.5.1.zip
$ unzip pushy-0.5.1.zip 
Archive:  pushy-0.5.1.zip
  inflating: pushy-0.5.1/setup.py    
  inflating: pushy-0.5.1/PKG-INFO    
  inflating: pushy-0.5.1/pushy/__init__.py  
  inflating: pushy-0.5.1/pushy/client.py  
  inflating: pushy-0.5.1/pushy/server.py  
  inflating: pushy-0.5.1/pushy/protocol/__init__.py  
  inflating: pushy-0.5.1/pushy/protocol/baseconnection.py  
  inflating: pushy-0.5.1/pushy/protocol/connection.py  
  inflating: pushy-0.5.1/pushy/protocol/message.py  
  inflating: pushy-0.5.1/pushy/protocol/proxy.py  
  inflating: pushy-0.5.1/pushy/transport/__init__.py  
  inflating: pushy-0.5.1/pushy/transport/daemon.py  
  inflating: pushy-0.5.1/pushy/transport/local.py  
  inflating: pushy-0.5.1/pushy/transport/ssh.py  
  inflating: pushy-0.5.1/pushy/transport/smb/__init__.py  
  inflating: pushy-0.5.1/pushy/transport/smb/impacket_transport.py  
  inflating: pushy-0.5.1/pushy/transport/smb/native.py  
  inflating: pushy-0.5.1/pushy/util/__init__.py  
  inflating: pushy-0.5.1/pushy/util/_logging.py  
  inflating: pushy-0.5.1/pushy/util/_zipwalk.py  
  inflating: pushy-0.5.1/pushy/util/askpass.py  
  inflating: pushy-0.5.1/pushy/util/clone_function.py  
  inflating: pushy-0.5.1/pushy/util/redirector.py  
$ cd pushy-0.5.1/
$ sudo python setup.py install
```

Verify that `pushy` has been well installed:

```python
$ python
Python 2.7.3 (default, Apr 20 2012, 22:39:59) 
[GCC 4.6.3] on linux2
Type "help", "copyright", "credits" or "license" for more information.
>>> import pushy
>>> 
``` 

Finally install ceph-deploy

```bash
$ ./bootstrap
...
...
...
$ ln -s `pwd`/ceph-deploy /usr/bin/ceph-deploy
```

Verify that everything works:

```bash
$ ceph-deploy --help
usage: ceph-deploy [-h] [-v] [--cluster NAME] COMMAND ...

Deploy Ceph

optional arguments:
  -h, --help      show this help message and exit
  -v, --verbose   be more verbose
  --cluster NAME  name of the cluster

commands:
  COMMAND         description
    new           Start deploying a new cluster, and write a CLUSTER.conf for
                  it.
    install       Install Ceph packages on remote hosts.
    mon           Deploy ceph monitor on remote hosts.
    osd           Deploy ceph osd on remote hosts.
    disk          Prepare a data disk on remote host.
```

<br />

# II. Ceph cluster in a minute!

## II.1. Install Ceph on a new server

In this example, I used two machines:

* ceph-deploy provisionning server
* one node

ceph-deploy will attempt to connection through ssh to the specified node. Be sure that you can SSH passwordless from your ceph-dpeloy server to every ceph node.

```bash
$ ceph-deploy install ceph-1
OK
```

The output is pretty explicit, a more verbose mode can be enabled with the `-v` option.


I don't want to go too deeper into the installation process since the [Github documentation](https://github.com/ceph/ceph-deploy) is complete.


<br />

>This was a really short introduction to the successor of `mkcephfs`. Some features are missing but it's work in progress. At the end, Tommi Virtanen has made an amazing job and the tool appears to be very promising.
