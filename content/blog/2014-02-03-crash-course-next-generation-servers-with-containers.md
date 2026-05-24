---
title: "Crash course: next generation servers with containers"
date: 2014-02-03 14:40:00
slug: crash-course-next-generation-servers-with-containers
draft: false
categories: ["containers"]
tags: ["containers"]
---

![Crash course: next generation servers with containers](/images/next-gen-serv-with-containers.jpg)

For more than a year, containers have become more and more popular especially thanks to rise of Docker.
Unfortunately the concept itself is not always clear for everyone.
It is important to understand the difference between LXC and Docker.
In this article, I will expose the different technologies available.

<!--more-->

<br />

# I. Hypervisor

![KVM Hypervisor](/images/hypervisor-kvm.png)

21st century, the virtualisation has been part of every datacenter solutions.
Back then, the virtualisation brought some significant and really advanced features that until then no one was expecting.
Running multiple operating system on a single machine, can you believe that?!
We all know what virtualisation is, so I am not gonna spend to much time on it.
I believe the picture spoke by itself.

What we have to keep in mind is that as soon as you use the virtualisation:

* The hypervisor emulates all the components of a server: USB, CPU, memory, block devices, ethernet, **everything**.
* When you boot a virtual machine (no matter the guest operation system) you run the entire operating system environment: init, kernel, processes, services etc etc.

<br />

# II. Container

![Containers](/images/container.png)

Compare to the virtualisation, the containers are way more lightweight.
When using the container technology, you share the host's Kernel and you don't need to emulate any device since you can take advantage of a Kernel feature called namespace.
However, the major disadvantage of the containers is that they can **only** run Linux.

Containers mainly rely on two technologies:

## II.1. Namespaces

Namespace is a Kernel feature that brings isolation at different levels of the system.
Each isolation level represents a specific resource.

We can list a certain number of namespaces:

1. PID: a very common one. It allows us to isolate a process PID behind a parent process. It is important to note that each PID namespace has its own init-like process (PID 1).
2. Network: this one provides an isolated network interface and a complete isolated traffic. A common technique that is used to route the traffic outside the namespace is to rely on a bridge. That is for example what Docker does, it setups a bridge and attach every namespace vnet to it.
3. Filesystem: this namespace supports multiple mountpoints. As always, these mountpoints can only be seen inside the namespace.
4. IPC: InterProcess Communication. I will let [Wikipedia](http://en.wikipedia.org/wiki/Inter-process_communication) describe it for me :).

<br />

## II.2. cgroup

cgroup does resource limiting and consumption accounting.
It allows you to restrict numerous metrics of a running Linux such as:

* cpu: general cpu cycles control
* cpuset: control which process can use which cpu
* blkio: block layer control, IOPS and bandwidth are managed from here
* memory: pages allocation, cache

And grab statistics from:

* cpuacct
* `perf_event`

Depending on your Linux distribution, usually cgroup sits under the sys virtual filesystem at `/sys/fs/cgroup`.

<br />

What we have to keep in mind is that as soon as you use the containers:

* Shared Kernel with the Host: thus only Linux distributions can be "containerized"
* Namespaces provide isolation (at several levels)
* cgroup does the accounting and resource limitations

<br />

# III. Application container

![Application container](/images/app-container.png)

The new revolution for hosting applications is definitely what we call "application container".
The father of this movement is [Docker](https://www.docker.io/).
Docker containers are one layer on top of the traditional LXC containers and help you to ship your applications.
The main idea is that you only run a single process (your application) within an application container.
The way you deploy these containers is straightforward, tools like Puppet and Ansible know how to orchestrate them.
Containers are lightweight compare to LXC because they only run a single process, a single INIT.
They focus on delivering reproducible setup by using a versioning mechanism, so you can easily tag new versions.
Apart from this, the guys from Docker introduced an easy to learn templating language to build containers (with the help of Docker files).

However, Docker is not the only project that relies on namespaces and cgroup.
In fact, the excellent [systemd](http://freedesktop.org/wiki/Software/systemd/) provides a nice mechanism to launch light-weight namespace containers.
It is called [nspawn](http://www.freedesktop.org/software/systemd/man/systemd-nspawn.html).
The adoption of systemd is still in heavy discussion on Debian and won't probably append in Ubuntu, although distributions like Fedora, OpenSUSE and Arch already adopted it as their default system manager.
Also note that [CoreOS](https://coreos.com/) heavily uses systemd, so it is a good distribution to play with systemd capabilities in addition to the native Docker support.

<br />

> I haven't dive deeper into each concept, actually namespaces and cgroup can be really complex. However, I truly hope that this article gave a clear vision of the different resource stacks available. They **all** have a right purpose. So **NO** virtualization is not dead nor **container**.
