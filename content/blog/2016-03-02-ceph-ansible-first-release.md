---
title: Ceph Ansible first release
date: 2016-03-02 12:08:00
slug: ceph-ansible-first-release
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

![Ceph Ansible first release](/images/ceph-ansible-first-release.png)

Ceph Ansible started as a personnal project, the reason was simple I wanted to have an in-depth look at [Ansible](http://www.ansible.com/).
Thus I immediatly thought, why not try to deploy Ceph with Ansible.
Moreover, I have never been a huge of Puppet and ceph-deploy was a couple of months old, so to me Ansible was the right answer.

<!--more-->

After almost 2 years of developement ([first commit](https://github.com/ceph/ceph-ansible/commit/a984854956792c8d21802e9a11888cdb50936ed5)), I am glad to annonce that ceph-ansible will now a release cycle process.
With the help of [git tags](http://git-scm.com/book/en/v2/Git-Basics-Tagging), we will be providing point in time releases with new features.

From the past 2 years, ceph-ansible has seen some [good contributions](https://github.com/ceph/ceph-ansible/graphs/contributors).

Now, let me give you some news about ceph-ansible latest capabilities:

* CI to test each pull request
* Roles available on [Ansible Galaxy](https://galaxy.ansible.com/) and part of the Ceph organization
* Support for all the Ceph releases
* Support for RHEL and RHCS
* Support for Ansible v2
* Improve package upgrade logic for rolling update
* Support for `dnf`
* Support for `systemd`
* Support for more templating options (use variables to populate the `ceph.conf`)
* Scan network ports to avoid firewalling issues

And many more!

Since Ansible has an option to run  `cowsay` and since I like the cartoon "[Cow and Chicken](https://en.wikipedia.org/wiki/Cow_and_Chicken)" I've been thinking of using [characters names](http://cartoonnetwork.wikia.com/wiki/Category:Cow_and_Chicken_Characters) for the releases :).
Thus the first one is named "[Chicken](http://cartoonnetwork.wikia.com/wiki/Chicken)".
There are not so much characters (apparently 20), so this won't last long.

<br />

> As a personnal project, I really see this as an achievement so I'd like to thank everyone for their support!
You can check out the [release on Github](https://github.com/ceph/ceph-ansible/releases/tag/v1.0.0).
