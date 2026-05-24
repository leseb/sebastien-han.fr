---
title: Configure Ubuntu 12.04 to use SOL
date: 2013-08-05 14:22:00
slug: configure-ubuntu-12-dot-04-to-use-sol
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![Configure Ubuntu 12.04 to use SOL](/images/ipmi-sol.jpg)

SOL: Serial Over Line is a wonderful feature that redirects your server's console thanks to the goodness of IPMI.

<!--more-->

<br />

## I. Setup

Serial Overline:

    # ttyS1 - getty
    #
    # This service maintains a getty on ttyS1 from the point the system is
    # started until it is shut down again.

    start on stopped rc or RUNLEVEL=[2345]
    stop on runlevel [!2345]

    respawn
    exec /sbin/getty -L 115200 ttyS1 vt102

Then start it manually:

```bash
$ sudo start
```

At the next boot sequence, upstart will automatically start it.

Grub config:

    GRUB_CMDLINE_LINUX="console=tty0 console=ttyS0,115200n8"

    # Uncomment to disable graphical terminal (grub-pc only)
    GRUB_TERMINAL="console serial"
    GRUB_SERIAL_COMMAND="serial --speed=115200 --unit=0 --word=8 --parity=no --stop=1"

Finally update grub:

```bash
$ sudo update-grub
Generating grub.cfg ...
Found linux image: /boot/vmlinuz-3.8.0-26-generic
Found initrd image: /boot/initrd.img-3.8.0-26-generic
Found linux image: /boot/vmlinuz-3.2.0-23-generic
Found initrd image: /boot/initrd.img-3.2.0-23-generic
done
```

<br />

## II. Use it

Through IPMI (install ipmi-tools first):

```bash
$ sudo ipmitool -I lanplus -H 10.66.6.119 -U root sol activate
Password:
[SOL Session operational.  Use ~? for help]

                            16 GB Installed

ProLiant System BIOS - J03 (12/14/2012)
Copyright 1982, 2012 Hewlett-Packard Development Company, L.P.



1 Processor(s) detected, 4 total cores enabled, Hyperthreading is not supported
Proc 1:  Intel(R) Xeon(R) CPU E5-2603 0 @ 1.80GHz

HP Power Profile Mode: Balanced Power and Performance
Power Regulator Mode: Dynamic Power Savings

Redundant ROM Detected - This system contains a valid backup System ROM.

Inlet Ambient Temperature: 30C/86F
Advanced Memory Protection Mode: Advanced ECC Support
HP SmartMemory authenticated in all populated DIMM slots.
...
...
...
...
```

After a couple of minutes, you'll get your login's prompt.

How to use it:

```bash
root@hp:~# ~?
Supported escape sequences:
  ~.  - terminate connection (and any multiplexed sessions)
  ~B  - send a BREAK to the remote system
  ~C  - open a command line
  ~R  - Request rekey (SSH protocol 2 only)
  ~^Z - suspend ssh
  ~#  - list forwarded connections
  ~&  - background ssh (when waiting for connections to terminate)
  ~?  - this message
  ~~  - send the escape character by typing it twice
(Note that escapes are only recognized immediately after newline.)
```

And of course, as soon as you're done playing with it:

```bash
$ sudo ipmitool -I lanplus -H 10.66.6.119 -U root sol deactivate
Password:
Info: SOL payload already de-activated
```

<br />

> No more JAVA console! :D
