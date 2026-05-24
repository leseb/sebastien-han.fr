---
title: Configure Rados Gateway Civetweb with SSL 
date: 2016-05-25 14:26:51
slug: Configure-Rados-Gateway-Civetweb-with-SSL
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Quick tip on how to configure SSL with Civetweb on Rados Gateway.

<!--more-->

Append the following in your `[client.rgw.<name>]` section:

```
rgw_frontends = civetweb port=443s ssl_certificate=/path/to/your/cert.pem
```
