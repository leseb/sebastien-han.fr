---
title: The War for Open Source Clouds
date: 2012-05-08 21:26:00
slug: the-war-for-open-source-clouds
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![OpenStack VS Cloudstack](/images/openstack-vs-cloudstack.png)

Little study about the recent release of CloudStack as Apache Licence. Little battle between OpenStack and CloudStack, FIGHT!

<!--more-->

<h2>Overview</h2><link rel="stylesheet" href="http://www.compareninja.com/template/skins/Classic/skin.css" type="text/css">
<div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="cat title" style="width: 33%; "></td><td class="title" style="width: 33%; "><div class="">OpenStack</div></td><td class="title" style="width: 33%; "><div class="">CloudStack</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Started</div></td><td style="width: 33%; " class="text"><div class="">2010</div></td><td style="width: 33%; " class="text"><div class="">2008</div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Langage</div></td><td style="width: 33%; " class="text"><div class="">Python</div></td><td style="width: 33%; " class="text"><div class="">Java</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Release cycle</div></td><td style="width: 33%; " class="text"><div class="">6 months</div></td><td style="width: 33%; " class="text"><div class="">6 months</div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Current version</div></td><td style="width: 33%; " class="text"><div class="">5</div></td><td style="width: 33%; " class="text"><div class="">3</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Licensing</div></td><td style="width: 33%; " class="text"><div class="">Apache</div></td><td style="width: 33%; " class="text"><div class="">Apache</div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Category</div></td><td style="width: 33%; " class="text"><div class="">Framework</div></td><td style="width: 33%; " class="text"><div class="">Cloud operating system</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Lead by</div></td><td style="width: 33%; " class="text"><div class="">Community</div></td><td style="width: 33%; " class="text"><div class="">Citrix</div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Driven by</div></td><td style="width: 33%; " class="text"><div class="">Rackspace</div></td><td style="width: 33%; " class="text"><div class="">Citrix</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Contributors</div></td><td style="width: 33%; " class="text"><div class="">160</div></td><td style="width: 33%; " class="text"><div class="">16</div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Site</div></td><td style="width: 33%; " class="text"><div class="">http://www.openstack.org</div></td><td style="width: 33%; " class="text"><div class="">http://www.cloudstack.org</div></td></tr></tbody></table></div>

<br />

<h2>Distro ready</h2><link rel="stylesheet" href="http://www.compareninja.com/template/skins/Classic/skin.css" type="text/css">
<div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="cat title" style="width: 33%; "></td><td class="title" style="width: 33%; "><div class="">OpenStack</div></td><td class="title" style="width: 33%; "><div class="">CloudStack</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Ubuntu</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Debian</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="no"></div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">OpenSUSE</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="no"></div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">REHL</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">CentOS</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Fedora</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="no"></div></td></tr></tbody></table></div>

<br />

<h2>Core components</h2> <div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="title" style="width: 33%; "><div class="">OpenStack</div></td><td class="title" style="width: 33%; "><div class="">CloudStack</div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">Nova</div></td><td style="width: 33%; " class="text"><div class=""> All-in-one </div></td></tr><tr><td style="width: 33%; " class="text"><div class="">Swift</div></td><td style="width: 33%; " class="text"><div class="">One cloud management machine</div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">Glance</div></td><td style="width: 33%; " class="text"><div class="">X hypervisors nodes</div></td></tr><tr><td style="width: 33%; " class="text"><div class="">Keystone</div></td><td style="width: 33%; "><div class="text"></div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">Horizon</div></td><td style="width: 33%; "><div class="text"></div></td></tr></tbody></table></div>

<br />

<h2>Hypervisor support</h2><link rel="stylesheet" href="http://www.compareninja.com/template/skins/Classic/skin.css" type="text/css">
<div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="cat title" style="width: 33%; "></td><td class="title" style="width: 33%; "><div class="">OpenStack</div></td><td class="title" style="width: 33%; "><div class="">CloudStack</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">KVM</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">VmWare</div></td><td style="width: 33%; "><div class="yes"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Xen</div></td><td style="width: 33%; "><div class="partial"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Oracle VM</div></td><td style="width: 33%; "><div class="no"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Hyper-V</div></td><td style="width: 33%; "><div class="no"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">XenServer</div></td><td style="width: 33%; "><div class="no"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Xen Cloud Platform</div></td><td style="width: 33%; "><div class="no"></div></td><td style="width: 33%; "><div class="yes"></div></td></tr></tbody></table></div>

<br />

<h2>Relevant Features</h2> <div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="title" style="width: 33%; "><div class="">OpenStack</div></td><td class="title" style="width: 33%; "><div class="">CloudStack</div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">Mature object storage (swift)</div></td><td style="width: 33%; " class="text"><div class="">Out-of-the-box</div></td></tr><tr><td style="width: 33%; " class="text"><div class="">Nova core fairly stable</div></td><td style="width: 33%; " class="text"><div class="">Robust compute core</div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">Hype</div></td><td style="width: 33%; " class="text"><div class="">Well documented</div></td></tr><tr><td style="width: 33%; " class="text"><div class="">Trendy marketing impact</div></td><td style="width: 33%; " class="text"><div class="">Rich Management User Interface (company/customer side)  </div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">   </div></td><td style="width: 33%; " class="text"><div class="">Native AWS API set </div></td></tr></tbody></table></div>

<br />

<h2>Biggest Lacks</h2> <div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="title" style="width: 33%; "><div class="">OpenStack</div></td><td class="title" style="width: 33%; "><div class="">CloudStack</div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">Networking management, will be solved with Quantum in Folsom release </div></td><td style="width: 33%; " class="text"><div class="">No object storage</div></td></tr><tr><td style="width: 33%; " class="text"><div class="">   </div></td><td style="width: 33%; " class="text"><div class="">Less attention and participation than OpenStack</div></td></tr><tr class="second"><td style="width: 33%; " class="text"><div class="">    </div></td><td style="width: 33%; " class="text"><div class="">Community</div></td></tr></tbody></table></div>

<br />

<h2>Community statistics</h2> <div id="tableWrapper" style="width: 100%; "><table id="vsTable"><tbody><tr><td class="cat title" style="width: 33%; "></td><td class="title" style="width: 33%; "><div class="">OpenStack</div></td><td class="title" style="width: 33%; "><div class="">CloudStack</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Forum total posts</div></td><td style="width: 33%; " class="text"><div class="">1853</div></td><td style="width: 33%; " class="text"><div class="">4241</div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Forum total topics</div></td><td style="width: 33%; " class="text"><div class="">458</div></td><td style="width: 33%; " class="text"><div class="">1247</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Forum total users</div></td><td style="width: 33%; " class="text"><div class="">633</div></td><td style="width: 33%; " class="text"><div class="">8269</div></td></tr><tr><td class="cat" style="width: 33%; "><div class="">Mailing list messages</div></td><td style="width: 33%; " class="text"><div class="">9604</div></td><td style="width: 33%; " class="text"><div class="">539</div></td></tr><tr class="second"><td class="cat" style="width: 33%; "><div class="">Mailing list active members</div></td><td style="width: 33%; " class="text"><div class="">2907</div></td><td style="width: 33%; " class="text"><div class="">???</div></td></tr></tbody></table></div>

##What’s next?##

OpenStack cloud gains version, loses Citrix

* Experts immediately said that there is no big impact for OpenStack
* OpenStack Swift win!
* OpenStack breakthrough for Folsom release ? (Quantum addition) 

[http://gigaom.com/cloud/5-takeaways-from-the-cloudstack-openstack-dustup/]()

<br />

---

<br />

#CloudStack released as Apache license

## About the recent CloudStack license release

This action was well planned by Citrix and has several goals:

* Attract new contributors and developers
* Increase the product visibility
* Big boost for the developments and community

##Why now?

* Eclipsing the new release of OpenStack
* 2 weeks after the Amazon and Eucalyptus partnership ; joined forces to lock public and private cloud
* Citrix officials said during a conference call they wanted a platform that would embrace Amazon Web Services, the market-leading IaaS provider, and they did not believe OpenStack does that.

##Citrix evil plan?

By releasing CloudStack has Apache license Citrix fractured the open-source cloud alliance against Amazon and in the meantime abandoned the Olympus project

* Increase adoption of his platform
* AWS API win!
* Rise of the XenServer?

But what Citrix will do after many years of adoption? (if CloudStack overcame OpenStack)

Bad future scenario

> At the end you will be able to run your critical applications in your private cloud using CloudStack under an OpenStack swift layer (funny), from time to time you will need extra instances or simply need to run a public cloud. De facto you will use both AWS API and Eucalyptus tools to manage it. Eucalyptus tools will help you to migrate your workloads between your CloudStack private cloud and Amazon Web Services. This will bring you facilities to create, manage and maintain your hybrid cloud.


Note: The tables were created with [http://www.compareninja.com](Compare Ninja)
