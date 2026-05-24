---
title: "Grizzly Nova: what's new in the API CLI?"
date: 2013-05-27 21:58:00
slug: grizzly-nova-whats-new-in-the-api-cli
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Grizzly Nova: what's new in the API CLI?"](/images/nova-api-update-grizzly.jpg)

Quick Nova API CLI updates.

<!--more-->

<br />

# I Agents

API doc says:

The agent is talking about guest agent.The host can use this for things like accessing files on the disk, configuring networking, or running other applications/scripts in the guest while it running. Typically this uses some hypervisor-specific transport to avoid being dependent on a working network configuration. Xen, VMware, and VirtualBox have guest agents,although the Xen driver is the only one with an implementation for managing them in openstack. KVM doesn't really have a concept of a guest agent (although one could be written).

Note: admin API only, commands available:

* agent-create        Creates a new agent build.
* agent-delete        Deletes an existing agent build.
* agent-list          List all builds
* agent-modify        Modify an existing agent build.

Usage example:

```bash
$ nova agent-create debian amd64 wheezy7 http://www.debian.org/releases/stable/ 56789765433678 kvm
+--------------+----------------------------------------+
| Property     | Value                                  |
+--------------+----------------------------------------+
| version      | wheezy7                                |
| architecture | amd64                                  |
| url          | http://www.debian.org/releases/stable/ |
| hypervisor   | kvm                                    |
| md5hash      | 56789765433678                         |
| os           | debian                                 |
| agent_id     | 1                                      |
+--------------+----------------------------------------+

$ nova agent-list
+----------+------------+--------+--------------+---------+----------------+----------------------------------------+
| Agent_id | Hypervisor | OS     | Architecture | Version | Md5hash        | Url                                    |
+----------+------------+--------+--------------+---------+----------------+----------------------------------------+
| 1        | kvm        | debian | amd64        | wheezy7 | 56789765433678 | http://www.debian.org/releases/stable/ |
+----------+------------+--------+--------------+---------+----------------+----------------------------------------+
```

<br />

# II. Code Coverage

Note: admin API only, commands available:

* coverage-report     Generate a coverage report
* coverage-start      Start Nova coverage reporting
* coverage-stop       Stop Nova coverage reporting

Usage example:

```bash
$ nova coverage-start
Coverage collection started

$ nova coverage-report report
Report path: /tmp/nova-coverage_e8IoKi/report

$ less /tmp/nova-coverage_e8IoKi/report.api
```

<br />

# III. Instance action

Commands available:

* instance-action
* instance-action-list

Usage example:

```bash
$ nova list
+--------------------------------------+-------+--------+------------------+
| ID                                   | Name  | Status | Networks         |
+--------------------------------------+-------+--------+------------------+
| 0abcc3ae-9ce0-47aa-bb0c-87c56eb473d4 | leseb | ACTIVE | private=10.0.0.3 |
+--------------------------------------+-------+--------+------------------+

$ nova instance-action-list 0abcc3ae-9ce0-47aa-bb0c-87c56eb473d4
+---------+------------------------------------------+---------+
| Action  | Request_ID                               | Message |
+---------+------------------------------------------+---------+
| create  | req-84fb93cd-0e23-4e6e-9ab3-790dda5e207b | None    |
| pause   | req-d624eec0-c814-447c-866a-22a4a9e6a21a | None    |
| resume  | req-75db178a-6056-42b7-941e-4599c39d41b6 | None    |
| suspend | req-43298462-2c44-4b7a-a75d-3cb1abb18fc6 | None    |
| unpause | req-855dcd83-fee9-422f-9eaf-288963e6310b | None    |
+---------+------------------------------------------+---------+

$ nova instance-action 0abcc3ae-9ce0-47aa-bb0c-87c56eb473d4 req-84fb93cd-0e23-4e6e-9ab3-790dda5e207b
+---------------+------------------------------------------+
| Property      | Value                                    |
+---------------+------------------------------------------+
| instance_uuid | 0abcc3ae-9ce0-47aa-bb0c-87c56eb473d4     |
| user_id       | 12d5c60aa4fd43faab561569d256a3a8         |
| start_time    | 2013-04-22T22:33:43.000000               |
| request_id    | req-84fb93cd-0e23-4e6e-9ab3-790dda5e207b |
| action        | create                                   |
| message       | None                                     |
| project_id    | 19292b3b597b4ecc9a41103cc312a42f         |
+---------------+------------------------------------------+
```

<br />

# IV. The rest

## IV.1. Evacuate the node

* evacuate: evacuate server from failed host to specified one.

Usage example:

```bash
$ nova evacuate instance compute
```

## IV.2. Instance password

* get-password: get password for a server.
* clear-password: clear password for a server.


## IV.3. Moved Nova-manage commands

* scrub: deletes data associated with the project
* service-list: check the state of OpenStack services

## IV.4. Usage

* usage: show usage data for a single tenant

```
$ nova usage
Usage from 2013-03-26 to 2013-04-24:
+-----------+--------------+-----------+---------------+
| Instances | RAM MB-Hours | CPU Hours | Disk GB-Hours |
+-----------+--------------+-----------+---------------+
| 1         | 2326.69      | 18.18     | 0.00          |
+-----------+--------------+-----------+---------------+
```

## IV.5 List availability zones

See my previous article: [Grizzly Availabilty Zones](http://www.sebastien-han.fr/blog/2013/03/18/grizzly-availability-zones/)

<br />

# V. Host aggregates

There are already 2 excellent articles about it:

* [http://russellbryantnet.wordpress.com/2013/05/21/availability-zones-and-host-aggregates-in-openstack-compute-nova/](http://russellbryantnet.wordpress.com/2013/05/21/availability-zones-and-host-aggregates-in-openstack-compute-nova/)
* [http://www.mirantis.com/blog/segregation-in-grizzly-availability-zones-versus-host-aggregates/](http://www.mirantis.com/blog/segregation-in-grizzly-availability-zones-versus-host-aggregates/)


<br />

> Hope it helps ;-)
