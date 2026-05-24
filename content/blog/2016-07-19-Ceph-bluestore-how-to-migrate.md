---
title: Ceph bluestore, how to migrate?
date: 2016-07-19 10:12:14
slug: Ceph-bluestore-how-to-migrate
draft: true
categories: []
tags: []
---

![Title](/blog/images/image.png)

Hum, you don't?! :)

<!--more-->

The easy/lazy strategy is to just replace failed disks with bluestore
disks as they fail.  No extra work, but obviously it will take forever to
actually get a cluster fully converted.  Assume the customer isn't pushing
for that, this would happen by default anyway since we'll eventually
  switch the ceph-disk default to bluestore instead of filestore.

    In reality, I'm sure customers and users will be more than happy to pay
    the rebalancing cost to get the improved performance, and will ask how to
    best go about it.  We can't say we don't support it because (1) failover
    is core to the product and (2) all of this presupposes that bluestore is
    supported.  The only real reason not to do it is the performance impact
    from the rebalancing itself, and that's inevitably something the customer
    will make their own decisions about.  So I think we need to be prepared to
    field the question intelligently.

    There are a few main options:

     - Fail a disk/host, replace, rebuild. This is the fastest, cheapest, and
     easiest, but it drops the redundancy level by one replica or shard for the
     duration, so it's more risky.

      - Mark disk/host out, wait for rebalancing, replace, wait for rebalancing
      back.  This copies each disk's content twice.  Expensive, but also simple.

       - Host switcheroo.  Take an empty host, provision with new bluestore
       osds.  Do a CRUSH bucket switcheroo so that the new host gets an old
       hosts's bucket id and weight but new bluestore osds; the old host moves to
       a new bucket with the old osds and weight 0.  OSDs will still be "up" with
       the same id and data, but data will move exactly once into the new osds in
       the replacement host.  (We're just catering to the way CRUSH calculates
       the mapping internally.)  Repeat for each host, using the newly drained
       host for new bluestore OSDs to replace the next one.

       The last is the best I've come up with and would need a tool to facilitate
       the CRUSH updates.  Not too hard, though!

       My last thought is that as we make the transition from tech preview to
       fully supported, we may have a stage where we recommend customers
       reprovision only a 1-2 racks or hosts (whichever they replicate across) so
       that only one or two replicas is on bluestore initially.  This will give
       them some protection from the heterogeneity.  I think this only makes
       sense early on, though; once we decide we trust and support it we can't
       qualify that to the customer.


Also see: http://pad.ceph.com/p/osd-replacement
Also: https://github.com/ceph/ceph/pull/15072

> bla
