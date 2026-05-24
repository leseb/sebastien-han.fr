---
title: Ansible module to manage CephX Keys
date: 2018-04-02 00:31:25
slug: Ansible-module-to-manage-CephX-Keys
draft: false
categories: ["ansible"]
tags: ["ansible", "ceph"]
---

![Title](/images/ceph-ansible-cephx-module.jpg)

Following our recent initiative on writing more Ceph modules for Ceph Ansible, I'd like to introduce one that I recently wrote: **ceph_key**.

<!--more-->

The module is pretty straightforward to use and will ease your day two operations for managing CephX keys. It has several capabilities such as:

* create: will create the key on the filesystem with the right permissions (support `mode`/`owner`) and will import in the Ceph (can be enabled/disabled) with the given capabilities
* update: will update the capabilities of a particular key
* delete: will delete the key from Ceph
* info: will get every information about a particular key
* list: will list all the available keys

The module also works on containerized Ceph clusters.

See the following examples:

```yaml
---
# This playbook is used to manage CephX Keys
# You will find examples below on how the module can be used on daily operations
#
# It currently runs on localhost

- hosts: localhost
  gather_facts: false
  vars:
    cluster: ceph
    keys_to_info:
      - client.admin
      - mds.0
    keys_to_delete:
      - client.leseb
      - client.leseb1
      - client.pythonnnn
    keys_to_create:
      - { name: client.pythonnnn, caps: { mon: "allow rwx", mds: "allow *" } , mode: "0600" }
      - { name: client.existpassss, caps: { mon: "allow r", osd: "allow *" } , mode: "0600" }
      - { name: client.path, caps: { mon: "allow r", osd: "allow *" } , mode: "0600" }

  tasks:
    - name: create ceph key(s) module
      ceph_key:
        name: "{{ item.name }}"
        state: present
        caps: "{{ item.caps }}"
        cluster: "{{ cluster }}"
        secret: "{{ item.key | default('') }}"
      with_items: "{{ keys_to_create }}"

    - name: update ceph key(s)
      ceph_key:
        name: "{{ item.name }}"
        state: update
        caps: "{{ item.caps }}"
        cluster: "{{ cluster }}"
      with_items: "{{ keys_to_create }}"

    - name: delete ceph key(s)
      ceph_key:
        name: "{{ item }}"
        state: absent
        cluster: "{{ cluster }}"
      with_items: "{{ keys_to_delete }}"

    - name: info ceph key(s)
      ceph_key:
        name: "{{ item }}"
        state: info
        cluster: "{{ cluster }}"
      register: key_info
      ignore_errors: true
      with_items: "{{ keys_to_info }}"

    - name: list ceph key(s)
      ceph_key:
        state: list
        cluster: "{{ cluster }}"
      register: list_keys
      ignore_errors: true
```

<br />

> The goal is to have all of our Ceph modules included by default in Ansible. Stay tuned, more modules to come!
