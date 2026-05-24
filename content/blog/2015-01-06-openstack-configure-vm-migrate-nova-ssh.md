---
title: OpenStack configure VM migrate nova SSH
date: 2015-01-06 13:46:00
slug: openstack-configure-vm-migrate-nova-ssh
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

Just a reminder for me :D.

<!--more-->

Stolen from https://twiki.cern.ch/twiki/bin/view/Sandbox/GettingStartedwithOpenStack

```bash
$ usermod -s /bin/bash nova
$ su - nova
nova@compute01:~$ mkdir -p -m 700 .ssh
nova@compute01:~$ cat > .ssh/config <<EOF
Host *
StrictHostKeyChecking no
UserKnownHostsFile=/dev/null
EOF
nova@compute01:~$ ssh-keygen -f id_rsa -b 1024 -P ""
nova@compute01:~$ scp /var/lib/nova/.ssh/id_rsa.pub root@compute01:/var/lib/nova/.ssh/authorized_keys
nova@compute01:~$ scp /var/lib/nova/.ssh/id_rsa.pub root@compute02:/var/lib/nova/.ssh/authorized_keys
nova@compute01:~$ scp /var/lib/nova/.ssh/* root@compute02:/var/lib/nova/.ssh/
```

Repeat the process if needed for more compute nodes.
Go back as root:

```bash
$ sudo chown -R nova:nova /var/lib/nova/
$ sudo chmod 700 /var/lib/nova/.ssh
$ sudo chmod 600 /var/lib/nova/.ssh/authorized_keys
```

Test:

```bash
nova@compute01:~$ ssh nova@compute02 ls
buckets
CA
images
instances
keys
networks
nova.sqlite
tmp
```
