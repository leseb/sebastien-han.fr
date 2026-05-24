---
title: Delete a VM in error state (Folsom)
date: 2012-10-08 17:26:00
slug: delete-a-vm-in-error-state-folsom
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

Little update of my [previous script](http://www.sebastien-han.fr/blog/2012/07/10/delete-a-vm-in-an-error-state/) for Folsom.

<!--more-->


```bash
#!/bin/bash

echo "Enter your MySQL user"
read MYSQL_USER

echo "Enter your MySQL user password"
read MYSQL_PASSWD

echo "Enter your MySQL host"
read MYSQL_HOST

mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM security_group_instance_association WHERE id IN (SELECT id FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM block_device_mapping WHERE instance_uuid IN (SELECT uuid FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM instance_info_caches WHERE instance_uuid IN (SELECT uuid FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM instance_system_metadata WHERE instance_uuid IN (SELECT uuid FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM virtual_interfaces WHERE instance_uuid IN (SELECT uuid FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; UPDATE fixed_ips SET allocated = 0 WHERE instance_uuid IN (SELECT uuid FROM instances WHERE vm_state = "error");'
mysql -u$MYSQL_USER -p$MYSQL_PASSWD -h$MYSQL_HOST -e 'USE nova; DELETE FROM instances WHERE vm_state = "error";'
```

<br />

> Enjoy ;-)
