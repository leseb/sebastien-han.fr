---
title: "Quick update Ceph: from Argonaut to Cuttlefish"
date: 2013-11-28 00:01:00
slug: quick-update-ceph-from-argonaut-to-cuttlefish
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Quick update Ceph: from Argonaut to Cuttlefish](/images/ceph-argonaut-to-cuttlefish.jpg)

Memory leaks disappeared and CPU load dramatically reduced. Yay!

<!--more-->

<br />

The upgrade started during the **week 39**.

![Before and after upgrade](/images/ceph-upgrade-load.png)

<br />

The first graph shows the amount of RAM used before and after the Ceph upgrade.
As you might know, they were numerous memory leaks in Argonaut and the picture clearly demonstrates that.
It's obvious that the upgrade solved them.

The second graph shows the CPU usage by the Ceph OSDs.
Once again, the upgrade improved the general CPU utilisation.

<br />

> Significant improvements!
