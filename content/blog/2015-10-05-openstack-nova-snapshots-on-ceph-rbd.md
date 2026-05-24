---
title: OpenStack Nova snapshots on Ceph RBD
date: 2015-10-05 17:10:00
slug: openstack-nova-snapshots-on-ceph-rbd
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack Nova RBD ephemeral snapshots](/images/openstack-nova-rbd-ephemeral.jpg)

I have been waiting for this feature for more than a year and it is almost there!
This likely brings us one step toward diskless compute nodes.
This "under the hood" article will explain the mechanisms in place to perform fast and efficient Nova instance snapshots directly in Ceph.

<!--more-->

<br />

# I. Rationale

Here I am taking the assumption that both OpenStack Glance and OpenStack Nova are configured with Ceph.
So Glance stored its images as RBD block in Ceph and Nova boots root ephemeral disk in Ceph (using `libvirt_image_type=rbd` option in your `nova.conf`).

Currently while taking a snapshot of a Nova instance, the system will have to through several steps to upload that image into Glance.
First, the state of your virtual machine will change to pause, then `qemu-img` will be called to copy the content of the root ephemeral drive to the compute local filesystem.
Once Nova has a local copy it resumes the state of the virtual machine.
The snapshot taken is usually stored in `$instances_path/snapshots` before it gets uploaded into Glance image service.

So now, the image will get streamed from the compute node to Glance API endpoint and then uploaded into Ceph.

Given that Ceph is used everywhere, this process is extremely slow and inefficient.
It also brings to light some majors issues that might be really tricky to deal with while operating an OpenStack public cloud.
Basically, even if our instances live in Ceph we still need some local storage to be able to perform snapshots and store them locally on the hypervisor before upload to Glance.
It is a bit of a waste to have to allocate some space that is not being used all the time and we can not predict how often and for how long they will be.

Introducing Nova RBD snapshot.
The ideal is rather simple, seeing that we have Ceph already used by Nova and that RBD images have snapshot capabilities we thought why not use this functionality instead of this monstrous workflow?

And this is exactly what this [spec](https://review.openstack.org/#/c/188244/) and [patch](https://review.openstack.org/#/c/205282/) are about.
Let's dive into the implementation in the next section.

<br />

# II. Under the hood

An image is worth a thousand words.

![OpenStack Nova RBD ephemeral snapshots Howto](/images/nova-ephemeral-rbd-snapshot.png)

Hopefully the workflow in the image is clear enough so you have understood already the details :).
The implementation works with both clone images and flat RBD images.
As reminder, if your images have a RAW format in Glance, this will later result in a clone RBD image for your root ephemeral disk of your instance.
This clone will have a parent which is the Glance image.

In case, you do not use RAW images or do not expose image direct URLs you will get a flat RBD image.
So no matter the result the snapshots will work perfectly.


One more thing to note is that in case the RBD snapshot fails for some reason, we fallback to the default method (the one explained in the first section).
So just in case, it is nice if you could allocate a tiny partition (depending on the size of your environment `tmpfs` could potentially do the job).
For this, you can explicitly set a directory where to save Nova snapshots.

     [libvirt]
     snapshots_directory = /fail/safe/path

That's all.

<br />

> I haven't mentioned it in the article but new implementation will likely land in Mitaka. Hopefully you are as exited as I am about this upcoming feature!
