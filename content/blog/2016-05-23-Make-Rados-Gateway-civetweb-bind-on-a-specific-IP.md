---
title: Make Rados Gateway (civetweb) bind on a specific IP
date: 2016-05-23 21:52:24
slug: Make-Rados-Gateway-civetweb-bind-on-a-specific-IP
draft: false
categories: []
tags: []
---

Quick tip on how to configure Rados Gateway to listen on a specific IP address when configured to use Civetweb.

<!--more-->

Assuming your IP is 192.168.0.1.
Append the following in your `[client.rgw.<name>]` section:

```
rgw_frontends = civetweb port=192.168.0.1:8080
```
