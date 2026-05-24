---
title: "OpenStack: override DHCP information sent by DNSMASQ to a VM"
date: 2013-02-18 11:21:00
slug: openstack-override-dhcp-information-send-by-dnsmasq-to-the-vm
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![OpenStack: override DHCP information sent by DNSMASQ to a VM](/images/openstack-dnsmasq-dhcp.jpg)

One of the most annoying thing is when the `resolv.conf` of your VM keeps changing because of the information sent by the DNSMASQ process. In this article, I assume that your setup has some conventions such as:

* One network per customer, with fixed_ips range with something like `10.100.$ID.0/24`
* One ID (number) per tenant

<!--more-->

First create a template file for your initial dhclient configuration file. Using a template file makes things easier to build base images.

```bash
$ sudo cp /etc/dhcp/dhclient.conf /etc/dhcp/dhclient.conf.template
```

Then append the following lines in `/etc/dhcp/dhclient.conf.template`:

    supersede domain-name-servers 10.100.X.254;
    supersede domain-name "template.your-super-cloud.domain";

The above example shows **my** fixed_ips range. You might have to edit it with **your** own range.

Eventually edit your `/etc/rc.local` with the following:

```bash
#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.

# Grab the tenant name
TENANT=$(curl -f http://169.254.169.254/latest/meta-data/hostname | cut -f 1 -d '-')

# Grab the tenant ID
ID=$(echo $TENANT | cut -c 1-2)

# Update the DHCP conf
\cp /etc/dhcp/dhclient.conf.template /etc/dhcp/dhclient.conf

sed -i s/template/$TENANT/ /etc/dhcp/dhclient.conf
sed -i s/X/$ID/ /etc/dhcp/dhclient.conf

/usr/bin/killall dhclient3
/sbin/dhclient3 -e IF_METRIC=100 -pf /var/run/dhclient.eth0.pid -lf /var/lib/dhcp/dhclient.eth0.leases -1 eth0
```

<br />

> Enjoy!
