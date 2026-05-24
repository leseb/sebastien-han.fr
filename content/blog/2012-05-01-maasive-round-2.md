---
title: MAASive round 2
date: 2012-05-04 22:31:00
slug: maasive-round-2
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/MAAsive-round2.png)

Finally, Ubuntu 12.04 came out! And I was pretty excited to re-try MAAS.
Good news! This time, I was able to go further!

<!--more-->

# Back to MAAS

As reminder, the MAAS purpose extract from the official documentation:

Metal as a Service -- MAAS -- lets you treat physical servers like
virtual machines in the cloud. Rather than having to manage each
server individually, MAAS turns your bare metal into an elastic
cloud-like resource.

What does that mean in practice? Tell MAAS about the machines you want
it to manage and it will boot them, check the hardware's okay, and
have them waiting for when you need them. You can then pull nodes up,
tear them down and redeploy them at will; just as you can with virtual
machines in the cloud.

When you're ready to deploy a service, MAAS gives Juju the nodes it
needs to power that service. It's as simple as that: no need to
manually provision, check and, afterwards, clean-up. As your needs
change, you can easily scale services up or down. Need more power for
your Hadoop cluster for a few hours? Simply tear down one of your Nova
compute nodes and redeploy it to Hadoop. When you're done, it's just
as easy to give the node back to Nova.

MAAS is ideal where you want the flexibility of the cloud, and the
hassle-free power of Juju charms, but you need to deploy to bare
metal.

<br />
# MAAStatus explained

Before started, as convention, I will call the node deployed by MAAS: **MAASlave**. As I saw and understood, MAAS gives several status depending on the state of the node.

List of MAAS status:

* Offline (MAC @manually added) - Commissioning
* Never seen (request a PXE boot) - Declared
* Queued - Ready
* Deployed - Allocated to maas

See the detail of each status below.
<br />
- - -
<br />

![](/images/maas-0-node.png)
**0 nodes in this MAAS**

You simply didn't provide anything yet.

<br />
<br />
<br />


- - -
<br />

![](/images/maas-1-node-added-never-seen.png)
**Never seen - Declared**

This state appears when a non-maas-register node request a boot from your MAAS pxe server. It's an interesting state because it allows you to install an operating system without commissioning to the MAAS server. You can also choose the `enlist` option which will acquire the server to MAAS.

The only thing you have to do is to accept the node via the web gui. So click on `Accept & commission`

![](/images/accept-commission.png)

<br />
- - -
<br />

![](/images/maas-1-node-offline.png)
**Offline - Commissioning**

The node has been added (his MAC address) in MAAS.
It is waiting for booting. This will be the `first` boot sequence.
You should see something like this at the end of the first quick step.

![](/images/maas-commissionning-success.png)

After this one, you will need to relaunch the machine again in order to install the operating system. 

<br />
- - -
<br />

![](/images/maas-1-node-queue.png)
**Queued - Ready - One step left to heaven**

You booted your MAASlave via PXE, this one got an address from your MAAS server and starting the negociation with it.
The new MAASlave was succesfully acquired by the MAAS server in the previous step, now it's time to install the operating system! 

Go grab a coffee and observe the result ~15 minutes later!

<br />
- - -
<br />

![](/images/maas-1-deployed-node.png)
**Deployed - Allocated to maas**

This is the final stage. 

It means that the node marked as deployed has respond to the `juju bootstrap` offer. This node is ready, you can use it to deploy juju charms. Note that apparently this node has been entirely acquired by Juju and you can't remove it on the web gui. The only is to kick out the node with juju using `juju destroy-unit`

<br /> 
- - -
<br />

Bonus stage, every states

![Every states](/images/5nodes-all.png)

<br />
# Under the hood

It's really important to be aware of what happen behind the scene while MAAS is running. It's all start with the MAAS server, during the installation process of 12.04 will be prompted to choose between a casual installation and a MAAS Server installation or enlistment. With this server come a lot of services like apache, dns, tftp, rabbitmq and an optional dhcp management. MAAS is written in Python and the web gui uses the Django framework. MAAS uses a local database to store all the nodes it will deploy. A node is identified by his MAC address. The best way to configure and manage your MAAS server is use the web gui, there is `maas` binary but I think it is use for other purpose. The server will be manage by a superuser, the superuser is mandatory, without it you can't start managing the MAAS server. There is also non-admin user but I didn't experiment them and I don't know what they are use for. Your first machine provisionning will be like so:

1. Add the MAC address of your server in MAAS
2. Startup your node with PXE boot sequence
3. DHCP negociation between your MAAS server and the MAASlave
4. The MAASlave gets an IP address in the range that you defined in your own DHCP server or during the `maas-dhcp`. It also get a hostname, the one select in the web gui or an auto attributed one (by MAAS). Something like `node-a482df4c-9458-11e1-a951-000c290cdd88.local`
5. The MAASlave enters in the `enlistment` stage during which the MAAS server will load the ephemeral image.
6. This operation will only take few minutes and the node will be shutdown
7. The PXE boot will use a netboot image, thoses images are imported via the `maas-import-isos` command. This command imports ISO into Cobbler. The mini.iso is used because it is a small download, and the rest of the installation is performed over the network and packages are cached using squid.
8. Re launch the server, you or MAAS, it depends if the WoL is enable or not on your server. Cobbler will load the pre-configured and auto-generated (by profile) preseed file, the url is always like so: `http://192.168.1.100/cblr/svc/op/ks/system/node-a482df4c-9458-11e1-a951-000c290cdd88`
8. Now wait for the OS installation (ephemeral image)

All the traces  of the installation can be followed here `/var/log/maas/rsyslog` and in `/var/log/squid-deb-proxy/access.log`
<br />
# Listed dependancies

As I can remenber there is a lot of similitude with Orchestra. Some service like rabbit-mq has been added:

* apache: 80
* squid: 8000
* dnsmasq: 53 & 67
* sshd
* postgres: 5432
* mass-pserv: 5241
* maas-txlongpoll: 5432
* epmd: 4369
* rabbitmq: 
* rsyslog: udp 514
* tftpd: 69
* cobbler: 25151

Also note, that if you decide to install MAAS manually, ~200M will be downloaded.
 
<br />
# MAAStarted

The information below are alreday part of the [official documentation](https://wiki.ubuntu.com/ServerTeam/MAAS). I installed MAAS using the CD from Ubuntu Server 12.04 Precise LTS. I assume that you did the same. So after your fresh MAAS installation, tip the following commmands. I also assume that you want let MAAS managing the DHCP from itself to the future nodes.

```
$ sudo apt-get update && sudo apt-get upgrade -y
```

After this, you will maybe need to change the IP address of your MAAS server:

```
$ sudo dpkg-reconfigure maas
$ sudo dpkg-reconfigure maas-provision
```

Install the maas-dhcp agent, cretae a super user and import the isos:

```
$ sudo apt-get install maas-dhcp -y
$ sudo maas create createadmin
$ sudo maas-import-isos
```

There is a related [issue](https://bugs.launchpad.net/ubuntu/+source/maas/+bug/981845) with the cloud-init package version in the epheram build, so it's better to be up to date and launch thoose commands.

```
$ sudo maas-import-ephemerals
$ sudo rm -rf /var/lib/maas/ephemeral/precise/ephemeral/amd64/20120418/
$ sudo rm -rf /var/lib/maas/ephemeral/precise/ephemeral/i386/20120418/
```

Don't forget to activate the forward in the kernel:
```
$ sudo iptables -t nat --append POSTROUTING --out-interface eth0 -j MASQUERADE
$ sudo iptables --append FORWARD --in-interface tun0 -j ACCEPT
$ sudo echo 1 > /proc/sys/net/ipv4/ip_forward
$ sudo echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
$ sudo sysctl -p
net.ipv4.ip_forward = 1
```

From now, you can boot your MAASlave, this machine will enter in negociation with MAAS server and shutdown. The state of the machine in the Web gui will changed from Commissioning to Ready. Don't forget to configure the boot sequence on your servers or press the PXE boot key. After the first, MAAS should be available to wake up your server via WoL and installing the needed new system on it. At the end of this installating, a cobbler snippet will disable the PXE boot for the next boot. This snippet is called at the end of the installation (see the preseed file here `/var/lib/cobbler/kickstarts/maas.preseed`) and located in `/var/lib/cobbler/snippets/maas_disable_pxe`. Just repeat the process, add the MAC address of your node via the web interface and let's roll!

<br />
# Playing with Juju

![](/images/juju-logo.png)   
That's the most interesting part of the MAAS, the interaction with Juju. Juju provides service orchestration. Juju focuses on managing the service units you need to deliver a single solution, above simply configuring the machines or cloud instances needed to run them. Charms developed, tested, and deployed on your own hardware will operate the same in an EC2 API compatible cloud.

<br />
MAAS and Juju will be colocated, both will be running on the same server. But first install it:
```
$ sudo apt-get install python-software-properties -y
$ sudo add-apt-repository ppa:juju/pkgs && sudo apt-get update && sudo apt-get install juju -y
$ mkdir ~/.juju
```

Now go to your web gui and generated a new MAAS key. Just keep in mind that one key is for one Juju environment.

![MAAS Keys](/images/maas-credentials.png)

Generate a new MAAS key and file the `~/.juju/environment.yaml`

```
environments:
  le-maas:
    type: maas
    juju-origin: ppa
    maas-server: 'http://192.168.1.100:80/MAAS'
    maas-oauth: 'TU3Yj78YzLmCgAvRB4:Gmvs43MdCpvU4Fvcn6:GcqeJBVWyaTt3kXYsttby2QqfQ9n39qC'
    admin-secret: 'nothing'
    default-series: precise
```

In order to connect Juju to your instance, you will need ssh-keygen, if you don't already have ones:

```
$ ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/ubuntu/.ssh/id_rsa): 
Created directory '/home/ubuntu/.ssh'.
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/ubuntu/.ssh/id_rsa.
Your public key has been saved in /home/ubuntu/.ssh/id_rsa.pub.
The key fingerprint is:
34:64:fe:4d:0f:b3:39:85:d9:53:1b:30:a3:68:41:28 root@ubuntu
The key's randomart image is:
+--[ RSA 2048]----+
|        =o   +...|
|     E =  o .+o.o|
|      . +o .* +. |
|       ..o o B . |
|        S . = .  |
|             .   |
|                 |
|                 |
|                 |
+-----------------+
```

Finally, run your Juju environment:

```
$ juju bootstrap
2012-05-01 23:08:17,036 INFO Bootstrapping environment 'le-maas' (origin: ppa type: maas)...
2012-05-01 23:08:21,243 INFO 'bootstrap' command finished successfully
```

Normally during this step, Juju will launch a new machine with Zookeeper and the provisionning agent. The WoL was configured on my machine, so Juju boot it up. So simply manually boot the machine. At the end of the installation, you should see this output in the log and also on the screen:

```
juju-machine-agent start/running, process 4371
juju-provision-agent start/running, process 4374
ec2: 
ec2: #############################################################
ec2: -----BEGIN SSH HOST KEY FINGERPRINTS-----
ec2: 1024 ba:8e:24:07:17:3b:46:43:bb:17:e8:bb:2c:33:b2:8a  root@goo (DSA)
ec2: 256 fb:23:ce:23:02:1b:a8:4c:56:bf:83:6f:89:d3:58:9b  root@goo (ECDSA)
ec2: 2048 dd:cf:b1:0b:2f:cb:05:78:3b:c0:dd:b9:b6:79:23:ae  root@goo (RSA)
ec2: -----END SSH HOST KEY FINGERPRINTS-----
ec2: #############################################################
cloud-init boot finished at Wed, 02 May 2012 00:58:58 +0000. Up 210.02 seconds
```

After the process the machine is ready:

```
$ juju status
2012-05-02 01:15:46,337 INFO Connecting to environment...
2012-05-02 01:15:47,093 INFO Connected to environment.
machines:
  0:
    agent-state: running
    dns-name: goo
    instance-id: /MAAS/api/1.0/nodes/node-a8f271e4-93c9-11e1-aae2-000c290cdd88/
    instance-state: unknown
services: {}
2012-05-02 01:15:47,137 INFO 'status' command finished successfully
```

Now let's try to deploy Munin!

```
$ juju deploy munin
2012-05-07 18:12:10,847 INFO Searching for charm cs:precise/munin in charm store
2012-05-07 18:12:11,026 INFO Connecting to environment...
2012-05-07 18:12:16,649 INFO Connected to environment.
2012-05-07 18:12:16,912 INFO Charm deployed as service: 'munin'
2012-05-07 18:12:16,913 INFO 'deploy' command finished successfully
$ juju status
2012-05-07 18:12:24,862 INFO Connecting to environment...
2012-05-07 18:12:30,485 INFO Connected to environment.
machines:
  0:
    agent-state: running
    dns-name: server2
    instance-id: /MAAS/api/1.0/nodes/node-7378f1e2-942c-11e1-8a88-001e4f10230b/
    instance-state: unknown
  1:
    agent-state: not-started
    dns-name: server4
    instance-id: /MAAS/api/1.0/nodes/node-c4549f1e-984e-11e1-9065-001e4f10230b/
    instance-state: unknown
services:
  munin:
    charm: cs:precise/munin-2
    relations: {}
    units:
      munin/0:
        agent-state: pending
        machine: 1
        public-address: null
2012-05-07 18:12:30,667 INFO 'status' command finished successful
```
A new node was automaticaly provisionned by Juju.

Reverse process (a deployed charm), example with a munin charm:

```
$ juju unexpose munin
$ juju destroy-service munin
$ juju terminate-machine 1
```

<br />
# Persistent randomness?

I still do have some issues, usually the same as I had with Orchestra + Juju. The mostly random both solved and unsolved issue was the ssh keys. During the `juju bootstrap`, Juju is supposed to delivery the ssh public key from the MAAS server to the MAASlave node. But I really often this kind of message from the `juju status` command:

```
$ juju -v status
2012-05-05 08:38:05,582 DEBUG Initializing juju status runtime
2012-05-05 08:38:05,590 INFO Connecting to environment...
2012-05-05 08:38:05,751 DEBUG Connecting to environment using node-01...
2012-05-05 08:38:05,764 DEBUG Spawning SSH process with remote_user="ubuntu" remote_host="node-01" remote_port="2181" local_port="45720".
2012-05-05 08:38:06,039 ERROR Invalid SSH key
2012-05-05 08:38:06,337:19176(0x7fb457ef6700):ZOO_INFO@log_env@658: Client environment:zookeeper.version=zookeeper C client 3.3.5
2012-05-05 08:38:06,338:19176(0x7fb457ef6700):ZOO_INFO@log_env@662: Client environment:host.name=ubuntu
2012-05-05 08:38:06,338:19176(0x7fb457ef6700):ZOO_INFO@log_env@669: Client environment:os.name=Linux
2012-05-05 08:38:06,338:19176(0x7fb457ef6700):ZOO_INFO@log_env@670: Client environment:os.arch=3.2.0-23-generic
2012-05-05 08:38:06,338:19176(0x7fb457ef6700):ZOO_INFO@log_env@671: Client environment:os.version=#36-Ubuntu SMP Tue Apr 10 20:39:51 UTC 2012
2012-05-05 08:38:06,339:19176(0x7fb457ef6700):ZOO_INFO@log_env@679: Client environment:user.name=leseb
2012-05-05 08:38:06,339:19176(0x7fb457ef6700):ZOO_INFO@log_env@687: Client environment:user.home=/home/leseb
2012-05-05 08:38:06,339:19176(0x7fb457ef6700):ZOO_INFO@log_env@699: Client environment:user.dir=/var/log/maas/rsyslog
2012-05-05 08:38:06,340:19176(0x7fb457ef6700):ZOO_INFO@zookeeper_init@727: Initiating client connection, host=localhost:45720 sessionTimeout=10000 watcher=0x7fb455edb6b0 sessionId=0 sessionPasswd=<null> context=0x2f44df0 flags=0
2012-05-05 08:38:06,340:19176(0x7fb452cb7700):ZOO_ERROR@handle_socket_error_msg@1579: Socket [127.0.0.1:45720] zk retcode=-4, errno=111(Connection refused): server refused to accept the client
```

Sometime doing a 
```
$ juju destroy-environment
$ juju bootstrap
```

Do the trick but it's really rare.

<br />
# Customization & tricks

## Put a user password in the preseed file 

Since, I have some trouble with `juju bootstrap` and SSH keys. I don't want to be stuck with a deployed node, I want to be able to access it.
There 2 things to modify.

By default, the generated user `ubuntu` has his password disabled and has passwordless admin access via `sudo`. Go to the preseed configuration file in `/var/lib/cobbler/kickstart/maas.preseed` and modify this line

    d-i     passwd/user-password-crypted password !

By this
    d-i     passwd/user-password-crypted    password $6$.1eHH0iY$ArGzKX2YeQ3G6U.mlOO3A.NaL22Ewgz8Fi4qqz.Ns7EMKjEJRIW2Pm/TikDptZpuu7I92frytmk5YeL.9fRY4.

Now the user has a password set, the password is `ubuntu`.

Secondly you have to modify the configuration of the cloud image, do the following steps:

```
$ sudo mount /var/lib/maas/ephemeral/precise/ephemeral/amd64/20120424/disk.img /mnt/
```

Now go to the ssh configuration file and enable the `PasswordAuthentication` option, put the `Yes`value instead of `No`. This `sed` command will do the trick (modify the path if needed):

```
$ sudo sed -i s/PasswordAuthentication\ no/PasswordAuthentication\ yes/g /mnt/etc/ssh/sshd_config
```

Now you can bootstrap the machine and log in.

Also take a look to this directory `/var/lib/cobbler/snippets/` and explore the content of the maas_* scripts. Specially the `maas_client_packages` file.

## Get a machine outside the MAAS autority

Sometimes you will want to use you MAAS server to only deploy operating system for other purpose than your current MAAS cluster. You want this new machine independant.

```
$ sudo rm /etc/init/{juju-*, cloud-*, zookeeper.conf, avahi-daemon.conf}
$ sudo update-rc.d -f apparmor remove
```
Of course you also have to modify you `/etc/network/interface` if it's needed.

<br />
# Troubleshooting

The issue:
```
ERROR SSH forwarding error: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
```

Solved like this:
```
rm ~/.ssh/known_hosts
```

Or using a more elegant way: 
```
ssh-keygen -f "~/.ssh/known_hosts" -R IP_NODE
```

Rabbitmq issue:

```
$ sudo rabbitmqctl status
Status of node rabbit@management ...
Error: unable to connect to node rabbit@management: nodedown
diagnostics:
- nodes and their ports on management: [{rabbit,51666}]
- current node: rabbitmqctl10026@management
- current node home dir: /var/lib/rabbitmq
- current node cookie hash: dAH+8aA76i5KTBj4ws0nwQ==
```

It means you certainly change your IP address but didn't modify the `/etc/hosts` file in consequence.

The issue:
```
[Thu May 03 16:11:40 2012] [error] Content-Type: text/html; charset=utf-8
[Thu May 03 16:11:40 2012] [error] WWW-Authenticate: OAuth realm="OAuth"
[Thu May 03 16:11:40 2012] [error] 
[Thu May 03 16:11:40 2012] [error] Expired timestamp: given 1336047181 and now 1336054300 has a greater difference than threshold 300
```

Update the time on the MAASlave, edit the `/etc/init/cloud-init.conf`

```  
pre-start script
ntpdate -p 8 IP_MAAS_SERVER
hwclock -w
end script
```
Simply add the IP address of the MAAS server.

At the end, I was pretty enthusiastic to see how things would progress with MAAS. It's hard to say if MAAS can be concidered as ready for the prime time. I would say that it depends on your needs. For the moment I think I will only use it for deploying operating systems. Maybe it seems a little bit stupid, you might ask why not simply use cobbler? Because this allows me to see how things are growing, to evaluate the stability and new features version after version. And establish whether or not the Juju integration is more efficient. I will probably write other topics about MAAS, so stay tuned!
