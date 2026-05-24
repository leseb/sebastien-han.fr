---
title: "Tip: Add a specific keypair to a flavor"
date: 2012-11-05 22:12:00
slug: tip-add-a-specific-keypair-to-a-flavor
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Add a specific keypair to a flavor](/images/openstack-key-flavor.jpg)

Folsom brought a lot of new features, however while playing with `nova-manage`, I came across a new option, option that I found very useful and that I'm about to share with you.

<!--more-->

Basically in Essex you had:

```bash
$ sudo nova-manage instance_type
/usr/bin/nova-manage category action [<args>]
Available actions for instance_type category:
    create
    delete
    list
```

Now in Folsom, you have:

```bash
$ sudo nova-manage instance_type
/usr/bin/nova-manage category action [<args>]
Available actions for instance_type category:
    create
    delete
    list
    set_key
    unset_key
```

And respectively you'll find the update in the nova command:

Essex version:

```bash
$ nova help| grep key
            [--region_name REGION_NAME] [--apikey APIKEY]
    keypair-add         Create a new key pair for use with instances
    keypair-delete      Delete keypair by its id
    keypair-list        Print a list of keypairs for a user
  --apikey APIKEY, --password APIKEY
```

Folsom version:

```bash
$ nova help | grep key
    flavor-key          Set or unset extra_spec for a flavor.
    keypair-add         Create a new key pair for use with instances
    keypair-delete      Delete keypair by its id
    keypair-list        Print a list of keypairs for a user
```

You will notice that this option **is not available** from the Horizon Dashboard.

This is my flavors:

```bash
$ sudo nova-manage instance_type list | grep tiny
tiny: Memory: 512MB, VCPUS: 1, Root: 0GB, Ephemeral: 0Gb, FlavorID: 1, Swap: 0MB, RXTX Factor: 1.0, public, ExtraSpecs {}
```

Now 

```bash
$ sudo nova-manage instance_type set_key --name=xlarge --key=admin
$ sudo nova-manage instance_type list | grep tiny
tiny: Memory: 512MB, VCPUS: 1, Root: 0GB, Ephemeral: 0Gb, FlavorID: 1, Swap: 0MB, RXTX Factor: 1.0, public, ExtraSpecs {u'admin': None}
```

Now try to boot up a new instance with this flavor from the dashboard and avoid the second tab (access & security).

<br />

> Enjoy ;-). Folsom is full of little surprises :D
