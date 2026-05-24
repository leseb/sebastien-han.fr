---
title: Working with time
date: 2012-03-19 01:17:00
slug: managing-ntp
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/ntp.jpg)

I'm late, I'm late, For a very important date. No time to say "Hello, Goodbye". I'm late, I'm late, I'm late, I'm late!
When you setup a new environment, it's critical to setup the right and the same time on each servers.

<!--more-->

# Time design

Sometime an ugly but a relevant picture is better than a lot of explanations.

![](/images/ntp-architecture.jpg)

## What is the reference clock?

This one provides the most accurate time, the universal time. It's a sort of an atomic clock. In NTP langage, it's refer to the stratum 0.

## What is a stratum?

Basically, it's the distance between your current ntp server and the reference clock. By 'distance' understand number of servers. The closest server from the reference clock is called the stratum 1. Usually it is connected to the reference clock through a special link. Not a network link, some other dedicated and more accurate connection (serial connection or GPS connection for instance).

## NTP terminology

Here some commons NTP terms:

* `Jitter`, it's measurement of the variance in latency on the network.
* `Drift`, it's when the local clock becomes less accurate. The ntp daemon can take care of this variation.

# Managing NTP

There is 2 way to manage ntp. First you can use the `ntpd` daemon, it's continuous and re-adjust small differences. But it won't work if the time difference is too important. The second consists in using the `ntpdate` command. It acts as a 'one shot time' adjustment and takes effect immediatly. The only thing you have to be aware of is they can't work in the same time. It makes sense since they will use the same port. For instance, using the `ntpdate` command while the `ntpd` daemon is running will result by an error. Of course, the `ntpd` is already listenning on port 123. Before using the `ntpdate` command, stop the `ntpd` daemon.

First, download the ntp packages.

```
$ aptitude install -y ntp ntpdate
```
Check your system date:

```
$ date
Mar 17 avr 2012 22:50:31 CEST
```
Also check your current timezone:

```
$ cat /etc/timezone
Europe/Paris
```
You can easily change it like this:

```
$ dpkg-reconfigure tzdata
```

# Drift away!

Sometimes the time difference between your internal clock and the ntp server is too important. The ntpd daemon won't even try to correct it. Clocks have to be nearly in sync before starting `ntpd`. Of course this doesn't apply to `ntpdate`that will always set the clock according to the server reference, not matter of the time difference.
 
You can try to setup manually the date like this:

```
$ date 09011840
```

Wait a few seconds and see if the ntp daemon readjusted the time properly.

If it's not efficient stop the ntpd daemon:

```
$ service ntp stop
```

Let's say your current time is:

```
$ date
Sat Apr 14 23:11:24 EDT 2012
```

But it is currently `Sunday Apr 15 01:15`.

Usually you will use the `ntpdate` command like below:

```
$ ntpdate -s pool.ntp.org
```

On Debian, I recently discover this usefull command:

```
$ ntpdate-debian
```

Basicly this command will `ntpdate` the Debian ntp server.

# Tools

As a traceroute will do it, you can know your current position (your stratum) from the reference clock. The `ntptrace` will help you, just trace it!

```
$ ntptrace 
localhost: stratum 3, offset 0.063064, synch distance 0.010469
menotios.justforlulz.fr: stratum 2, offset 0.000054, synch distance 0.006375
ntp0.rrze.uni-erlangen.de: stratum 1, offset 0.000002, synch distance 0.000000, refid 'GPS'
```

Another way to walk throught the stratums layer using `ntpq`:

```
$ ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
     ==============================================================================
     *sip.dicode.nl   193.67.79.202    2 u   34   64    7   11.679   -1.415   1.379
     +panoramix.linoc 193.79.237.14    2 u   36   64    7   16.001    0.113   2.697
     +server.rickes.n 85.17.207.62     3 u   42   64    3   13.583    0.659   2.912
```

Hope it will help!
