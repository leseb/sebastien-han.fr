---
title: Quantum plugin comparison
date: 2012-09-28 11:23:00
slug: quantum-plugin-comparison
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Quantum plugin comparison](/images/quantum-plugin.jpg)

Folsom has been released, it's probably time for some of you to deploy OpenStack. This is a follow up to the article titled [From nova-network to Quantum](http://www.sebastien-han.fr/blog/2012/09/25/from-nova-network-to-quantum/). One of the main question with Folsom is: which Quantum plugin should I use? The answer could be in this article! Another article co-written with [Emilien Macchi](http://my1.fr/). Deep dive into the available plugins in Quantum for OpenStack Folsom.

<!--more-->

First, the big picture of the plugins available.

<h2> Overview</h2>
<link rel="stylesheet" href="http://www.compareninja.com/template/skins/Classic/skin.css" type="text/css">
<div id="tableWrapper" style="width: 100%;">
    <table id="vsTable">
        <tbody>
            <tr>
                <td class="title" style="width: 11%; "><div class="">Networking Solution</div></td>
                <td class="title" style="width: 11%; "><div class="">Quantum Plugin</div></td>
                <td class="title" style="width: 11%; "><div class="">Company / Organization</div></td>
                <td class="title" style="width: 11%; "><div class="">License</div></td>
                <td class="title" style="width: 11%; "><div class="">Essex ready</div></td>
                <td class="title" style="width: 11%; "><div class="">Folsom ready</div></td>
                <td class="title" style="width: 11%; "><div class="">Plugin available via</div></td>
            </tr>
            <tr class="second">
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://floodlight.openflowhub.org">Floodlight OpenFlow Controller</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/floodlight/quantum-restproxy">restproxy</a></td>
                <td style="width: 11%; ">BigSwitch + Community</td>
                <td style="width: 11%; ">Apache 2.0</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; ">git</td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.bigswitch.com/">BigSwitch Controller</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/floodlight/quantum-restproxy">restproxy</a></td>
                <td style="width: 11%; ">BigSwitch</td>
                <td style="width: 11%; ">Commercial</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="partial"></div>?</td>
                <td style="width: 11%; ">git</td>
            </tr>
            <tr class="second">
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.midokura.com/midonet/">Midonet</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/midokura/midonet-openstack">midonet openstack</a></td>
                <td style="width: 11%; ">Midokura</td>
                <td style="width: 11%; ">Commercial</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="no"></div>Soon</td>
                <td style="width: 11%; ">git</td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://nicira.com/en/network-virtualization-platform">Network Virtualization Plateform</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/nicira">Nicira</a></td>
                <td style="width: 11%; ">Nicira / VMware</td>
                <td style="width: 11%; ">Commercial</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">git / ubuntu-repo</td>
            </tr>
            <tr class="second">
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://openvswitch.org">Open-vSwitch</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/openvswitch">OVS Plugin</a></td>
                <td style="width: 11%; ">Community</td>
                <td style="width: 11%; ">Apache 2.0</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">git / ubuntu-repo</td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.cisco.com/en/US/products/ps9402/index.html">Cisco Nexus, Cisco UCS blade Server</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/cisco">Cisco Plugin</a></td>
                <td style="width: 11%; ">Cisco</td>
                <td style="width: 11%; ">Commercial</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">git / ubuntu-repo</td>
            </tr>
                <tr><td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.linuxfoundation.org/collaborate/workgroups/networking/bridge">Linux Bridge</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/linuxbridge">LinuxBridge</a></td>
                <td style="width: 11%; ">Community</td>
                <td style="width: 11%; ">GPL</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">git / ubuntu-repo</td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="https://github.com/trema/trema">Trema with Sliceable Switch or any OpenFlow Controller</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/nec">NEC</a></td>
                <td style="width: 11%; ">NEC</td>
                <td style="width: 11%; ">Apache 2.0</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">git / ubuntu-repo</td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://osrg.github.com/ryu/">Ryu Operating System</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/ryu">RYU Plugin</a></td>
                <td style="width: 11%; ">OSRG</td>
                <td style="width: 11%; ">Apache 2.0</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">git / ubuntu-repo</td>

            </tr>
        </tbody>
    </table>
</div>

<br />
<br />

Then a comparison between all features:

<h2>FEATURES</h2>
<link rel="stylesheet" href="http://www.compareninja.com/template/skins/Classic/skin.css" type="text/css">
<div id="tableWrapper" style="width: 100%;">
    <table id="vsTable">
        <tbody>
            <tr>
                <td class="title" style="width: 11%; "><div class="">Networking Solution</div></td>
                <td class="title" style="width: 11%; "><div class="">Quantum Plugin</div></td>
                <td class="title" style="width: 11%; "><div class="">Use OpenFlow</div></td>
                <td class="title" style="width: 11%; "><div class="">Overlay tunneling</div></td>
                <td class="title" style="width: 11%; "><div class="">L2 Isolation</div></td>
                <td class="title" style="width: 11%; "><div class="">L3 routing</div></td>
                <td class="title" style="width: 11%; "><div class="">Load Balancing</div></td>
                <td class="title" style="width: 11%; "><div class="">High Availability</div></td>
                <td class="title" style="width: 11%; "><div class="">Firewalling</div></td>
                <td class="title" style="width: 11%; "><div class="">QoS</div></td>
                <td class="title" style="width: 11%; "><div class="">Rate limiting</div></td>
                <td class="title" style="width: 11%; "><div class="">Metering</div></td>
                <td class="title" style="width: 11%; "><div class="">Monitoring</div></td>
                <td class="title" style="width: 11%; "><div class="">IDS / IPS</div></td>
            </tr>
            <tr class="second">
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://floodlight.openflowhub.org">Floodlight OpenFlow Controller</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/floodlight/quantum-restproxy">restproxy</a></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with OpenFlow</td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.bigswitch.com/">BigSwitch Controller</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/floodlight/quantum-restproxy">restproxy</a></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with OpenFlow</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="partial"></div></td>
                <td style="width: 11%; "><div class="partial"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>  
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
            </tr>
            <tr class="second">
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.midokura.com/midonet/">Midonet</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/midokura/midonet-openstack">midonet openstack</a></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>Speaks to the OVS kernel module directly</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://nicira.com/en/network-virtualization-platform">Network Virtualization Plateform</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/nicira">Nicira</a></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with OpenFlow</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
            </tr>
            <tr class="second">
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://openvswitch.org">Open-vSwitch</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/openvswitch">OVS Plugin</a></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with OpenFlow or VLAN</td>
                <td style="width: 11%; "><div class="partial"></div>static</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="partial"></div>limited to one VIF per VM</td>
                <td style="width: 11%; "><div class="partial"></div>Manually</td>
                <td style="width: 11%; "><div class="partial"></div>Manually</td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.cisco.com/en/US/products/ps9402/index.html">Cisco Nexus, Cisco UCS blade Server</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/cisco">Cisco Plugin</a></td>
                <td style="width: 11%; "><div class="no"></div>(not yet)</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with VLAN</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="partial"></div>?</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="partial"></div>?</td>
            </tr>
                <tr><td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://www.linuxfoundation.org/collaborate/workgroups/networking/bridge">Linux Bridge</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/linuxbridge">LinuxBridge</a></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with VLAN</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="https://github.com/trema/trema">Trema with Sliceable Switch or any OpenFlow Controller</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/nec">NEC</a></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with OpenFlow</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="partial"></div>only NEC product OpenFlow controller</td>
                <td style="width: 11%; "><div class="partial"></div>only NEC product OpenFlow controller</td>
                <td style="width: 11%; "><div class="yes"></div>packetfilter extension API</td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="partial"></div>manually</td>
                <td style="width: 11%; "><div class="partial"></div>manually</td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">
                    <a target="_blank" href="http://osrg.github.com/ryu/">Ryu Operating System</a>
                </td>
                <td style="width: 11%; "><a target="_blank" href="https://github.com/openstack/quantum/tree/master/quantum/plugins/ryu">RYU Plugin</a></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div>with OpenFlow</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
            </tr>
        </tbody>
    </table>
</div>

<br >

More information:

* About Big Switch: there is a support for applications beyond network virtualization, Open APIs northbound, and support for physical switches.

<br />

As you can see some cell are filled with question mark. It's because we didn't find any information. We appreciate any input, which helps to entirely fulfill this table. Don't hesitate to leave a comment!

<br />

> This article showed a large panel of plugins for Quantum. I didn't really follow the Quantum development. To be honest it was a little bit unclear for me. Writing this table with my French friend Emilien gave me a good understanding of the topic. We expect that this will be the same for you readers ;-). Finally we sincerely hope that this article will help anyone who wants to go with Folsom + Quantum to choose the plugin which best suit their needs.
