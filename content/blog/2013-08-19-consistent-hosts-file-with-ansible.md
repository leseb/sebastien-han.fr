---
title: Consistent hosts file with Ansible
date: 2013-08-19 17:39:00
slug: consistent-hosts-file-with-ansible
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![Consistent hosts file with Ansible](/images/consistent-host-file-ansible.jpg)

One of the things, that I hate the most about an infrastructure is to have an inconsistent platform.
Obviously DNS runs but it could fail, and then it's always good to rely on your `/etc/hosts`.
However before this, it must be consistent.

<!--more-->

The template file:

    127.0.0.1   localhost   {{ ansible_hostname }}

    192.168.0.1     bla1.mydomain
    192.168.0.2     bla2.mydomain
    192.168.0.3     bla3.mydomain
    192.168.0.4     bla4.mydomain
    192.168.0.5     bla5.mydomain

The yaml file:

    ---
    - hosts: all

      tasks:
          - name: template test
            action: template src=templates/hosts.j2 dest=/etc/hosts

Run it:

```bash
$ ansible-playbook -i hosts_infra --user=leseb --sudo hosts.yml
```

<br />

> I hope consistency maniacs will like this ;-)

