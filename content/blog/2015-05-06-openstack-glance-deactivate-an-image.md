---
title: "OpenStack Glance: deactivate an image"
date: 2015-05-06 00:12:00
slug: openstack-glance-deactivate-an-image
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack Glance: deactivate an image](/images/openstack-glance-deactivate-image.jpg)

Kilo has been released last week.
This blog post is the first of a series that will demonstrate some nifty new features.

Managing cloud images life cycle is a real pain for public cloud providers.
Since users have the ability to import their own images they can potentially introduce vulnerabilities with them.
Thus the cloud operators should be able to deactivate (temporary) an image to inspect it.
Later operators can reactivate it or just remove it if they believe the image is a threat for the cloud environment.

Another use case, as well is for cloud image updates, while performing the update of an image the operator might want to hide it from all the users.
Then when the update is complete he can reactivate the image so the users can boot virtual machines from it.

<!--more-->

<br />

Unfortunately this functionality is not implemented in python-glanceclient yet, so to use it you will have to perform regular API calls.
For this matter, you can simply use `curl`.

For testing purpose, I only have one image:

```bash
$ glance image-list
+--------------------------------------+--------------+-------------+------------------+----------+--------+
| ID                                   | Name         | Disk Format | Container Format | Size     | Status |
+--------------------------------------+--------------+-------------+------------------+----------+--------+
| 1e5ecd6e-e6d2-4071-87bc-528bdd25691a | CirrOS-0.3.3 | raw         | bare             | 13200896 | active |
+--------------------------------------+--------------+-------------+------------------+----------+--------+
```

In order to authenticate, we have to get a token first:

```bash
$ keystone token-get
+-----------+----------------------------------+
|  Property |              Value               |
+-----------+----------------------------------+
|  expires  |       2015-05-03T23:36:32Z       |
|     id    | 67e4249295d043e0a471e34e81e478c2 |
| tenant_id | 2867001b589c4ec59e9198a771563d0f |
|  user_id  | e6fdace504c34e0e9cfe9ccff2cb7c4a |
+-----------+----------------------------------+
```

Then we use it while deactivating the image:

```bash
$ curl -X POST -H 'X-Auth-Token: 67e4249295d043e0a471e34e81e478c2' http://192.168.0.60:9292/v2/images/1e5ecd6e-e6d2-4071-87bc-528bdd25691a/actions/deactivate
```

Now, let's check the status of our image with the admin user:

```bash
$ glance image-list
+--------------------------------------+--------------+-------------+------------------+----------+-------------+
| ID                                   | Name         | Disk Format | Container Format | Size     | Status      |
+--------------------------------------+--------------+-------------+------------------+----------+-------------+
| 1e5ecd6e-e6d2-4071-87bc-528bdd25691a | CirrOS-0.3.3 | raw         | bare             | 13200896 | deactivated |
+--------------------------------------+--------------+-------------+------------------+----------+-------------+
```

Normal users will not see the image at all.

To reactivate the image, simply run:

```bash
$ curl -X POST -H 'X-Auth-Token: 67e4249295d043e0a471e34e81e478c2' http://192.168.0.60:9292/v2/images/1e5ecd6e-e6d2-4071-87bc-528bdd25691a/actions/reactivate

$ glance image-list
+--------------------------------------+--------------+-------------+------------------+----------+--------+
| ID                                   | Name         | Disk Format | Container Format | Size     | Status |
+--------------------------------------+--------------+-------------+------------------+----------+--------+
| 1e5ecd6e-e6d2-4071-87bc-528bdd25691a | CirrOS-0.3.3 | raw         | bare             | 13200896 | active |
+--------------------------------------+--------------+-------------+------------------+----------+--------+
```

<br />

> Obviously, this feature can be controlled through Glance policies.
If you want to delegate this to certain cloud administor role you can specify it in the `/etc/glance/policy.json` file.
As always, I hope this article was useful for you!
