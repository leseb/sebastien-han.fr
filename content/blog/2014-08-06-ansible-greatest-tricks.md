---
title: "Ansible greatest trick: iterate over a set of host"
date: 2014-08-06 00:11:00
slug: ansible-greatest-tricks
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

![Ansible greatest trick](/images/ansible-iterate-over-host.jpg)

While running a playbook on a host you can request some information about other nodes.

<!--more-->

The task will look like this:

```
- name: build account ring
  command: swift-ring-builder account.builder add z1-\{\{ hostvars[item]['ansible_' + iface].ipv4.address }}:6002/sdb1 100
  with_items: groups.storages
```


Please note that I had to escape the `{` with a `\` so you can actually see it. Remove it from your task.

The above task is extremely useful since it allows me to retrieve the IP address on a specific network card (the one referred in the `iface` variable) of a group of hosts.
Basically I am executing the `swift-ring-builder` command where I register a couple of nodes.
Here the hosts are called `storages`, thus somewhere on my `host` file I have a [storages] section that defines several machines.

<br />

> Ansible Magic! This [start at thing](http://docs.ansible.com/playbooks_startnstep.html?utm_content=buffera4202&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer) is pretty neat too!
