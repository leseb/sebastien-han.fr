---
title: "OpenStack Glance: allow user to create public images"
date: 2014-10-30 10:38:00
slug: openstack-glance-allow-user-to-create-public-images
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack Glance: allow user to create public images](/images/glance-public-image.jpg)

Since Juno, it is not possible anymore for an user to create public images nor make one of his images/snapshots public.
Even though this new Glance policy is a good initiative, let's see how we can get the old behavior back.

<!--more-->

As an administrator, edit the file `/etc/glance/policy.json` and change the following line:

    "publicize_image": "role:admin",

With:

    "publicize_image": "",

Then restart glance:

```bash
$ sudo glance-control all restart
```

<br />

> That's all!
