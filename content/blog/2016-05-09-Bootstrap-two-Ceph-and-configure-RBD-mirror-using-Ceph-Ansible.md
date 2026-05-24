---
title: Bootstrap two Ceph and configure RBD mirror using Ceph Ansible
date: 2016-05-09 17:04:34
slug: Bootstrap-two-Ceph-and-configure-RBD-mirror-using-Ceph-Ansible
draft: false
categories: ["ansible"]
tags: ["ansible", "ceph"]
---

![Title](/images/bootstrap-2-ceph-configure-rbd-mirror-ansible.png)

Since Jewel is out everyone wants to try the new RBD-mirroring feature.

<!--more-->

This development environment assumes that you have two virtual machines, with two block devices attached.
I ran my tests on two CentOS 7.2 virtual machines.

```bash
$ sudo yum install -y git
$ git clone https://github.com/ceph/ceph-ansible.git
Cloning into 'ceph-ansible'...
remote: Counting objects: 6853, done.
remote: Compressing objects: 100% (47/47), done.
remote: Total 6853 (delta 19), reused 0 (delta 0), pack-reused 6805
Receiving objects: 100% (6853/6853), 1.29 MiB | 1.28 MiB/s, done.
Resolving deltas: 100% (4236/4236), done.
Checking connectivity... done.

$ sudo ./install-ansible.sh
$ cd ceph-ansible/

SUBNET=$(ip r | grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}/[0-9]\{1,2\}' | head -1)

~/ceph-ansible$ cp site.yml.sample site.yml
~/ceph-ansible$ mkdir cluster-{primary,secondary}
~/ceph-ansible$ echo cluster-{primary,secondary} | xargs -n 1 cp -a group_vars
~/ceph-ansible$ cp cluster-primary/group_vars/all.sample cluster-primary/group_vars/all
~/ceph-ansible$ cp cluster-primary/group_vars/osds.sample cluster-primary/group_vars/osds
~/ceph-ansible$ cp cluster-secondary/group_vars/osds.sample cluster-secondary/group_vars/osds
~/ceph-ansible$ cp cluster-secondary/group_vars/all.sample cluster-secondary/group_vars/all
~/ceph-ansible$ sed -i "s/#osd_auto_discovery: false/osd_auto_discovery: true/" cluster-{primary,secondary}/group_vars/osds
~/ceph-ansible$ sed -i "s/#journal_collocation: false/journal_collocation: true/" cluster-{primary,secondary}/group_vars/osds
~/ceph-ansible$ sed -i "s/#monitor_address: 0.0.0.0/monitor_address: 192.168.0.50/" cluster-primary/group_vars/all
~/ceph-ansible$ sed -i "s/#monitor_address: 0.0.0.0/monitor_address: 192.168.0.51/" cluster-secondary/group_vars/all
~/ceph-ansible$ sed -i "s|#public_network: 0.0.0.0\/0|public_network: ${SUBNET}|" cluster-{primary,secondary}/group_vars/all
~/ceph-ansible$ sed -i "s/#journal_size: 0/journal_size: 100/" cluster-{primary,secondary}/group_vars/all
~/ceph-ansible$ sed -i "s/#common_single_host_mode: true/common_single_host_mode: true/" cluster-{primary,secondary}/group_vars/all
~/ceph-ansible$ sed -i "s/#pool_default_size: 3/pool_default_size: 2/" cluster-{primary,secondary}/group_vars/all
~/ceph-ansible$ sed -i "s/#ceph_dev: false/ceph_dev: true/" cluster-{primary,secondary}/group_vars/all
~/ceph-ansible$ sed -i "s|#ceph_dev_branch: master|ceph_dev_branch: jewel|" cluster-{primary,secondary}/group_vars/all
~/ceph-ansible$ sed -i "s|#cluster: ceph |cluster: primary |" cluster-primary/group_vars/all # the space after 'primary' is important
~/ceph-ansible$ sed -i "s|#cluster: ceph |cluster: secondary |" cluster-secondary/group_vars/all # the space after 'secondary' is important

```

In the end I have the following configuration:

```bash
~/ceph-ansible$ egrep -v '^#|^$' cluster-{primary,secondary}/group_vars/all
cluster-primary/group_vars/all:---
cluster-primary/group_vars/all:dummy:
cluster-primary/group_vars/all:cluster: primary # cluster name
cluster-primary/group_vars/all:ceph_dev: true # use ceph development branch
cluster-primary/group_vars/all:ceph_dev_branch: jewel # development branch you would like to use e.g: master, wip-hack
cluster-primary/group_vars/all:monitor_address: 192.168.0.50
cluster-primary/group_vars/all:journal_size: 100
cluster-primary/group_vars/all:pool_default_size: 2
cluster-primary/group_vars/all:public_network: 192.168.0.0/24
cluster-primary/group_vars/all:common_single_host_mode: true
cluster-secondary/group_vars/all:---
cluster-secondary/group_vars/all:dummy:
cluster-secondary/group_vars/all:cluster: secondary # cluster name
cluster-secondary/group_vars/all:ceph_dev: true # use ceph development branch
cluster-secondary/group_vars/all:ceph_dev_branch: jewel # development branch you would like to use e.g: master, wip-hack
cluster-secondary/group_vars/all:monitor_address: 192.168.0.51
cluster-secondary/group_vars/all:journal_size: 100
cluster-secondary/group_vars/all:pool_default_size: 2
cluster-secondary/group_vars/all:public_network: 192.168.0.0/24
cluster-secondary/group_vars/all:common_single_host_mode: true


~/ceph-ansible$ egrep -v '^#|^$' cluster-{primary,secondary}/group_vars/osds
cluster-primary/group_vars/osds:---
cluster-primary/group_vars/osds:dummy:
cluster-primary/group_vars/osds:osd_auto_discovery: true
cluster-primary/group_vars/osds:journal_collocation: true
cluster-secondary/group_vars/osds:---
cluster-secondary/group_vars/osds:dummy:
cluster-secondary/group_vars/osds:osd_auto_discovery: true
cluster-secondary/group_vars/osds:journal_collocation: true
```

Now that you have your basic setup you need to create inventory files.
Those files will contain the list of hosts for each cluster.

In my environment I have 2 machines: 192.168.0.50 and 192.168.0.51, so let's build both.

```bash
~/ceph-ansible$ cat <<EOF > cluster-primary/inventory
[mons]
192.168.0.50

[osds]
192.168.0.50

[rbdmirrors]
192.168.0.50
EOF
```

Then the second one:

```bash
~/ceph-ansible$ cat <<EOF > cluster-secondary/inventory
[mons]
192.168.0.51

[osds]
192.168.0.51

[rbdmirrors]
192.168.0.51
EOF
```

Test out that everything is well connected:

```bash
$ ansible all -i cluster-primary -m ping
192.168.0.50 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
$ ansible all -i cluster-secondary -m ping
192.168.0.51 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

Now let's fire Ansible.

```bash
$ ansible-playbook -i cluster-primary site.yml
$ ansible-playbook -i cluster-secondary site.yml
```

When Ansible is done deploying, check Ceph's status on both environments:

```bash
ubuntu@rbd-mirror1:~$ sudo ceph --cluster primary -s
    cluster 6d94f450-a0a6-46e2-88ed-915360e3886b
     health HEALTH_OK
     monmap e1: 1 mons at {rbd-mirror1=192.168.0.50:6789/0}
            election epoch 3, quorum 0 rbd-mirror1
     osdmap e10: 2 osds: 2 up, 2 in
            flags sortbitwise
      pgmap v19: 64 pgs, 1 pools, 0 bytes data, 0 objects
            67676 kB used, 40671 MB / 40737 MB avail
                  64 activating


ubuntu@rbd-mirror2:~$ sudo ceph --cluster secondary -s
    cluster 6d94f450-a0a6-46e2-88ed-915360e3886b
     health HEALTH_OK
     monmap e1: 1 mons at {rbd-mirror2=192.168.0.51:6789/0}
            election epoch 3, quorum 0 rbd-mirror2
     osdmap e10: 2 osds: 2 up, 2 in
            flags sortbitwise
      pgmap v23: 64 pgs, 1 pools, 0 bytes data, 0 objects
            68568 kB used, 40671 MB / 40737 MB avail
                  64 active+clean
```

Both clusters are now ready to use, the `rbd-mirror` agent is running and can be configured.

> When it comes to the mirroring configuration, I will let you with the [upstream Ceph doc](http://docs.ceph.com/docs/master/rbd/rbd-mirroring/).
