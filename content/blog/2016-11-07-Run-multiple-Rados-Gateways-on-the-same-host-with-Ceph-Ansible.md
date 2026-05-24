---
title: Run multiple Rados Gateways on the same host with Ceph Ansible
date: 2016-11-07 18:29:47
slug: Run-multiple-Rados-Gateways-on-the-same-host-with-Ceph-Ansible
draft: false
categories: ["ansible"]
tags: ["ansible", "ceph"]
---

![Run multiple Rados Gateways on the same host with Ceph Ansible](/images/ceph-multi-rgw-same-host.jpg)

Quick how-to with Ceph Ansible to run multiple Ceph Rados Gateways on the same machine.

<!--more-->

For this, we have a dedicated playbook that allows you to allow run the Rados gateway piece.
To run simply fill the following variables:

* `radosgw_civetweb_bind_ip`: the IP rgw should be listening on
* `radosgw_civetweb_port`: use a different port for each rgw
* `ansible_hostname`: name of the rgw

And then run:

```
$ ansible-playbook rgw-standalone.yml \
--extra-vars '{"radosgw_civetweb_bind_ip":"0.0.0.0","radosgw_civetweb_port":"7480","ansible_hostname":"node-test"}'

$ ansible-playbook rgw-standalone.yml  \
--extra-vars '{"radosgw_civetweb_bind_ip":"0.0.0.0","radosgw_civetweb_port":"8090","ansible_hostname":"node-test2"}'
```

<br />

> I'm mister meeseeks! Look at me!
