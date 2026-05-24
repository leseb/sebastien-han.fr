---
title: Delete a VM in an error state
date: 2012-07-10 17:00:00
slug: delete-a-vm-in-an-error-state
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Quick script to delete all the intances in `error state`.

<!--more-->


```bash
#!/bin/bash

echo "Enter your MySQL user"
read MYSQL_USER

echo "Enter your MySQL user password"
read MYSQL_PASSWD

echo "Enter your MySQL host"
read MYSQL_HOST

mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM security_group_instance_association WHERE instance_id IN (SELECT id FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM block_device_mapping WHERE instance_id IN (SELECT id FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM instance_info_caches WHERE instance_id IN (SELECT uuid FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; UPDATE fixed_ips SET allocated = 0 WHERE instance_id IN (SELECT id FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM instances WHERE vm_state = "error";'
```

The same operation can be performed for VMs stuck in deleting state.
