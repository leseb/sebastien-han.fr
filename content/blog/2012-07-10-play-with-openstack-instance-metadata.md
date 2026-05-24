---
title: Play with OpenStack instance metadata
date: 2012-07-11 22:39:00
slug: play-with-openstack-instance-metadata
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Openstack metadata](/images/metadata.jpg)

Nova API metadata.

<!--more-->

# I. Reminder

First check the [OpenStack official documentation](http://docs.openstack.org/trunk/openstack-compute/admin/content/metadata-service.html) about the metadata service. Metadata Ideally if you run an OpenStack production environment you will opt for a multi compute node solution which requires nova metadata service on each nova-compute node (for performance purpose). You can assign the metadata server like so:

1. Use the `metadata_host` option in nova.conf, specify the IP address of the node running nova-api
2. Run the nova-api service on each nova-compute node and specify the `enabled_apis = metadata` flag in nova.conf
3. Or the last option (my favorite), simply run the nova-api-metadata (with the same name package) service on each nova-compute node. It doesn't require any modification in nova.conf (default options are enough)

Flags related to metadata in nova.conf:

* metadata_listen_port = 8775
* metadata_host = 172.17.1.3
* metadata_manager = nova.api.manager.MetadataManager
* quota_metadata_items = 128
* metadata_listen = 0.0.0.0
* enabled_apis = ['ec2', 'osapi_compute', 'osapi_volume', 'metadata']
* metadata_port = 8775


The cloud-init service hosted inside each cloud-image retrieves the metadata during the boot sequence. Metadata contains a lot of information related to the running instance. For example ssh keys will be injected in order to access the virtual instance (always during the boot sequence).

# II. Play!

First pick up an instance and ssh into it. You'r ready to retrieve the metadata, you can use both `wget` or `curl`. I have a preference for `curl` because it shows the content and doesn't download it immediately:

```bash
$ curl http://169.254.169.254/latest/meta-data/
reservation-id
public-keys/
security-groups
public-ipv4
ami-manifest-path
instance-type
instance-id
local-ipv4
local-hostname
placement/
ami-launch-index
public-hostname
hostname
ami-id
instance-action
```

Try to download the ssh public key:

```bash
$ curl http://169.254.169.254/latest/meta-data/public-keys//0/openssh-key -O
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   228  100   228    0     0   1763      0 --:--:-- --:--:-- --:--:--  1767

$ cat openssh-key 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAAgQCwtA1rJf0JPZKfpUPBkW/b30bVJ/ZgzSJsjwFWFDjJIxkxlUPWkan8k6mZs7gedLC+5edi4voNFU3Yg/G73GP9M+m1aV51feK5NShNux6kY49/iAHvxwPnbpN2SpAJs+9r0aeKCTwfefSExKLFrdmkjtZOn+bvp5kFEMK43X2sqQ== nova@server-05
```

That's all!
