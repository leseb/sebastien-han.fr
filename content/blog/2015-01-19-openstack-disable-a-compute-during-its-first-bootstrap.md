---
title: "OpenStack: disable a compute node during its first bootstrap"
date: 2015-01-19 05:48:00
slug: openstack-disable-a-compute-during-its-first-bootstrap
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

For operationnal reasons, you might not want to automatically make your compute node available.
With the following flag, during its first bootstrap the compute node will register itself to the service list.
However it will be disabled, so virtual machines can not be scheduled on it:

    enable_new_services=False

<!--more-->
