---
title: Differences between active-active and active-passive cluster
date: 2012-05-26 22:30:00
slug: differences-between-active-active-and-active-passive-cluster
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

Common thoughts and working of clustering forms. Pick up from the [Sybase HA documentation](http://infocenter.sybase.com/help/index.jsp?topic=/com.sybase.help.ase_15.0.ha_avail/html/ha_avail/ha_avail3.htm). Good reminder :-)

<!--more-->

# Active-active

* **Setup:**
Two Adaptive Servers are configured as companion servers, each with independent workloads. These companions run on the primary and secondary nodes, respectively, as individual servers until one fails over.

* **Failover:**
When fail over occurs, the secondary companion takes over the devices, client connections, and so on from the primary companion. The secondary companion services the failed-over clients, as well as any new clients, until the primary companion fails back and resumes its activities.

* **Failback:**
Failback is a planned event during which the primary companion takes back its devices and client connections from the secondary companion to resume its services.

* **Client connection failover:**
During failover, clients connect to the secondary companion to resubmit their uncommitted transactions. During failback, clients connect to the primary companion to resubmit their transactions. Clients with the failover property reestablish their connections automatically.

# Active-passive

* **Setup:**
A single Adaptive Server runs either on the primary node or on the secondary node. The Adaptive Server runs on the primary node before a fail over and the secondary node after fail over.

* **Failover:**
When a system fails over, the Adaptive Server and its associated resources are relocated to, and restarted on, the secondary node.

* **Failback:**
Failback is a planned fail over or relocation of the Adaptive Server and its resources to the primary node. Failback is not required, but can be done for administrative purposes.

* **Client connection failover:**
During failover and failback, clients connect to the same Adaptive Server to resubmit uncommitted transactions. Clients with the failover property reestablish their connections automatically.

