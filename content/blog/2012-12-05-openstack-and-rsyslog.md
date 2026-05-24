---
title: Openstack and rsyslog
date: 2012-12-05 17:12:00
slug: openstack-and-rsyslog
draft: false
categories: ["openstack"]
tags: ["openstack"]
---

![Openstack and rsyslog](/images/openstack-rsyslog.jpg)

I don't want to see my logs poluted by `INFO` messages saying "hey, I'm running!". No thanks, it burns my I/O cycles for nothing. If it doesn't work I have a monitoring system for that and if it's broken I simply change the log level to `DEBUG`. Of course it's personal thoughts, however for those you who are interested just click ;-).

<!--more-->

# I. OpenStack logs

## I.1. Nova

Nova flags that changes Nova log behavior:

    syslog_log_facility=LOG_LOCAL0
    use_syslog=yes

And then restart target services.

<span class="text_quote">R </span> Note: you can also use `/etc/nova/logging.conf` to precisely control the logging module. To enable it, you need to add the following flag to your `nova.conf`. 

    log-config=/etc/nova/logging.conf

One section that you might want to play with is:

    [logger_nova]
    level = INFO
    handlers = stderr
    qualname = nova

Try put something like `WARNING` instead of `INFO`.

## I.2. Keystone

See the `keystone.conf` file:

    verbose = False
    debug = False
    use_syslog = True
    syslog_log_facility = LOG_LOCAL0

## I.3. Glance

See the `glance-api.conf` file:

    verbose = False
    debug = False
    use_syslog = True
    syslog_log_facility = LOG_LOCAL0

See the `glance-registry` file:

    verbose = False
    debug = False
    use_syslog = True
    syslog_log_facility = LOG_LOCAL0

## I.4. Cinder

See the `cinder.conf` file:

    verbose = False
    debug = False
    use_syslog = True
    syslog_log_facility = LOG_LOCAL0

<br />

<span class="text_quote">W </span>Important: **I advise you to configure one local facility per daemon, this provides better isolation and more flexibility. You migh want log certain facility at different level.**

<br />

# II. Rsyslog setup

Nowadays, Rsyslog comes by default in most of the distributions, so there is no need to install it.

## II.1. Centralized log server

Centralized server minimal configuration:

    # provides TCP syslog reception
    $ModLoad imtcp
    $InputTCPServerRun 1024

Create a filter rule on the master server which looks for an hostname called `compute-01`:

    :hostname, isequal, "compute-01" /mnt/rsyslog/logs/compute-01.log

This was just an example if you want to segment log entries in compute nodes, one file per compute based on the hostname.

## II.2. Client

Slave configuration, machine that sends out messages. Create a file `/etc/rsyslog.d/60-nova.conf` and append the following content:

    # prevent debug from dnsmasq with the daemon.none parameter
    *.*;auth,authpriv.none,daemon.none              -/var/log/syslog

Note that you can also log specific facility and level to a file:

    local0.*                    -/var/log/nova-all.log

I am not a big fan of this solution because basically logs are written twice, in syslog and in the file you specified... If anybody knows how to redirect directly the message to a file without writting to syslog ;-).

Send messages to the central server, here I specified the facility `LOCAL0` and a log level on `ERROR`, I don't want to send out all the messages, it doesn't make sense (at least for me^^):

    local0.error    @@172.20.1.43:1024

Eventually restart your rsyslog daemon.

<br />

# III. Bonus

OpenStack component flags behavior:

| Flag     | Status        | Flag        | Log                         |
|----------|---------------|-------------|-----------------------------|
| Scenario | verbose=true  | debug=true  | DEBUG, ERROR, WARNING, INFO
| Scenario | verbose=false | debug=true  | DEBUG, ERROR, WARNING, INFO
| Scenario | verbose=true  | debug=false | WARNING, INFO
| Scenario | verbose=false | debug=false | WARNING, ERROR

<br />
<br />

> This was brief, rsyslog can be way more complicated than that, but I assume this little shot migh be enough for some of you. If you want to go further with rsyslog I expressly recommend this amazing [white paper from Canonical](http://www.canonical.com/about-canonical/resources/white-papers/centralised-logging-rsyslog). It found it clearer than the official documentation, at least a better structure. Enjoy your OpenStack centralized logs!
