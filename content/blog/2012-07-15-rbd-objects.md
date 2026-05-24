---
title: RBD objects analysis
date: 2012-07-16 16:38:00
slug: rbd-objects
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![RBD objects](/images/object.png)

A little bit more about RBD objects...

<!--more-->


In Ceph, everything is stored as an abjects and every objects can be stripped to block device.

# I. Dive into

## I.1. RADOS and RBD correlation

We can't talk about RADOS without talking about object, so here the list of all my pools:

```bash
$ rados lspool
data
metadata
rbd
nova
images
```

Note that when you install Ceph, default pool are created:

* data
* metadata
* rbd

If you have followed my blog recently you should certainly have noticed that I currently use the combination of Openstack and Ceph. I'm running RBD as a Glance backend and also as a nova-volume backend. This is why I have 2 extra pools respectively named `nova` (for nova-volume) and `images` (for Glance).

Now let's dive into these objects. For the rest of this article we will work with the pool named `nova`. I only have 2 volumes in this pool:

```bash
$ rbd -p nova ls
volume-0000004b
volume-00000050
```

## I.2. Objects fine analysis

Each image is striped over power of 2 byte objects (ex: 256,512,768...) with a default size of 4MB. Thanks to this value the request time stays acceptable and the tiny size offers an honorable I/O size. We will work with the first volume: `volume-0000004b`, some information about it:

```bash
$ rbd -p nova info volume-0000004b
rbd image 'volume-0000004b':
	size 3072 MB in 768 objects
	order 22 (4096 KB objects)
	block_name_prefix: rb.0.e
	parent:  (pool -1)
```

This gives us some interesting information like the `block_name_prefix` which identify your image (via objects) accross the entire pool. This is a very useful information which makes research through all the objects easier. Moreover note that **images are sparse** and consequently objects. The current value shows us that the image is 3072 MB large in 768 objects but if you list the current number of object you **won't** see 768. The image takes up only as much actual disk space as the data contained within. A simple test can confirm that:

```bash
$ rados -p nova ls | grep ^rb.0.e | wc -l
409
```

As more as you fill up the image, the number of object will grow. At his maximum size the image will fit in 768 objects. 

If you list the content of a rados pool you will see a lot of objects, I volontary cut the output according to our test volume:

```bash
$ rados -p nova ls
rbd_info
rbd_directory
volume-0000004b.rbd
rb.0.e.0000000002e0
rb.0.e.0000000000aa
rb.0.e.00000000014b
...
...
```

Per pool basis, you can notice that you have an object called `rbd_directory` and only one. This object contains the list of all the pool's images. Let's verify this:

```bash
$ rados -p nova get rbd_directory rbd_directory.txt
2012-07-16 10:11:13.158540 7f1ccfdac780  0 wrote 54 byte payload to rbd_directory.txt

$ echo -e `cat rbd_directory.txt`
volume-0000004bvolume-00000050
```

As showed above, my nova pool contains 2 images. About the `rbd_info`, this one *should* contain the latest rbd image id, getting the object will result with a binary.

About all the `volume-*`, this is the name given by nova-volume, each object with the `.rbd` prefix constains the image metadata:

```bash
$ rados -p nova get volume-0000004b.rbd volume-0000004b.rbd.txt
2012-07-16 10:25:02.969560 7f9260b04780  0 wrote 146 byte payload to volume-0000004b.rbd.txt

$ cat volume-0000004b.rbd.txt
<<< Rados Block Device Image >>> rb.0.eRBD001.005??snapshot-00000007
```

In a more readable format:

	<<< Rados Block Device Image >>> 
	rb.0.e
	RBD
	001.005
	snapshot-00000007

Meaning:

* **<<< Rados Block Device Image >>>**, the header text
* **rb.0.e **: the `block_name_prefix` of the images
* **RBD**: the header signature
* **001.005**: the header version, same for every objects

<br />

> That was a little introduction about RBD object, I hope this can be useful for anyone who wants to understand the data structure in Ceph! ;-)
