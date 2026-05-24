---
title: Ansible module to create CRUSH hierarchy
date: 2018-03-15 22:32:25
slug: Ansible-module-to-create-CRUSH-hierarchy
draft: false
categories: ["ansible"]
tags: ["ansible", "ceph"]
---

![Title](/images/ansible-ceph-crush-module.jpg)

First post of the year after a long time with no article, three months...
I know it has been a while, I wish I had more time to do more blogging.
I have tons of draft articles that never made it through, I  need to make up for lost time.

So for this first post, let me introduce an Ansible I wrote for ceph-ansible: **ceph_crush**.

<!--more-->

## I. Rationale

ceph-ansible is feature-full, but we lack modules.
I've long thought that everything that can be done via a simple `command` task in Ansible does not deserve a module.
I was wrong.

Day 2 operations, as we call them, refers to consuming and giving access to the storage.
In the context of Ceph, this means several things:

* RGW Configuration
  * Users
  * Buckets
  * Bucket policies
  * S3 acls

* RBD
  * Create/delete/modify RBD images
  * Map them if kRBD

* Mon:
  * create pools
  * create user and keys

Of course, all of that can be handled by the main playbook, but people are unlikely going to re-run the entire playbook to do that.
What they want is a simple playbook via a simple interface to interact with the cluster.
They don't want to know anything about Ceph and its CLI, this only thing they care about is to finalize the task they were assigned too.

One the idea behind this is to unify the operational experience through a standard interface, which Ansible and language description, YAML.

## II. Ceph CRUSH module

This module, as its name state, allows you to create CRUSH hierarchy.
The creation is done by passing to each host of your inventory a dictionary containing a set of keys where each determines a CRUSH bucket location.
Here is an inventory example:

```
ceph-osd-0 osd_crush_location="{ 'root': 'mon-roottt', 'rack': 'mon-rackkkk', 'pod': 'monpod', 'host': 'ceph-osd-0' }"
```

The module is configured like this:

```
- name: configure crush hierarchy
  ceph_crush:
    cluster: "{{ cluster }}"
    location: "{{ hostvars[item]['osd_crush_location'] }}"
    containerized: "{{ docker_exec_cmd }}"
  with_items: "{{ groups[osd_group_name] }}"
```

The resulting CRUSH map will be following:

```
ID CLASS WEIGHT  TYPE NAME                STATUS REWEIGHT PRI-AFF
-5       0.09738 root mon-roottt
-4       0.09738     pod monpod
-3       0.09738         rack mon-rackkkk
-2       0.09738             host ceph-osd-0
```

The module takes care of the ordering for you so that you can declare the keys of `osd_crush_location` in any order.
The pre-requisites for the module to successfully run are the following:

* at least two buckets must be declared
* a 'host' bucket must be declared

That's it :).

<br />

> This module saves us from hundreds of complex Ansible lines. As I said, more modules are coming for daily operations so stay tuned!
We are planing on adding this module to Ansible core and we are aiming for 2.6.
