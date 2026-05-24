---
title: OpenStack Heat and Ceilometer got their dashboard panel
date: 2013-09-06 22:54:00
slug: openstack-heat-and-ceilometer-got-their-dashboard-panel
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

The Havana milestone release of the Horizon dashboard brought an absolutely wonderful panel for Heat, the orchestration service and Ceilometer, the metering service.
Quick preview before the Havana's official release.

<!--more-->

<br />

# I. Heat

Grab a simple [Wordpress template](https://raw.github.com/openstack/heat-templates/master/cfn/F17/WordPress_Single_Instance.template):

Create your stack:

![Heat create stack](/images/horizon-heat-stack-create.jpg)

Describe it:

![Heat describe stack](/images/horizon-heat-stack-description.jpg)

Topology animation. The first time I clicked on the button and saw this animation, I was really impressed. It's really fancy, smooth and you can move the whole thing by dragging one item and move with your mouse.
Pretty funny :D.

![Heat stack topology](/images/horizon-stack-topology.jpg)

Stack overview:

![Heat stack overview](/images/horizon-stack-overview.jpg)

Stack Resources:

![Heat stack resources](/images/horizon-stack-resources.jpg)

Stack events:

![Heat stack events](/images/horizon-stack-events.jpg)

<br />

# II. Ceilometer

**Note: admin panel only**

Disk usage:

![Ceilometer Disk Usage](/images/horizon-ceilometer-disk.jpg)

Network usage:

![Ceilometer Network Usage](/images/horizon-ceilometer-network.jpg)

Graph:

![Ceilometer Graph](/images/horizon-ceilometer-graph.jpg)

<br />

# III. Minor enhancements

## III.1 Instance boot

The instance boot panel also got a fresh new look while trying to boot from different soruces:

![Instance boot](/images/horizon-instance-boot.jpg)

## III.2. Network topology

The network topology panel also had a nice re-looking.
We now have 2 differents views (small and normal), depends on the number of instances you run.
Another cool thing is that you can directly interact with the VM from the network topology panel and for instance request a termination or the console.

![Network topology](/images/horizon-network-topology.jpg)

<br />

> Thanks for reading!

