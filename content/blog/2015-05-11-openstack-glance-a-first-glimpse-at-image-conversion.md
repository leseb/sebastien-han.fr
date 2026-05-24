---
title: "OpenStack Glance: a first glimpse at image conversion"
date: 2015-05-11 01:23:00
slug: openstack-glance-a-first-glimpse-at-image-conversion
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack Glance: a first glimpse at image conversion](/images/openstack-glance-image-conversion.jpg)

Following my best Kilo's additions selection, today I will be introducing the Glance image conversion.
This feature was discussed at the last OpenStack summit in Paris, you can access the [etherpad discussion](https://etherpad.openstack.org/p/kilo-glance-image-conversion).
Before you get all excited, let me tell you first that the patch introduced during this Kilo cycle is the first of a series.
So do not get disappointed if it does not fit your needs yet (and it probably won't...).
Now if you are still inclined reading the article let's jump in!

<!--more-->

## Problem description

While using certain storage backend to store your images some of them have preferred properties.
For example, with Ceph we strongly recommend to use RAW image format.
This helps us taking advantage of Ceph features such as CoW (Copy on Write) cloning for both virtual machine disks and cinder volumes (when doing boot from volume).

However we can not really force user to only upload RAW images and this multiple reasons:

* Users do not care they simply have a bunch of small QCOW2 images (generally under 5GB, and 5 is already big I guess) that they want to run on the cloud
* Operators should not redirect their infrastructure issues to the end users
* RAW images are really big 2O to 50GB is pretty common and not everyone has the time nor the bandwidth

For all those reasons, we have to implement a mechanism inside Glance that will transparently convert the images from a given format to a desired one.
Ideally this will be configuration option in glance-api where we specify which format we want.

<br />

## Setup

Fist, edit your `/etc/glance/glance-api.conf` file with:

    [task]
    task_executor = taskflow
    work_dir=/tmp

    [taskflow_executor]
    engine_mode = serial
    max_workers = 10
    conversion_format=raw

As you already understood `conversion_format` controls the desired conversion format.
For the complete list of the conversion format, it depends of your `qemu-utils` version.
Generally conversion formats are:

* QCOW2
* RAW
* QED
* VDI
* VHD
* VMDK

That is all you need for the setup.
Don't forget to restart your `glance-api` server.

To trigger a conversion, you will have to use a Glance task from taskflow.
Currently the only way for the Glance task to fetch the image is to setup an HTTP server where you will store your images.
Whatever server will work, on my setup I simply used a simple Python HTTP server.
If you use the default Glance filesystem backend, this will be easier to integrate into your image workflow.

<br />

## Try it out!

Since this implementation relies on taskflow, you will have to create a task to trigger the conversion and use the version 2 of the Glance API:

```bash
$ glance --os-image-api-version 2 task-create \
--type import \
--input '{"import_from_format": "qcow2", "import_from": "http://127.0.0.1:8000/cirros-0.3.3-x86_64-disk.img", "image_properties": {"name": "CirrOS-0.3.3-RAW", "disk_format": "qcow2", "container_format": "bare"}}'
+------------+----------------------------------------------------------------------------------+
| Property   | Value                                                                            |
+------------+----------------------------------------------------------------------------------+
| created_at | 2015-05-07T09:19:03Z                                                             |
| id         | c47f5eed-c5db-4237-9d1f-5a15c7ee6780                                             |
| input      | {"image_properties": {"container_format": "bare", "disk_format": "qcow2",        |
|            | "name": "CirrOS-0.3.3-RAW"}, "import_from_format": "qcow2", "import_from":       |
|            | "http://127.0.0.1:8000/cirros-0.3.3-x86_64-disk.img"}                            |
| message    |                                                                                  |
| owner      | 486ab7509bfd46c386d4a8353b80a08d                                                 |
| result     | None                                                                             |
| status     | pending                                                                          |
| type       | import                                                                           |
| updated_at | 2015-05-07T09:19:03Z                                                             |
+------------+----------------------------------------------------------------------------------+

$ glance image-list
+--------------------------------------+------------------+-------------+------------------+----------+--------+
| ID                                   | Name             | Disk Format | Container Format | Size     | Status |
+--------------------------------------+------------------+-------------+------------------+----------+--------+
| 90674766-dbaa-4a6e-a344-2a4116af9fab | CirrOS-0.3.3     | qcow2       | bare             | 13200896 | active |
| 57bca246-e57b-4572-8825-d44a9b899a19 | CirrOS-0.3.3-RAW | qcow2       | bare             |          | active |
+--------------------------------------+------------------+-------------+------------------+----------+--------+
```

<br />

## Issues and Caveats

What is happening under the hood:

* Glance downloads the image under the directory specified by `work_dir` (in our case it is /tmp).
* Convert the image to the desire format
* Upload it into the default store


Issues and caveats of this first implementation:

* Import method only supports HTTP
* **the imported image gets uploaded and not the converted image**: yes this is not really usable
* Image locations are not exposed thus while deleting the image only the database record is 
* Images are not deleted in the storage pool after deletion
* Properties are not always honoured (disk_format for example)


Several patches are on their way and aim to address the issues mentioned above:

* The [first one](https://review.openstack.org/#/c/181024/) has already been merged.
* The [second one](https://review.openstack.org/#/c/181024/) has already been merged too and fixes the image location issues.

<br />

## Further development

As mentioned, this a first implementation and we are planning to go further during the Liberty cycle.
Let me share how do I envision this and how I expect this conversion to work.
First and obvious thing for, the operator should not have to do any manual actions to convert any image.
Thus when a user uploads a new image, this image should transparently and automatically be converted.
This conversion should be as smarter as it can and should be able to support multiple location format such as http, file, swift, RBD and so forth.
For special backends with nice capabilities such as Ceph RBD, the taskflow process should be able to use an RBD URI and perform the conversion directly within Ceph.
Not sure if other backends support this, so for the ones that don't the image should get a local copy on the Glance server, do the conversion and re-upload it to the final destination backend.

Now, let's assume that the conversion is complete and the image uploaded.
What do we do of the user's original image, well we must keep it because the client might request it later using image-download.
So if the image was a QCOW2 and we converted it in RAW, we don't really want to send back 50GB to the user.
To avoid this, I have been thinking of using the multiple image location functionality.
This means that we can set several locations to a given image.
In this scenario, we could use the converted image as principal location and the original image as a second one.
A special metadata can be applied to each of them as well, thus we can treat both images differently depending on their metadata.
One other thing that could be done on the original image is to deactivate it so it will be hidden.

The tricky part is, since that we use taskflow to perform the conversion this will happen on the background.
This implies that once the user uploads the image it will appear as active but a conversion will be happening on the background.
So if the user tries to boot an instance from this image this might be tricky if the conversion is not complete.
At the moment, I am not really sure how to solve this, unless we wait until the conversion + upload is done, then we can set the active state to the image.

**Once again, this is how I see things and it is definitely not set in stone. The above paragraph only reflects my own opinions. This is something that I will push during the next OpenStack summit in Vancouver.**

<br />

> We all agree that this is just the early stage of this implementation. It will hopefully be completed during the current cycle and releaase for Liberty. Special thanks to my colleague [Flavio Percoco](http://www.flaper87.com) who implemented this first version and helped me with the setup.
