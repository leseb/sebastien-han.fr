---
title: OpenStack Havana flush token manually
date: 2013-09-06 15:05:00
slug: openstack-havana-flush-token-manually
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

It has always been a huge pain to manage token in MySQL espacially with PKI token since they are larger than UUID token.
Almost a year ago I wrote [an article to purge token via a script](http://www.sebastien-han.fr/blog/2012/12/12/cleanup-keystone-tokens/).
So finally, we have an easy option to purge all expired token.

<!--more-->

```bash
$ sudo keystone-manage token_flush
```

Script to execute periodically:

```bash
#!/bin/bash

# Purpose of the script
# Everytime a service wants to be do 'something' it has to retrieve an autentication token
# Nova/Glance/Cinder services are manage by Pacemaker and monitor functions (from the RA) ask for a token every 10 sec
# There is no cleanup procedure nor periodical task running to delete expire token

logger -t keystone-cleaner "Starting token cleanup"
keystone-manage token_flush
logger -t keystone-cleaner "Ending token cleanup"

exit 0
```

For those of you who are curious this is what the command does:

    DELETE FROM token WHERE token.expires < %s' (datetime.datetime(2013, 11, 19, 15, 20, 26, 115332),)

Where `2013, 11, 19, 15, 20, 26, 115332` are your current date and time.

<br />

> Hope it helps!
