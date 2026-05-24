---
title: "Tips: Hardening SSH"
date: 2012-01-15 01:26:00
slug: tips-hardening-ssh
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/Secure-SHell.png)

Sécurisons SSH (oui oui !)

<!--more-->

Je poste ici une configuration SSH optimisée et très sécurisée:

```
## Hardening ssh conf Leseb
# Port
Port 22 
 
# Protocol to use
Protocol 2
 
#ListenAddress votre_ip
 
# Automatically disconnect session due to inactivity (5min)
ClientAliveInterval 300
ClientAliveCountMax 0
 
# Restrict SSH access to user groups
AllowGroups ssh-users
 
# KeyBit Lenght
ServerKeyBits 1024
 
# Enable a warning banner
Banner /etc/issue
 
# Disable empty passwords
PermitEmptyPasswords no
 
# Disable root ssh login
PermitRootLogin no
 
# No not allow users to set environment options
PermitUserEnvironment no
 
# Disable key authentification
PubkeyAuthentication yes
 
# Ignore SSH can emulate the behavior of the obsolete rsh command, just disable insecure access via RSH
IgnoreRhosts yes
 
# Enable password authentification
PasswordAuthentication no
 
# Disable host-based authentication
HostbasedAuthentication no
 
# Pam + ssh
UsePAM yes
 
# Enable tunneling compression 
Compression yes
 
# Hardening
AllowTcpForwarding no
X11Forwarding no
 
# Check file permission (ssh keys, know hosts...)
StrictModes yes
 
# Use only approved Ciphers in Counter mode
Ciphers aes128-ctr,aes192-ctr,aes256-ctr
```

Bien entendu ce script est disponible sur mon Github 

Enjoy!
 
