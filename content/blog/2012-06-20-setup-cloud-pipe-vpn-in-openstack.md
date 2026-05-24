---
title: Setup Cloud Pipe VPN in OpenStack
date: 2012-06-20 11:39:00
slug: setup-cloud-pipe-vpn-in-openstack
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Cloud Pipe VPN](/images/pipe.jpg)

This article mainly re-uses the [OpenStack official documentation](http://nova.openstack.org/devref/cloudpipe.html). Since the latter has errors in it, I fixed them. It's fully functionnal under Ubuntu 12.04 distro.

<!--more-->

<br />

# I. Cloud Pipe VPN image template

First run a new empty instance. If you use the [Ubuntu Cloud repo image](http://cloud-images.ubuntu.com/precise/current/) some extra packages are needed. From now we will work inside our fresh Ubuntu instance.

```bash
$ sudo apt-get update && sudo apt-get upgade
$ sudo apt-get install openvpn bridge-utils unzip -y
```

Create the openvpn configuration file called `server.conf.template` in `/etc/openvpn/`, with the following content:

	port 1194
	proto udp
	dev tap0
	up "/etc/openvpn/up.sh br0"
	down "/etc/openvpn/down.sh br0"
	script-security 3 system
	
	persist-key
	persist-tun

	ca ca.crt
	cert server.crt
	key server.key  # This file should be kept secret

	dh dh1024.pem
	ifconfig-pool-persist ipp.txt

	server-bridge VPN_IP DHCP_SUBNET DHCP_LOWER DHCP_UPPER

	client-to-client
	keepalive 10 120
	comp-lzo

	max-clients 1

	user nobody
	group nogroup

	persist-key
	persist-tun

	status openvpn-status.log

	verb 3
	mute 20

Create the script which bring up the bridge network interface, call it `up.sh`:

```bash
#!/bin/sh

BR=$1
DEV=$2
MTU=$3
/sbin/ifconfig $DEV mtu $MTU promisc up
/sbin/brctl addif $BR $DEV
```

Create the script which bring down the bridge network interface, call it `down.sh`:

```bash
#!/bin/sh

BR=$1
DEV=$2

/usr/sbin/brctl delif $BR $DEV
/sbin/ifconfig $DEV down
```

Don't forget to make executable!

```bash
$ sudo chmod +x /etc/openvpn/{up.sh,down.sh}
```

Modify your network parameters in `/etc/network/interfaces`

	# This file describes the network interfaces available on your system
	# and how to activate them. For more information, see interfaces(5).

	# The loopback network interface
	auto lo
	iface lo inet loopback

	# The primary network interface
	auto eth0
	iface eth0 inet manual
	  up ifconfig $IFACE 0.0.0.0 up
	  down ifconfig $IFACE down

	auto br0
	iface br0 inet dhcp
	  bridge_ports eth0


Eventually edit your `/etc/rc.local` like so:

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
####### These lines go at the end of /etc/rc.local #######
. /lib/lsb/init-functions

echo Downloading payload from userdata
wget http://169.254.169.254/latest/user-data -O /tmp/payload.b64
echo Decrypting base64 payload
openssl enc -d -base64 -in /tmp/payload.b64 -out /tmp/payload.zip

mkdir -p /tmp/payload
echo Unzipping payload file
unzip -o /tmp/payload.zip -d /tmp/payload/

# if the autorun.sh script exists, run it
if [ -e /tmp/payload/autorun.sh ]; then
    echo Running autorun.sh
    cd /tmp/payload
    sh /tmp/payload/autorun.sh
    if [ ! -e /etc/openvpn/dh1024.pem ]; then
        openssl dhparam -out /etc/openvpn/dh1024.pem 1024
    fi
    chmod 700 /etc/openvpn/server.key
else
  echo rc.local : No autorun script to run
fi


exit 0
```

For those of you who are curious here is the content of the `autorun.sh` script:

```bash
#!/bin/bash
# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2010 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

# This gets zipped and run on the cloudpipe-managed OpenVPN server

export LC_ALL=C
export VPN_IP=`ifconfig  | grep 'inet addr:'| grep -v '127.0.0.1' | cut -d: -f2 | awk '{print $1}'`
export BROADCAST=`ifconfig  | grep 'inet addr:'| grep -v '127.0.0.1' | cut -d: -f3 | awk '{print $1}'`
export DHCP_MASK=`ifconfig  | grep 'inet addr:'| grep -v '127.0.0.1' | cut -d: -f4 | awk '{print $1}'`
export GATEWAY=`netstat -r | grep default | cut -d' ' -f10`

DHCP_LOWER=`echo $BROADCAST | awk -F. '{print $1"."$2"."$3"." $4 - 5 }'`
DHCP_UPPER=`echo $BROADCAST | awk -F. '{print $1"."$2"."$3"." $4 - 1 }'`

# generate a server DH
openssl dhparam -out /etc/openvpn/dh1024.pem 1024

cp crl.pem /etc/openvpn/
cp server.key /etc/openvpn/
cp ca.crt /etc/openvpn/
cp server.crt /etc/openvpn/
# Customize the server.conf.template
cd /etc/openvpn

sed -e s/VPN_IP/$VPN_IP/g server.conf.template > server.conf
sed -i -e s/DHCP_SUBNET/$DHCP_MASK/g server.conf
sed -i -e s/DHCP_LOWER/$DHCP_LOWER/g server.conf
sed -i -e s/DHCP_UPPER/$DHCP_UPPER/g server.conf
sed -i -e s/max-clients\ 1/max-clients\ 10/g server.conf

echo "push \"route 10.0.0.0 255.255.255.0 $GATEWAY\"" >> server.conf
echo "duplicate-cn" >> server.conf
echo "crl-verify /etc/openvpn/crl.pem" >> server.conf

/etc/init.d/openvpn start
```

Now your instance is ready to be snapshoted and stored in Glance. The following commands will select the id of our Ubuntu template and create a new image based on it.

```bash
$ nova list
+--------------------------------------+------------+--------+---------------------+
|                  ID                  |  Name      | Status |       Networks      |
+--------------------------------------+------------+--------+---------------------+
| 739079ab-0f8e-404a-ae6e-a91f4fe99c94 | cloud-pipe | ACTIVE | vlan1=192.168.22.43 |
+--------------------------------------+------------+--------+---------------------+

$ nova image-create 739079ab-0f8e-404a-ae6e-a91f4fe99c94 cloud-pipe-template

$ nova image-list
+--------------------------------------+---------------------+--------+--------------------------------------+
|                  ID                  |      Name           | Status |                Server                |
+--------------------------------------+---------------------+--------+--------------------------------------+
| 0bfc8fd3-1590-463b-b178-bce30be5ef7b | cloud-pipe-template | ACTIVE | fb93eda8-4eb8-42f7-b53c-91c6d83cface |
+--------------------------------------+---------------------+--------+--------------------------------------+
```

Update your image in Glance and make it public (accessible by all tenants):

```bash
$ glance update 0bfc8fd3-1590-463b-b178-bce30be5ef7b is_public=true
Updated image 0bfc8fd3-1590-463b-b178-bce30be5ef7b

$ glance show 0bfc8fd3-1590-463b-b178-bce30be5ef7b | grep Public
Public: Yes
```

<br />

# II. CloudPipe setup

## II.1 Configure OpenStack to use the template

Add some options to your `nova.conf` like the id of you image, this will tell nova to call the vpn profile when our vpn-image is called:

	## cloud-pipe vpn client ##
	--vpn_image_id=0bfc8fd3-1590-463b-b178-bce30be5ef7b
	--use_project_ca=true
	--cnt_vpn_clients=5 

Restart **all** your nova services. 

## II.2. Create the VPN

You are ready to run your cloud-pipe instance from any tenant. The command line tool is pretty unclear:

```bash
$ nova help cloudpipe-create
usage: nova cloudpipe-create <project>

Create a cloudpipe instance for the given project

Positional arguments:
  <project>  Name of the project.
```

The CLI suggests to use the *Name of the project* but that won't work, **the correct syntax is to use the id of the tenant**:

```bash
$ keystone tenant-list
+----------------------------------+---------+---------+
|                id                |   name  | enabled |
+----------------------------------+---------+---------+
| 071ffb95837e4d509cb7153f21c57c4d | stone   | True    |
| 520b6689e344456cbb074c83f849914a | service | True    |
| d1f5d27ccf594cdbb034c8a4123494e9 | admin   | True    |
| dfb0ef4ab6d94d5b9e9e0006d0ac6706 | demo    | True    |
+----------------------------------+---------+---------+

$ nova cloudpipe-create d1f5d27ccf594cdbb034c8a4123494e9
```

Use this command to verify:

```bash 
$ nova cloudpipe-list
+----------------------------------+------------+-------------+---------------+
|            Project Id            | Public IP  | Public Port |  Internal IP  |
+----------------------------------+------------+-------------+---------------+
| d1f5d27ccf594cdbb034c8a4123494e9 | 172.17.1.3 | 1000        | 192.168.22.34 |
+----------------------------------+------------+-------------+---------------+
```

## II.3. Under the hood

### II.3.1. Security rules

This will run a new instance called `<project-id>-vpn`. In VLAN networking mode, the second IP in each private network is reserved for the cloudpipe instance. Nova network will automatically create a new security group called `<project id>-vpn`, assigned this group to the vpn instance and eventually will allow those rules:

	ALLOW 1194:1194 from 0.0.0.0/0
	ALLOW -1:-1 from 0.0.0.0/0

### II.3.2. Credentials

An SSH key has been generated here `/var/lib/nova/keys`, you can use it to log into the VPN instance. Certificates are stored in `/var/lib/nova/CA/projects/<tenant-id>`. Basically:

* Server CA file is located in `/var/lib/nova/CA/projects/<tenant-id>/cacert.pem`
* New client cert are located in `/var/lib/nova/CA/projects/<tenant-id>/newcerts/`


## II.4. Generate client credentials

Default generated credentials are vpn server credential you **must not** use them, thus create client credentials. Don't forget to install the `nova-cert` package.

```bash
$ nova x509-create-cert
Wrote private key to pk.pem
Wrote x509 certificate to cert.pem
```

Then fetch the server certificate:

```bash
$ nova x509-get-root-cert
Wrote x509 root cert to cacert.pem
```

Client template, which can be find here `/usr/lib/python2.7/dist-packages/nova/cloudpipe/client.ovpn.template`:

    # NOVA user connection
    # Edit the following lines to point to your cert files:
    cert $certfile
    key $keyfile

    ca cacert.pem

    client
    dev tap
    proto udp

    remote $ip $port
    resolv-retry infinite
    nobind
    
    # Downgrade privileges after initialization (non-Windows only)
    user nobody
    group nogroup
    comp-lzo
    
    # Set log file verbosity.
    verb 2
    
    keepalive 10 120
    ping-timer-rem
    persist-tun
    persist-key


## II.4. Troubleshooting

A periodic task will disassociate the fixed ip address for this instance, this task is identified in the log like:

	Running periodic task VlanManager._disassociate_stale_fixed_ips from (pid=21578) periodic_tasks /usr/lib/python2.7/dist-packages/nova/manager.py:152 

After this the `nova cloudpipe-list` output should be empty.

However if you re-run the cloud-pipe instance too quickly you will get an error from nova-network:

	ERROR nova.rpc.amqp Returning exception Fixed IP address 192.168.22.34 is already in use.

To fix this, you need to update some fields in the nova database:

```sql
mysql> USE nova;
mysql> SELECT * FROM fixed_ips WHERE address='192.168.22.34';
+---------------------+---------------------+------------+---------+-----+---------------+------------+-------------+-----------+--------+----------+----------------------+------+
| created_at          | updated_at          | deleted_at | deleted | id  | address       | network_id | instance_id | allocated | leased | reserved | virtual_interface_id | host |
+---------------------+---------------------+------------+---------+-----+---------------+------------+-------------+-----------+--------+----------+----------------------+------+
| 2012-05-21 12:06:18 | 2012-06-18 09:26:25 | NULL       |       0 | 484 | 192.168.22.34 |         13 |         630 |         0 |      0 |        1 |                 NULL | NULL |
+---------------------+---------------------+------------+---------+-----+---------------+------------+-------------+-----------+--------+----------+----------------------+------+
mysql> UPDATE fixed_ips SET allocated=0, leased=0, instance_id=NULL WHERE address='192.168.22.34';
mysql> SELECT * FROM fixed_ips WHERE address='192.168.22.34';
+---------------------+---------------------+------------+---------+-----+---------------+------------+-------------+-----------+--------+----------+----------------------+------+
| created_at          | updated_at          | deleted_at | deleted | id  | address       | network_id | instance_id | allocated | leased | reserved | virtual_interface_id | host |
+---------------------+---------------------+------------+---------+-----+---------------+------------+-------------+-----------+--------+----------+----------------------+------+
| 2012-05-21 12:06:18 | 2012-06-18 09:26:25 | NULL       |       0 | 484 | 192.168.22.34 |         13 |        NULL |         0 |      0 |        1 |                 NULL | NULL |
+---------------------+---------------------+------------+---------+-----+---------------+------------+-------------+-----------+--------+----------+----------------------+------+
```

## II.5. Bonus

See below all the nova.conf options related to the Cloud Pipe VPN:

	vpn_ip = <COMPUTE_NODE_IP or PUBLIC_IP>
	vpn_start = 1000
	vpn_key_suffix = -vpn
	vpn_client_template = /usr/lib/python2.7/dist-packages/nova/cloudpipe/client.ovpn.template
	credential_vpn_file = nova-vpn.conf
	vpn_image_id = IMAGE_ID
	cnt_vpn_clients = 5
	keys_path = /var/lib/nova/keys
	ca_path = /var/lib/nova/CA

Some options can be managed by the `nova-manage` command:

```bash
$ sudo nova-manage vpn change --ip=<ip> --project=<project-id> --port=<port-number>
```

<br />

> For an automatic installation I forked the Mirantis repo and made some minor changes. Now the scripts *should be* compatible with Ubuntu 12.04, I only modified the `cloudpipeconf.sh` script according to my tests, so I don't guarantee that the full project will work for you. Many thanks to Mirantis for the original script. [See my fork on Github](https://github.com/leseb/cloudpipe-image-auto-creation) and the [automatic installation script](https://github.com/leseb/cloudpipe-image-auto-creation/blob/master/cloudpipeconf.sh).
