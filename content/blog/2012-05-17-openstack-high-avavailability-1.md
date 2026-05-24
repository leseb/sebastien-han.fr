---
title: OpenStack High Availability 1/??
date: 2012-05-17 13:37:00
slug: openstack-high-avavailability-1
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack HA?](/images/openstack-ha.png)

First article of a long serie to build an highly available OpenStack platform. This one is more a state of art about the OpenStack HA.

<!--more-->

The main idea is to build a clustered cloud. A clustered cloud? This can be really useful particulary if you don't have a lot of servers at your disposal. It's really important to keep the KISS principle. A clustered cloud is just an infrastructure based on a cloud operating system (like OpenStack) which uses a clustered management software such as Pacemaker and a replication layer like DRBD. Pacemaker and corosync are 2 amazing solution for building cluster. Pacemaker is a cluster management and Corosync manages the communication layer. 

#I. Nova components

Bringing high-availability to the nova componentis is not an easy task. Specially because some of them are really critical.

* nova-api
* nova-scheduler
* nova-consoleauth
* nova-cert

Since there is currently no resource agent available I thought about started with LSB agent and maybe writing a resource agent later.

There is three remaining components:

* nova-compute: at the moment the main idea is to setup at least 2 compute node and use the live migration. It's not high-availability. Since the cloud is design for failure, simply trust this mechanism.
* nova-network: idealy hosted on the same node as the nova-compute service.
* nova-volume: see the table below

<h2>nova-volume</h2><link rel="stylesheet" href="http://www.compareninja.com/template/skins/Classic/skin.css" type="text/css">
<div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="cat title" style="width: 11%; "></td><td class="title" style="width: 11%; "><div class="">Object storage</div></td><td class="title" style="width: 11%; "><div class="">Block storage</div></td><td class="title" style="width: 11%; "><div class="">POSIX filesystem</div></td><td class="title" style="width: 11%; "><div class="">HA</div></td><td class="title" style="width: 11%; "><div class="">Scale-in</div></td><td class="title" style="width: 11%; "><div class="">Scale-out</div></td><td class="title" style="width: 11%; "><div class="">OpenStack driver</div></td><td class="title" style="width: 11%; "><div class="">Production ready</div></td></tr><tr class="second"><td class="cat" style="width: 11%; "><div class="">Local LVM</div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 11%; "><div class="">Nexenta</div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="partial"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="partial"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td></tr><tr class="second"><td class="cat" style="width: 11%; "><div class="">NFS</div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="partial"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="partial"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 11%; "><div class="">SAN</div></td><td style="width: 11%; "><div class="partial"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="partial"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td></tr><tr class="second"><td class="cat" style="width: 11%; "><div class="">Sheepdog</div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 11%; "><div class="">Swift</div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td></tr><tr class="second"><td class="cat" style="width: 11%; "><div class="">Ceph</div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="partial"></div></td></tr><tr><td class="cat" style="width: 11%; "><div class="">GlusterFS</div></td><td style="width: 11%; "><div class="no"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td><td style="width: 11%; "><div class="yes"></div></td></tr></tbody></table></div>

<br />

#II. Identity service: Keystone

The company hastexo provides a resource agent compatible pacemaker for [Keystone](https://github.com/madkiss/keystone/blob/ha/tools/ocf/keystone).

#III. Dashboard

The Hoziron dashboard is based on the Django framework and natively hosted on Apache. Pacemaker provides a resource agent for apache. 

#II. Glance

First recommandation here is to setup a 2 nodes pacemaker cluster active/passive with the resource agent available. Thoses ra are provided by [hastexo](https://www.hastexo.com/), many thanks.

* [glance-api](https://github.com/madkiss/glance/blob/ha/tools/ocf/glance-api)
* [glance-registry](https://github.com/madkiss/glance/blob/ha/tools/ocf/glance-registry)

I didn't try them yet, but soon enough!

#III. Queues

RabbitMQ offers a native active/active built-in clustering system which is really easy to setup. For more information take a look to the [rabbitmq article](http://www.rabbitmq.com/clustering.html). I will realease an article about the rabbitmq HA soon. I already test it on bare-metal.

#IV. Databases

I'm a pretty big fan of the Galera replicator. It's also supported by Percona, I'm using it for most of my setups. I think Galera is currently the best master-master replication solution. Check my [previous article about it](http://www.sebastien-han.fr/blog/2012/04/01/mysql-multi-master-replication-with-galera/)

<br /> 

I think it's a good way to start!
