---
title: Take over an existing Ceph cluster with Ceph Ansible
date: 2016-05-02 20:00:55
slug: Take-over-an-existing-Ceph-cluster-with-Ceph-Ansible
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

![Take over an existing Ceph cluster with Ceph Ansible](/images/ceph-ansible-take-over-existing-cluster.png)

Ceph Ansible has tons of awesome capabilities, one of them is the possibility to plug on ane existing cluster that **was not** deployed with it.
In this article, I will go through the *take over* procedure.

<!--more-->

The procedure is rather simple.
If the cluster was deployed with the following project there won't be any issue:

* [Ceph Deploy](https://github.com/ceph/ceph-deploy)
* [Puppet Ceph](https://github.com/ceph/puppet-ceph)
* [Chef Ceph](https://github.com/ceph/ceph-chef)
* Any other deployment tool that relies on [ceph-disk](http://docs.ceph.com/docs/hammer/man/8/ceph-disk/)

The procedure comes as fellow:

1. Install Ansible and add your monitors and osds hosts in it. For more detailed information you can read the [Ceph Ansible Wiki](https://github.com/ceph/ceph-ansible/wiki)
2. Set  `generate_fsid: false` in `group_vars`
3. Get your current cluster fsid with `ceph fsid` and set `cluster_fsid` accordingly in `group_vars`
4. Run the playbook called: `take-over-existing-cluster.yml` like this `ansible-playbook take-over-existing-cluster.yml`.
5. Eventually run Ceph Ansible to validate everything by doing: `ansible-playbook site.yml`.

> Now we can enjoy the power of Ceph Ansible :)
