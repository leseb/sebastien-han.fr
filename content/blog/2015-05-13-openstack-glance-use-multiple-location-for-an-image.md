---
title: "OpenStack Glance: use multiple location for an image"
date: 2015-05-13 00:01:00
slug: openstack-glance-use-multiple-location-for-an-image
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack Glance: use multiple location for an image](/images/openstack-glance-image-multiple-location.jpg)

This feature is pretty old (introduced in the Havana cycle if I remember correctly), I just never got the chance to play with it.
However I believe this feature could benefit to many users.
Let's see how we can get the best of it.

<!--more-->

Edit your `glance-api.conf` with:

    [DEFAULT]
    show_multiple_locations = True
    enable_v2_api = True
    location_strategy = location_order

Then restart `glance-api`.

At this point you should see the location of the image:

```bash
$ glance --os-image-api-version 2 image-show 90674766-dbaa-4a6e-a344-2a4116af9fab
+------------------+----------------------------------------------------------------------------------+
| Property         | Value                                                                            |
+------------------+----------------------------------------------------------------------------------+
| checksum         | 133eae9fb1c98f45894a4e60d8736619                                                 |
| container_format | bare                                                                             |
| created_at       | 2015-05-06T09:29:40Z                                                             |
| direct_url       | rbd://5de961fb-2368-4f77-8725-7b002732e214/images/90674766-dbaa-                 |
|                  | 4a6e-a344-2a4116af9fab/snap                                                      |
| disk_format      | qcow2                                                                            |
| id               | 90674766-dbaa-4a6e-a344-2a4116af9fab                                             |
| locations        | [{"url": "rbd://5de961fb-2368-4f77-8725-7b002732e214/images/90674766-dbaa-       |
|                  | 4a6e-a344-2a4116af9fab/snap", "metadata": {}}]                                   |
| min_disk         | 0                                                                                |
| min_ram          | 0                                                                                |
| name             | CirrOS-0.3.3                                                                     |
| owner            | 486ab7509bfd46c386d4a8353b80a08d                                                 |
| protected        | False                                                                            |
| size             | 13200896                                                                         |
| status           | active                                                                           |
| tags             | []                                                                               |
| updated_at       | 2015-05-06T09:29:41Z                                                             |
| virtual_size     | None                                                                             |
| visibility       | private                                                                          |
+------------------+----------------------------------------------------------------------------------+
```

As you can see this image is stored in Ceph RBD using the following URI: `rbd://5de961fb-2368-4f77-8725-7b002732e214/images/90674766-dbaa-4a6e-a344-2a4116af9fab/snap`.

Now let's try to add another location for this image.
Since the API call is not exposed in python-glanceclient, we need to use a regular API call.
For this, we can use `curl` and thus need to get a token:

```bash
$ keystone token-get
+-----------+----------------------------------+
|  Property |              Value               |
+-----------+----------------------------------+
|  expires  |       2015-05-06T14:22:16Z       |
|     id    | 2602709084d64417b7f3480fccfa1785 |
| tenant_id | 486ab7509bfd46c386d4a8353b80a08d |
|  user_id  | 0b78d6793b1c4305ad6e76fa232b5a74 |
+-----------+----------------------------------+
```

Add the image using `curl`:

```bash
$ curl -i -X PATCH -H 'Content-Type: application/openstack-images-v2.1-json-patch' \
-H "X-Auth-Token: 2602709084d64417b7f3480fccfa1785" \
http://192.168.0.60:9292/v2/images/90674766-dbaa-4a6e-a344-2a4116af9fab \
-d '[{"op": "add", "path": "/locations/-", "value": {"url": "rbd://5de961fb-2368-4f77-8725-7b002732e214/images/7bb0484c-cb6b-4700-88bb-0a18b8f3a8f5/snap", "metadata": {}}}]'

HTTP/1.1 200 OK
Content-Length: 955
Content-Type: application/json; charset=UTF-8
X-Openstack-Request-Id: req-req-29faba33-657e-4959-b508-fcffe8081d8f
Date: Wed, 06 May 2015 14:21:21 GMT

{"status": "active", "virtual_size": null, "name": "CirrOS-0.3.3", "tags": [], "container_format": "bare", "created_at": "2015-05-06T09:29:40Z", "size": 13200896, "disk_format": "qcow2", "updated_at": "2015-05-06T14:21:20Z", "visibility": "private", "locations": [{"url": "rbd://5de961fb-2368-4f77-8725-7b002732e214/images/90674766-dbaa-4a6e-a344-2a4116af9fab/snap", "metadata": {}}, {"url": "rbd://5de961fb-2368-4f77-8725-7b002732e214/images/7bb0484c-cb6b-4700-88bb-0a18b8f3a8f5/snap", "metadata": {}}], "self": "/v2/images/90674766-dbaa-4a6e-a344-2a4116af9fab", "min_disk": 0, "protected": false, "id": "90674766-dbaa-4a6e-a344-2a4116af9fab", "file": "/v2/images/90674766-dbaa-4a6e-a344-2a4116af9fab/file", "checksum": "133eae9fb1c98f45894a4e60d8736619", "owner": "486ab7509bfd46c386d4a8353b80a08d", "direct_url": "rbd://5de961fb-2368-4f77-8725-7b002732e214/images/90674766-dbaa-4a6e-a344
```

Check the image properties again:

```bash
$ glance --os-image-api-version 2 image-show 90674766-dbaa-4a6e-a344-2a4116af9fab
+------------------+----------------------------------------------------------------------------------+
| Property         | Value                                                                            |
+------------------+----------------------------------------------------------------------------------+
| checksum         | 133eae9fb1c98f45894a4e60d8736619                                                 |
| container_format | bare                                                                             |
| created_at       | 2015-05-06T09:29:40Z                                                             |
| direct_url       | rbd://5de961fb-2368-4f77-8725-7b002732e214/images/90674766-dbaa-                 |
|                  | 4a6e-a344-2a4116af9fab/snap                                                      |
| disk_format      | qcow2                                                                            |
| id               | 90674766-dbaa-4a6e-a344-2a4116af9fab                                             |
| locations        | [{"url": "rbd://5de961fb-2368-4f77-8725-7b002732e214/images/90674766-dbaa-       |
|                  | 4a6e-a344-2a4116af9fab/snap", "metadata": {}}, {"url":                           |
|                  | "rbd://5de961fb-2368-4f77-8725-7b002732e214/images/7bb0484c-cb6b-4700-88bb-      |
|                  | 0a18b8f3a8f5/snap", "metadata": {}}]                                             |
| min_disk         | 0                                                                                |
| min_ram          | 0                                                                                |
| name             | CirrOS-0.3.3                                                                     |
| owner            | 486ab7509bfd46c386d4a8353b80a08d                                                 |
| protected        | False                                                                            |
| size             | 13200896                                                                         |
| status           | active                                                                           |
| tags             | []                                                                               |
| updated_at       | 2015-05-06T14:21:20Z                                                             |
| virtual_size     | None                                                                             |
| visibility       | private                                                                          |
+------------------+----------------------------------------------------------------------------------+
```

Several other options:

* Delete a location: `-d '[{"op": "remove", "path": "/locations/1"}]'`
* Add to a specific index: `{"op": "add", "path": "/locations/2", "value": ... ...}`

<br />

> Et voilà !
