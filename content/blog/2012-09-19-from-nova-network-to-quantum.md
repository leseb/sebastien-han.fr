---
title: From nova-network to quantum
date: 2012-09-25 14:59:00
slug: from-nova-network-to-quantum
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![From nova-network to quantum](/images/from-nova-network-to-quantum.jpg)

Before starting anything I'd like highlight the fact that this article was co-written with [Emilien Macchi](http://my1.fr/), who has a better expertise on Quantum that I do. In this article, we focused on both aspects of `nova-network` and `quantum`. We did **not** want to compare the two or similarly make them take each other head-on. This article is just a step back about the state of the networking in OpenStack. Basically what did we lose and what did we gain?

<!--more-->

We are **always** in a bad timeline... To be honest I am. It's time for building our Cloud and Folsom is about to be released this thursday (27th). But the point is, my knowledge of ESSEX is way better than Folsom. I needed to clarify and learned how quantum works. Is it a good solution according to our setup? A lot of questions popped into my mind. Some thoughts that I'd like to share with you, community :).

<br />
<br />

<h2>OVERVIEW </h2>
<link rel="stylesheet" href="http://www.compareninja.com/template/skins/Classic/skin.css" type="text/css">
<div id="tableWrapper" style="width: 100%;">
    <table id="vsTable">
        <tbody>
            <tr>
                <td class="title" style="width: 11%; "><div class=""></div></td>
                <td class="title" style="width: 11%; "><div class="">Dashboard support</div></td>
                <td class="title" style="width: 11%; "><div class="">Dashboard Floating IP</div></td>
                <td class="title" style="width: 11%; "><div class="">Multi host</div></td>
                <td class="title" style="width: 11%; "><div class="">VLAN</div></td>
                <td class="title" style="width: 11%; "><div class="">Support</div></td>
                <td class="title" style="width: 11%; "><div class="">Basic networking (Flat and Flat DHCP)</div></td>
                <td class="title" style="width: 11%; "><div class="">Use case</div></td>
                <td class="title" style="width: 11%; "><div class="">Tunneling</div></td>
                <td class="title" style="width: 11%; "><div class="">Scalability</div></td>
                <td class="title" style="width: 11%; "><div class="">SDN</div></td>
                <td class="title" style="width: 11%; "><div class="">Sec groups</div></td>
            </tr>
            <tr class="second">
                <td class="cat" style="width: 11%; ">Quantum</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="no"></div>will be backported to stable/folsom</td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">Essex : Quantum V1 / Folsom : Quantum V2</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">Advanced L2 Isolation, Automated routing, Highest security, SDN ready</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">Yes but for 1 NIC, and without namespaces</td>
            </tr>
            <tr>
                <td class="cat" style="width: 11%; ">Nova Network</td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">In Essex : Quantum V1 / In Folsom : use nova-network OR quantum V2</td>
                <td style="width: 11%; "><div class="yes"></div></td>
                <td style="width: 11%; ">Basic VLAN Isolation, Basic IPAM with Melange</td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="no"></div></td>
                <td style="width: 11%; "><div class="yes"></div></td>
            </tr>
        </tbody>
    </table>
</div>
<br />
<br />
<br />

> This article did not set out to compare the two or similaly make them take each other head-on. However, if this had been the case, some of you would have put your money on `nova-network` because it's difficult to justify the benefit of Quantum  if they don’t need advanced networking. Furthermore for the people who use Folsom, it's not a mandatory requirement, which is a good decision made by the project developers. Also note that the gap between nova-network and quantum is pretty huge, people who want VLAN can simply use nova-network. At this point it's more a scabality limitation. We both sincerely hope that you'll find this article useful, more articles about Quantum are coming before Folsom official release, so stay tuned ;-)

One more thing, we truly advice you to have a look at this [discussion on the OpenStack Dev ML](http://www.gossamer-threads.com/lists/openstack/dev/18373) launched by Dan Wendlandt, PTL Quantum.
