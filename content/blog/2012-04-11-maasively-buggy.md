---
title: MAASively buggy?
date: 2012-04-11 22:42:00
slug: maasively-buggy
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/maas.jpg)

Couple of days ago Canonical annonced his new tool called MAAS, [Metal as a Service](https://wiki.ubuntu.com/ServerTeam/MAAS). It makes it easy to set up the hardware on which to deploy any service that needs to scale up and down dynamically. With a simple web interface, you can add, commission, update and recycle your servers at will. As your needs change, you can respond rapidly, by adding new nodes and dynamically re-deploying them between services. When the time comes, nodes can be retired for use outside the MAAS. First test, impressions and some feedback.

<!--more-->

# MAASive disappointment

Before started I would like to inform everyone that MAAS was try on a virtual machines environnement using all the Ubuntu requirements like public and private network (2NIC) and also on bare metal servers. I won't dive into MAAS since the principe is fairly simple, it's a provisionning OS management system. This post is more like a bugs report. The main purpose of the post is not criticims, **not at all**. If a guy from Ubuntu see this, there is a comment section and I would appreciate reactions and advices too :). I made many efforts to debug, really. And by the way, I have nothing against Canonical/Ubuntu, I love and respect their work. Many I had to much expectation from the tool and didn't realized that it still was under developpement but anyway.

Accordingly to [the posts from Nicolas Barcet & Co](https://wiki.ubuntu.com/ServerTeam/MAAS), I followed each installation steps. I also tried the installation from the ISO boot (installation menu). My setup was simple:

* One master node within 2 NIC, one for the outside world and one for the private network.
* Several bare metal or virtual instances waiting and booting on PXE.

# Bug reports

* The most repetitive issue was **about the tftpd daemon** (logs from the MAAS server):

```
$ tail -f /var/log/syslog 
Apr 10 21:58:26 maas dnsmasq-dhcp[2859]: DHCPREQUEST(eth1) 10.0.100.101 00:50:56:26:43:14 
Apr 10 21:58:26 maas dnsmasq-dhcp[2859]: DHCPACK(eth1) 10.0.100.101 00:50:56:26:43:14 
Apr 10 21:58:29 maas dnsmasq-dhcp[2859]: DHCPREQUEST(eth1) 10.0.100.144 00:50:56:2c:db:1d 
Apr 10 21:58:29 maas dnsmasq-dhcp[2859]: DHCPACK(eth1) 10.0.100.144 00:50:56:2c:db:1d 
Apr 10 21:58:29 maas in.tftpd[3162]: tftp: client does not accept options
```

This traces comes from the tftp client. It happened when the maas-slave node was sending `DHCPREQUEST` to the MAAS server. We can see some exchange on the screen of the maas-slave but nothing more, the initiate sequence just freeze...

* **Issue invalid hostname.** During the installation process, I didn't select any options or interfer during the installation process.

![](/images/maas-invalid-hostname.png)

* **Issue preseed file.** Also during the installation process. 

![](/images/maas-failed-preseed.png)

I didn't really try to debug those 2 previous issues, because it's supposed to be working *out-of-the-box* and it's also the main goal of MAAS.

* **Try to delete a node? Get an Internal error from the web interface!**
So I tried to delete the node inside gobbler using the command line like so:

```
$ sudo cobbler system list
default
node-03aec994-834d-11e1-8db9-000c2996cb20
node-077e80b4-834d-11e1-baab-000c2996cb20
node-9c881a4a-8347-11e1-991b-000c2996cb20

$ sudo cobbler system remove --name node-9c881a4a-8347-11e1-991b-000c2996cb20
```

It still was on the interface. Then I re-tried to delete the node. And *Oh! Mother of delete...*

![](/images/maas-delete-node.png)

I thing I'm the only guy who saw this page... I finally understood that I was lucky this particular time, I tried and retried. I also enabled the debug mode in Django in this file `etc/maas/maas_local_settings.py`

```
DEBUG = True
```

Then I got this messy message:

![](/images/maas-delete-node-debug.png)

* **Issue: adding a node**

```
Unable to create Node: The provisioning service encountered a problem with the Cobbler server,
fault code 99: <type 'exceptions.UnicodeEncodeError'>:'ascii' codec can't encode character u'\xe8' 
in position 289: ordinal not in range(128) 
If the error message is not clear, you may need to check the Cobbler logs in /var/log/cobbler/ or pserv.log.
```

### One more thing

Normally, if things can go further, we are supposed to use juju. When I was walking into the configuration files I found this file and I was concerned about his content:

```
$ sudo cat /etc/maas/import_isos 

#RELEASES="oneiric precise"
RELEASES="precise"
#ARCHES="amd64 i386"
#PRIORITY="critical"
#LOCALE="en_US"
#INTERFACE="eth0"
#CONSOLE="ttyS0,9600n8"
#KOPTS="priority=$PRIORITY locale=$LOCALE netcfg/choose_interface=$INTERFACE console=$CONSOLE"
## Juju Management Classes
#MGMTCLASS_AVAILABLE="maas-juju-available"
#MGMTCLASS_ACQUIRED="maas-juju-acquired"
```

How MaaS is supposed to work without juju support enable?
I’m aware of those options, there were in Orchestra too. Here available means `available for juju` and acquired means `taken by juju`.

Nothing was working properly, in 15 test machines I was able to deploy "something" successfully manually because the node wasn't able to load the preseed file from the MaaS server. It was very random.
At the end, I'm pretty disappointing, there were some many problems. I will truly say that the previous versious (called Orchestra) was fairly more stable. But ok, this tool is still under developpement and expected for 12.04. Next LTS is on the way, so the developpers have 2 weeks to release something stable. For sure MAAS is not currently ready for the prime time, but it might have a bright future if it get strong developments. I pretty excited to see the result for Precise :).
