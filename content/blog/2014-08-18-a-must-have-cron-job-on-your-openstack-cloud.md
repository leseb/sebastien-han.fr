---
title: A must-have cron job on your OpenStack Cloud
date: 2014-08-18 11:46:00
slug: a-must-have-cron-job-on-your-openstack-cloud
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![A must-have cron job on your OpenStack Cloud](/images/a-must-have-cron-job.jpg)

Running OpenStack on production can be difficult, so every optimizations are good to take :).

<!--more-->

Basically, this script flushes expired tokens and moves deleted instance to other tables.
You want to run this script _only_ on one of your cloud controllers.

```bash
#!/bin/bash

# 1. Purge expired tokens
# 2. Move deleted instances to another table that you MUST not backup,
# unless you have data retention policies.

MAX_ROWS=100

logger -t keystone-cleaner "Starting token cleanup"
/usr/bin/keystone-manage token_flush
logger -t keystone-cleaner "Ending token cleanup"

logger -t deleted-rows-archiver "Starting archiving deleted rows"
/usr/bin/nova-manage db archive_deleted_rows --max_rows $MAX_ROWS
logger -t deleted-rows-archiver "Ending archiving deleted rows"

exit 0
```

Depending on the amount of deleted instances that you get on a daily basis you'd like to modify the `MAX_ROWS` variable.

<br />

> Running these two tasks on a daily basis and ideally prior to running your databases backup is a good start.
