---
title: Simple SSH Whitelist
date: 2012-03-22 19:06:00
slug: simple-ssh-whitelist
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

SImple SSH whitelist

<!--more-->

```
#!/bin/sh

### BEGIN INIT INFO
# Provides: Firewalling rules
# Required-Start:
# Required-Stop:
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: enable SSH whitelist on boot
# Description:
### END INIT INFO

IPTABLE=/sbin/iptables

IP_GRANTED=192.168.146.1

# Flush all the tables and rules
$IPTABLE -t filter -F

# Flush personnal rules
$IPTABLE -t filter -X

# Don't break current connections
$IPTABLE -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
$IPTABLE -A OUTPUT -m state --state RELATED,ESTABLISHED -j ACCEPT

# White list SSH
$IPTABLE -N SSH_WHITELIST
$IPTABLE -A SSH_WHITELIST -s $IP_GRANTED -m recent --remove --name SSH -j ACCEPT

$IPTABLE -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH
$IPTABLE -A INPUT -p tcp --dport 22 -m state --state NEW -j SSH_WHITELIST

$IPTABLE -A INPUT -m state --state NEW -p tcp --dport 22 -j DROP
```

