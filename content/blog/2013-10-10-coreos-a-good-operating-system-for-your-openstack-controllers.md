---
title: CoreOS, a good operating system for your OpenStack controllers
date: 2013-10-10 11:33:00
slug: coreos-a-good-operating-system-for-your-openstack-controllers
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![CoreOS, a good operating system for your OpenStack controllers](/images/coreos-openstack-controller.png)

During this article, I am going to explain why I believe that CoreOS is an excellent operation system for your OpenStack controllers.

<!--more-->

Since I already introduced CoreOS in the [previous article](http://www.sebastien-han.fr/blog/2013/09/03/first-glimpse-at-coreos), I will assume that you are already familiar with the basics.

<br />

>**Before we start I would like to warn everyone that currently CoreOS is in Alpha and consequently it's not production ready.
Then, I would not recommend you to put it in production.**

<br />

# I. Why would you do this?

## I.1. CoreOS

CoreOS only cares about applications and simply ships a based and robust Operating system.
What I really like about CoreOS is that it ensures a strong consistency between all the servers.
Thanks to the read-only file system, packages installed are statics and you only get their updates with the upgrade engine.
The real goodness is that no one will log on the server and install crap in it.
From an operational perspective, this is crucial.

<br />

## I.2. Docker

The main goal is to isolate every single OpenStack APIs process into a container and then expose it through the CoreOS node.
For this purpose, Docker is an excellent candidate.
In the end, you'll get one docker container per OpenStack service.

Why is it so good?

Simply because with Docker everything can be versionised.
Versions are always good, because they provide a single checkpoint of your infrastructure.
Checkpoints that you can replay if needed.
As a developer, you might also want to ensure the cross capability of your application on severals deployments.
Then, you can test your code against several versions of OpenStack APIs.
Moreover, this can be done within your organisation since Docker offers the possibility to use a [private registry](http://blog.docker.io/2013/07/how-to-use-your-own-registry/).

<br />

# II. Example with Keystone

**Assuming you already have a Database server running.**

See below a simple example for the identity service Keystone.

Dockerfile:

    FROM    ubuntu:latest
    MAINTAINER Sebastien Han <han.sebastien@gmail.com>
    
    # Repo and packages
    RUN echo deb http://archive.ubuntu.com/ubuntu precise universe | tee -a /etc/apt/sources.list
    RUN echo deb http://archive.ubuntu.com/ubuntu precise-updates universe | tee -a /etc/apt/sources.list
    RUN apt-get update
    RUN apt-get install -y --force-yes ubuntu-cloud-keyring
    RUN echo deb http://ubuntu-cloud.archive.canonical.com/ubuntu precise-updates/grizzly main | tee -a /etc/apt/sources.list.d/grizzly.list
    RUN apt-get update
    
    # Keystone packages
    RUN apt-get install -y --force-yes python-mysqldb vim-tiny keystone python-keystone

Build the image

```bash
$ sudo docker build -t leseb/openstack-keystone .
...
...
...
ldconfig deferred processing now taking place
 ---> f3d8965a83fe
 Successfully built f3d8965a83fe
```

Log into the image:

```bash
$ sudo docker run -i -t -h="keystone" leseb/openstack-keystone /bin/bash
root@keystone:/# 
```

Edit /etc/keystone/keystone.conf:

    [DEFAULT]
    admin_token = password
    debug = True
    verbose = True

    [sql]
    connection = mysql://keystone:password@localhost/keystone

Initialise the database:

```bash
root@keystone:/# keystone-manage db_sync
```

Log out from the image and commit it:

```bash
$ sudo docker ps -a | tail -n +2
bbdb675d6b81        leseb/openstack-keystone:latest          /bin/bash              2 minutes ago       Exit 0
...
...
$ sudo docker commit bbdb675d6b81 leseb/openstack-keystone
```

Eventually run it:

```bash
$ sudo docker run -d -p 35357:35357 -p 5000:5000 -h="keystone" leseb/openstack-keystone keystone-all
307d30277f18

$ sudo docker ps
ID                  IMAGE                                 COMMAND                CREATED             STATUS              PORTS
307d30277f18        leseb/openstack-keystone:latest   keystone-all           17 seconds ago      Up 16 seconds       35357->35357, 5000->5000
```

For any other Openstack service:

* Simply modify the last line of the file with the Openstack service that you want.
* Log into the image (/bin/bash stuff)
* Configure the API
* Commit the new image
* Run the final container

<br />

> Enjoy!
