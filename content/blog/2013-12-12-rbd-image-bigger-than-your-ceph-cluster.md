---
title: RBD image bigger than your Ceph cluster
date: 2013-12-12 11:35:00
slug: rbd-image-bigger-than-your-ceph-cluster
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![RBD image bigger than your Ceph cluster](/images/gigantic-rbd-images.jpg)

Some experiment with gigantic overprovisioned RBD images.

<!--more-->

First, create a large image, let's 1 PB:

```bash
$ rbd create --size 1073741824 huge
$ rbd info huge
rbd image 'huge':
    size 1024 TB in 268435456 objects
    order 22 (4096 kB objects)
    block_name_prefix: rb.0.8a14.2ae8944a
    format: 1
```

Problems rise as soon as you attempt to delete the image.
Eventually try to remove it:

```bash
$ time rbd rm huge
Removing image: 100% complete...done.

real    1944m40.850s
user    475m37.192s
sys     475m51.184s
```

Keeping an of every exiting objects is terribly inefficient since this will kill our performance. The major downside with this technique is when shrinking or
deleting an image it must look for all objects above the shrink size.

In dumpling or later RBD can do this in parallel controlled by `--rbd-concurrent-management-ops` (undocumented option), which defaults to 10.

<br />

You still have another option, if you've never written to the image, you can just delete the `rbd_header` file.
You can find it by listing all the objects contained in the image.
Something like `rados -p <your-pool> ls | grep <block_name_prefix>` will do the trick.
After this, removing the RBD image will take a second.

```bash
$ rados -p rbd ls
huge.rbd
rbd_directory

$ rados -p rbd rm huge.rbd
$ time rbd rm huge
2013-12-10 09:35:44.168695 7f9c4a87d780 -1 librbd::ImageCtx: error finding header: (2) No such file or directory
Removing image: 100% complete...done.

real    0m0.024s
user    0m0.008s
sys     0m0.008s
```

