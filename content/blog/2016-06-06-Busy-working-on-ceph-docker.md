---
title: "Busy working on ceph-docker :)"
date: 2016-06-06 20:10:38
slug: Busy-working-on-ceph-docker
draft: false
categories: ["containers"]
tags: ["containers", "ceph"]
---

![Title](/images/ceph-docker-news.jpg)

I have been having a hard time keeping up with all things happening at the office and the blog.
One of the main reason is that I actively resumed my work on [ceph-docker](https://github.com/ceph/ceph-docker), in this article I will explain some of the things I have been working on.

<!--more-->

Before I start, I would like to thank all the regular (and new) contributors to the project as most of my work was based on a common agreement we had.

## I. Rationale

I have been working on ceph-docker for almost a year.
For the recall, the project started from the original contributions of [Seán C. McCord](https://github.com/Ulexus).
A year ago we merged its initial repository into the Ceph namespace on Github.

We have always favoured Ubuntu as the base distribution for our images.
So at the time Ubuntu Trusty 14.04 was our main focus.
Along with a single distribution support we had to support several Ceph releases.
However as the project was growing we had contributions from companies like Red Hat.
It is clear the companies like Suse or Red Hat can't and won't support a docker container based on Ubuntu.
Neither should Canonical support containers based on Fedora for instance..

We initially had a couple of branches per Ceph releases like Hammer, Infernalis, Jewel and then master to host bleeding edge code.
It was hard to play back and forth and cherry picking commits from master to the different branches.
Things needed to stay separated too because of the `Dockerfile` files nature that don't allow us to do any conditions (like `if...else`).
This is also mostly because of the build system on the [Docker Hub](https://hub.docker.com/) where builds for an image means either git tags or branches.
It is all fine but since we have multiple Ceph versions and several distribution to support things are a real pain.

For all those reasons we had to come up with a new way to manage these things and also try to make everyone (our contributors and users) happy.


## II. Branch management

Introducing our new branch management system!
Since I'm not going to take all the credits, I would like to highlight that one of my colleague [Erwan Velu](https://github.com/ErwanAliasr1) came up with this wonderful idea.

If we take a little step back, and for those of you who are not familiar with our work in ceph-docker entirely.
We are only putting efforts on [ceph/base](https://github.com/ceph/ceph-docker/tree/build-master-jewel-ubuntu-14.04/base) and [ceph/daemon](https://github.com/ceph/ceph-docker/tree/build-master-jewel-ubuntu-14.04/daemon) Docker images.
Base contains the packages and daemon all the Ceph daemons.

The basic idea is to manage everything from the master branch, so we have several files in the base directory tree containing all the Ceph versions and their respective distribution support.
Every time someone wants to PR something it will end up in master.
After this, repository's owners (and later a CI) will execute a script that will:

* create branches like this: <type>-<branch>-<ceph-version>-<distro>, ie: `build-master-jewel-ubuntu-14.04`
* push each `Dockerfile` and `entrypoints` into their respective branch by simply copying it them to the root of the repository in `base`, `daemon`

This will later trigger a new build on the Docker Hub.
As soon as the next PR comes and gets merged the script will delete those branches and redo the operation above.

Our current `ceph-releases` looks like this:

    ceph-releases
    ├── hammer
    │   ├── centos
    │   │   └── 7
    │   │       ├── base
    │   │       ├── daemon
    │   │       └── demo
    │   └── ubuntu
    │       ├── 14.04
    │       │   ├── base
    │       │   ├── daemon
    │       │   └── demo
    │       └── 16.04
    │           ├── base
    │           ├── daemon
    │           └── demo
    ├── infernalis
    │   ├── centos
    │   │   └── 7
    │   │       ├── base
    │   │       ├── daemon
    │   │       └── demo
    │   └── ubuntu
    │       ├── 14.04
    │       │   ├── base
    │       │   ├── daemon
    │       │   └── demo
    │       └── 16.04
    │           ├── base
    │           ├── daemon
    │           └── demo
    └── jewel
        ├── centos
        │   └── 7
        │       ├── base
        │       ├── daemon
        │       └── demo
        ├── fedora
        │   └── 23
        │       ├── base
        │       ├── daemon
        │       └── demo
        └── ubuntu
            ├── 14.04
            │   ├── base
            │   ├── daemon
            │   └── demo
            └── 16.04
                ├── base
                ├── daemon
                └── demo

To reflect this tree and based on the description of the workflow, we have the following branches/tags:

    build-master-hammer-centos-7
    build-master-hammer-ubuntu-14.04
    build-master-hammer-ubuntu-16.04
    build-master-infernalis-centos-7
    build-master-infernalis-ubuntu-14.04
    build-master-infernalis-ubuntu-16.04
    build-master-jewel-centos-7
    build-master-jewel-fedora-23
    build-master-jewel-ubuntu-14.04
    build-master-jewel-ubuntu-16.04

All the images builds can be tracked at:

* [Builds for base image](https://hub.docker.com/r/ceph/base/builds/)
* [Builds for daemon image](https://hub.docker.com/r/ceph/daemon/builds/)
* [Builds for demo image](https://hub.docker.com/r/ceph/demo/builds/)

## III. Continuous integration

We did not have any CI until my recent work on [Travis](https://travis-ci.org/).
So yeah we basically spent a year testing everyone's patches on our own machines.
Sometime we did not and ended up with broken images.

We use Travis to run several tests on each pull request:

* we build both base and daemon images
* we run all the Ceph processes in a container based on the images we just built
* we execute a validation script at the end to make sure Ceph is healthy

For each PR, we try to detect which Ceph release is being impacted.
Since we can only produce a single CI build with Travis, ideally this change will only be on a single release and distro.
If we have multiple ceph release and distro, we can only test one, since we have to build base and daemon.
By default, we just pick up the first line that comes from the changes if Ubuntu is not find in those changes.

You can check the files in [travis-builds](https://github.com/ceph/ceph-docker/tree/master/travis-builds) to learn more about the entire process.

<br />

> With all of that I think we are all good to pursue our work and improve the next release of ceph-docker!
I would like to take the opportunity to thank one more time all our contributors for their time and efforts to make ceph-docker better than it is today!
