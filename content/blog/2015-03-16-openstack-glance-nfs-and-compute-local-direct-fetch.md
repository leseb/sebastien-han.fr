---
title: OpenStack Glance NFS and Compute local direct fetch
date: 2015-03-16 16:12:00
slug: openstack-glance-nfs-and-compute-local-direct-fetch
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack Glance NFS and Compute local direct fetch](/images/openstack-glance-nfs-compute-local-fetch.jpg)

This feature has been around for quite a while now, if I remember correctly it was introduced in the Grizzly release.
However, I never really got the chance to play around with it.
Let's assume that you use NFS to store Glance images, we know that the default booting mechanism implies to fetch the instance image from Glance to the Nova compute.
This is basically streaming the image which involves network throughput and makes the boot process longer.
OpenStack Nova can be configured to directly access Glance images from a local filesystem path.
This is ideal for our NFS scenario.

<!--more-->

The setup is a bit tricky, so first configure your `glance-api.conf` and apply the following flags:

    [DEFAULT]
    show_multiple_locations = True
    filesystem_store_metadata_file = /etc/glance/nfs.json

Create your `/etc/glance/nfs.json` file:

    {
        "id": "f5e1eee7-9160-493e-9b6f-d4b1c34eaa23",
        "mountpoint": "/srv/nfs/glance/"
    }

Make sure to restart both Glance API and registry.

Now, in your `nova.conf` on your compute nodes **only**, append the following values in the appropriate sections:

    [DEFAULT]
    ...
    ...
    allowed_direct_url_schemes = file
    ...
    ...

    [image_file_url]
    filesystems = nfs

    [image_file_url:nfs]
    id = f5e1eee7-9160-493e-9b6f-d4b1c34eaa23
    mountpoint = /srv/nfs/glance/

<br />

> During the boot sequence, Nova will issue a `cp` instead of fetching the Glance image through the network. Et voilà!
