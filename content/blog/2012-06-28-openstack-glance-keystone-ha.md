---
title: "OpenStack: Glance and Keystone HA"
date: 2012-06-28 13:02:00
slug: openstack-glance-keystone-ha
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![HA Glance and Keystone](/images/keystone.png)

The purpose of this article is to achieve high-availability for some OpenStack components.

<!--more-->

# I. Prerequisites

The purpose of this article is neither to setup glance nor keystone. Thus, I leave to you the configuration of Keystone and Glance. I assume that you have a proper installation of Glance and Keystone on each node. Perform some test via the command line and make sure that you'r able to reach the content of your database etc... After this you need to prevent those services from running at boot. If you run Ubuntu Server it's really easy, you can use the `.override` file facility for this. For other Linux distros see tools like: `update-rc.d`,`insserv` or `chkconfig`.

```bash
$ sudo echo "manual" > /etc/init/glance-api.override
$ sudo echo "manual" > /etc/init/glance-registry.override
$ sudo echo "manual" > /etc/init/keystone.override
```

If you want to re-enable them, simply delete every `.override` files. Since that pacemaker will be the only one who manage them. Those resource agents are not part of the official Cluster Lab repo so you need to download them:

```bash
$ sudo mkdir /usr/lib/ocf/resource.d/openstack
$ cd /usr/lib/ocf/resource.d/openstack/
$ sudo wget https://raw.github.com/madkiss/glance/ha/tools/ocf/glance-api
$ sudo wget https://raw.github.com/madkiss/glance/ha/tools/ocf/glance-registry
$ sudo wget https://raw.github.com/leseb/keystone/ha/tools/ocf/keystone
$ sudo chmod +x *
```

You will notice that the keystone RA point to my personnal github. Indeed, there is an indentation error in the Keytone ra script, I tried multiple time with the default raw ans with proper indentation. You can try the one provided by Hastexo and if it doesn't work try mine :). I have a couple of pending pull requests:

* [pull1](https://github.com/madkiss/keystone/pull/1) 
* [pull2](https://github.com/madkiss/keystone/pull/2)

I'm waiting the approval from the hastexo guys :).

**Pull 1**. The `if ! check_binary` test seems badly indented. It's weird because the indentation is similar as the one proposed by the [OCF Resource Agent Developer’s Guide](http://www.linux-ha.org/doc/dev-guides/_testing_for_binaries_literal_have_binary_literal_and_literal_check_binary_literal.html). Actually this test is never performed and the function `keystone_monitor` returns `$OCF_SUCCESS`. Thus, Pacemaker believes that the resource is running. At least, keystone daemon is running but the database in not reachable from the keystone client binary. After this change, the RA works like a charm :)

Here the changes I made:

{{< gist leseb 2968971 >}}

**Pull 2**. The function `keystone_monitor` is called too quickly. The server is not up. Thus this generate false errors in the logs because the server is about to come up. Putting the sleep at the beginning of the loop makes sure that the server is up (most of the time).

{{< gist leseb 2969139 >}}

<br />

# II. Setup the resources

I will skip the pacemaker installation steps, I assume that you have 2 nodes configured, you can easly check the membership:

```bash
$ sudo corosync-objctl | grep member
runtime.totem.pg.mrp.srp.members.706128064.ip=r(0) ip(192.168.22.42) 
runtime.totem.pg.mrp.srp.members.706128064.join_count=1
runtime.totem.pg.mrp.srp.members.706128064.status=joined
runtime.totem.pg.mrp.srp.members.722905280.ip=r(0) ip(192.168.22.43) 
runtime.totem.pg.mrp.srp.members.722905280.join_count=1
runtime.totem.pg.mrp.srp.members.722905280.status=joined
```

And you must see this output from the `crm_mon` command:

```bash
$ sudo crm_mon -1
============
Last updated: Thu Jun 21 09:49:48 2012
Last change: Thu Jun 21 09:41:34 2012 via crm_attribute on ha-01
Stack: openais
Current DC: ha-01 - partition with quorum
Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
2 Nodes configured, 2 expected votes
0 Resources configured.
============

Online: [ ha-01 ha-02 ]
```

With a 2 nodes cluster comes some pre-requires like:

* Disable STONITH
* Ignore the quorum policy
* Set the resource stickness to prevent resource failbacks. It’s not mandatory but recommended. Don’t forget that the stickiness is additive in groups. Every active member of the group will contribute its stickiness value to the group’s total. Here we have 4 resource agents, each resource has a weight of 100, then the group as a whole will prefer its current location with a score of 400.


I truly advise you to use the crm shell by typing `sudo crm` because it offers the auto-completion of the commands which is really great. Or you can use the binary from the shell like this:

```bash
$ sudo crm configure property stonith-enabled=false
$ sudo crm configure property no-quorum-policy=ignore
$ sudo crm configure rsc_defaults resource-stickiness=400
```

We will start by creating a floating IP address for the cluster:

```bash
$ sudo crm configure primitive p_vip ocf:heartbeat:IPaddr \
    params ip="172.17.1.80" cidr_netmask="24" nic="eth0" \
    op monitor interval="5s"
```

Adapt the different values with your setup. And check the status of your cluster:

```bash
$ sudo crm_mon -1
============
Last updated: Thu Jun 21 10:00:08 2012
Last change: Thu Jun 21 09:41:34 2012 via crm_attribute on ha-01
Stack: openais
Current DC: ha-01 - partition with quorum
Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
2 Nodes configured, 2 expected votes
1 Resources configured.
============

Online: [ ha-01 ha-02 ]

      p_vip	(ocf::heartbeat:IPaddr):	Started ha-01
```

Now we are about to add the glance and keystone primitives:

```bash
$ sudo crm configure primitive p_glance_api ocf:openstack:glance-api \
    params config="/etc/glance/glance-api.conf" os_auth_url="http://172.17.1.80:5000/v2.0/" os_password="admin" \
    os_tenant_name="admin" os_username="admin" user="glance" client_binary="/usr/bin/glance" \ 
    op monitor interval="15s" timeout="30s"

$ sudo crm configure primitive p_glance_registry ocf:openstack:glance-registry \
    params config="/etc/glance/glance-registry.conf" os_auth_url="http://172.17.1.80:5000/v2.0/"
    os_password="admin" os_tenant_name="admin" os_username="admin" user="glance" \
    op monitor interval="15s" timeout="30s"

$ sudo crm configure primitive p_keystone ocf:openstack:keystone \
    params config="/etc/keystone/keystone.conf" os_auth_url="http://172.17.1.80:5000/v2.0/" os_password="admin" \
    os_tenant_name="admin" os_username="admin" user="keystone" client_binary="/usr/bin/keystone" \
    op monitor interval="15s" timeout="30s"
```

You must modify this value according to your setup, the `os_auth_url` must be the IP address of the `p_vpi` primitive:

* os_auth_url
* os_password
* os_username
* user

Eventually create a group to host every resource:

```bash
$ sudo crm configure group g_ha_glance_keystone p_vip p_keystone p_glance_api p_glance_registry 
```

And check the result:

```bash
$ sudo crm_mon -1
============
Last updated: Thu Jun 21 10:00:08 2012
Last change: Thu Jun 21 09:41:34 2012 via crm_attribute on ha-01
Stack: openais
Current DC: ha-01 - partition with quorum
Version: 1.1.6-9971ebba4494012a93c03b40a2c58ec0eb60f50c
2 Nodes configured, 2 expected votes
4 Resources configured.
============

Online: [ ha-01 ha-02 ]

 Resource Group: g_ha_glance_keystone
     p_vip	(ocf::heartbeat:IPaddr):	Started ha-01
     p_keystone	(ocf::openstack:keystone):	Started ha-01
     p_glance_api	(ocf::openstack:glance-api):	Started ha-01
     p_glance_registry	(ocf::openstack:glance-registry):	Started ha-01
```

<br />

# III. Special note about the IPaddr RA

When the ra IPaddr add a new IP address, the process automatically add a route according to this IP addresss. In my current setup, this installation is hosted inside OpenStack instances and I **don't** need an extra route. For example the netwrk of my VMs is `192.168.22.32/27`, when I added the floating IP address I chose `172.17.1.80/24` which is part of my physical network (floating IPs). The NIC of each VM is bridged to the physical NIC of my compute node and nova-network takes care of the rest. Long story short, I simply modify the resource agent in order to remove the route every time the ra is called. 

This custom ra is available [on my Github](https://github.com/leseb/resource-agents/blob/864efcee7bfd94f748bb6a2db15842e2c377e7c3/heartbeat/IPaddr). Here the changes I made:

{{< gist leseb 2965166 >}}

You will maybe need to setup finer constrains to your cluster but this basic configuration will be enough most of the time. Achieving High-Availability in Glance and Keystone wouldn't have been possible without the tremendous work of the [hastexo'guys](http://www.hastexo.com/). Many thanks to them :)
