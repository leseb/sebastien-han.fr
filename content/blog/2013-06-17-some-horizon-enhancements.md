---
title: Some horizon enhancements
date: 2013-06-17 13:41:00
slug: some-horizon-enhancements
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

The road to Havana is long, no milestone in the corner yet, but already some enhancements have been brought to the Horizon interface. Let's take a quick look at the new fancy stuff!

<!--more-->

<br />

# I. User side

Overview and usage page:

![Horizon Overview](/images/horizon-overview.jpg)

Ability to create a volume from an image:

![Horizon Create Volume From Image](/images/horizon-create-vol-from-img.jpg)

Launch instance --> Availability Zone:

![Horizon AZ](/images/horizon-az.jpg)

Launch instance --> Admin password:

![Horizon Admin Pass](/images/horizon-adminpass.jpg)

Add a new rule in your security group:

![Horizon Sec Group Rules](/images/horizon-sec-rules.jpg)

<br />

# II. Admin side

Create a volume type (multi-backend):

![Horizon Volume Type](/images/horizon-voltype.jpg)

Managing groups and roles:

![Horizon Group Role](/images/horizon-group-roles.jpg)

<br />

# III. Settings

Change your password:

![Horizon Change Password](/images/horizon-change-passwd.jpg)

Item per page:

![Horizon Item per Page](/images/horizon-item-per-page.jpg)

<br />

> If you want to enjoy all the new features, you can always build the dashboard from the upstream ([git repo](https://github.com/openstack/horizon)). The good thing with the horizon dashboard is that you can always work with the master branch. You won't encounter any problems given that the Horizon dashboard only relies on the APIs, if there is something that you can't do or if you get prompted by an error, it just means that your OpenStack version is too old. Then the feature that you're trying to access is not available.
