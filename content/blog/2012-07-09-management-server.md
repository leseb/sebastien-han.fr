---
title: Management server
date: 2012-07-09 13:26:00
slug: management-server
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![Puppet Labs](/images/puppet-labs-logo.png)

Management server setup! Short introduction of Puppet and MCollective :)

<!--more--> 

# I. Puppet

Server installation:

``` bash
$ sudo apt-get install puppetmaster
```

On the client:

``` bash
$ sudo apt-get install puppet
$ sudo puppetd --test (generate crt)
```

If you have changed your hostname, you will need to regenerate a crt:

``` bash
$ sudo puppetd --certname server-05
```

On the server:

List unsigned ca, which have been requested by the client with puppetd --test

``` bash
$ sudo puppetca --list
  server-05              (AB:65:06:25:A8:40:B3:62:70:0C:BF:5F:68:3E:A1:0E)

$ sudo puppetca --sign server-05
notice: Signed certificate request for server-05
notice: Removing file Puppet::SSL::CertificateRequest server-05 at '/var/lib/puppet/ssl/ca/requests/server-05.pem'
```

## Tips

Regenerate the client certificate, first on the master:

``` bash
$ sudo puppet cert clean <client-node>
```

On the agent:

``` bash
$ sudo rm -f /var/lib/puppet/ssl/certs/<client-node>.pem
$ sudo puppet agent -t
```

# II. MCollective

## II.1. Terminology

**Server**
The mcollective daemon, an app server for hosting Agents and managing the connection to your Middleware.

**Node**
The Computer or Operating System that the Server runs on.

**Client**
Software that produce commands for agents to process, typically this would be a computer with the client package installed and someone using the commands like mc-package to interact with Agents. Often clients will use the MCollective::Client library to communicate to the Collective

Basically the server is the slave, the node which will be orchestrate by the management server and the management server is the client.

## II.2. RabbitMQ config

Since OpenStack a messaging queue mecanism system, it will be shame to don't use it with MCollective, specially if you have setup a RabbitMQ cluster.

``` bash
$ sudo /usr/lib/rabbitmq/bin/rabbitmq-plugins enable amqp_client
The following plugins have been enabled:
  amqp_client
$ sudo /usr/lib/rabbitmq/bin/rabbitmq-plugins enable rabbitmq_stomp
The following plugins have been enabled:
  rabbitmq_stomp
```

Verify:

``` bash
$ /usr/lib/rabbitmq/bin/rabbitmq-plugins list
[E] amqp_client                       0.0.0
[ ] eldap                             0.0.0-git
[ ] erlando                           0.0.0
[ ] mochiweb                          1.3-rmq0.0.0-git
[ ] rabbitmq_auth_backend_ldap        0.0.0
[ ] rabbitmq_auth_mechanism_ssl       0.0.0
[ ] rabbitmq_consistent_hash_exchange 0.0.0
[ ] rabbitmq_federation               0.0.0
[ ] rabbitmq_jsonrpc                  0.0.0
[ ] rabbitmq_jsonrpc_channel          0.0.0
[ ] rabbitmq_jsonrpc_channel_examples 0.0.0
[ ] rabbitmq_management               0.0.0
[ ] rabbitmq_management_agent         0.0.0
[ ] rabbitmq_management_visualiser    0.0.0
[ ] rabbitmq_mochiweb                 0.0.0
[ ] rabbitmq_shovel                   0.0.0
[ ] rabbitmq_shovel_management        0.0.0
[E] rabbitmq_stomp                    0.0.0
[ ] rabbitmq_tracing                  0.0.0
[ ] rfc4627_jsonrpc                   0.0.0-git
[ ] webmachine                        1.7.0-rmq0.0.0-hg
```

User credential:

``` bash
$ sudo rabbitmqctl add_user <username> <password>
$ sudo rabbitmqctl set_user_tags <username> administrator
$ sudo rabbitmqctl set_permissions -p / <username> ".*" ".*" ".*"
```

Modify the plugin according to the MCollective listened port, add the following to the `/etc/rabbitmq/rabbitmq.config`:

    [
	{rabbitmq_stomp, [{tcp_listeners, [{"0.0.0.0", 6163},
					{"::1",       6163}]}]}
    ].

Eventually restart the server:

``` bash
$ sudo service rabbitmq-server restart
Restarting rabbitmq-server: SUCCESS
rabbitmq-server.
```

Listenning?

``` bash
$ sudo netstat -plantu | grep 6163
tcp        0      0 0.0.0.0:6163            0.0.0.0:*               LISTEN      18425/beam.smp  
```

## II.3. Mcollective config

Beware of the packages names:

* `mcollective-client`: on the node that you want to run your queries from
* `mcollective`: on the nodes that you want to query/control

Note: both of them are comming with the `mcollective-common` package.

Here the `/etc/mcollective/server.cfg` file:

	topicprefix = /topic/
	main_collective = mcollective
	collectives = mcollective
	libdir = /usr/share/mcollective/plugins
	logfile = /var/log/mcollective.log
	loglevel = info
	daemonize = 0

	# Plugins
	securityprovider = psk
	plugin.psk = unset

	connector = stomp
	plugin.stomp.host= haproxy
	plugin.stomp.port= 6163
	plugin.stomp.user= mcollective
	plugin.stomp.password= marionette

	# Facts
	factsource = yaml
	plugin.yaml = /etc/mcollective/facts.yaml


## II.4. Client config

``` bash
$ sudo aptitude install mcollective
```

Here the `/etc/mcollective/server.cfg` file:
	
	topicprefix = /topic/
	main_collective = mcollective
	collectives = mcollective
	libdir = /usr/share/mcollective/plugins
	logfile = /dev/null
	loglevel = info

	# Plugins
	securityprovider = psk
	plugin.psk = unset

	connector = stomp
	plugin.stomp.host= haproxy
	plugin.stomp.port= 6163
	plugin.stomp.user= mcollective
	plugin.stomp.password= marionette

	# Facts
	factsource = yaml
	plugin.yaml = /etc/mcollective/facts.yaml

Test your client:

``` bash
$ sudo mco ping
server-05                        time=45.38 ms


---- ping statistics ----
1 replies max: 45.38 min: 45.38 avg: 45.38
```

## II.5. MCollective plugins

Fortunetly MCollective comes with a bunch of existing [plugins](http://projects.puppetlabs.com/projects/mcollective-plugins/wiki) which is really helpful if you don't want to write your own script.

Test:

``` bash
$ sudo mco service ntp status
Do you really want to operate on services unfiltered? (y/n): y

 * [ ============================================================> ] 2 / 2

server6                                  status=running
server-05                                status=running

---- service summary ----
           Nodes: 2 / 2
        Statuses: started=2 
    Elapsed Time: 0.12 s
```

>This was article a really brief introduction to the management servers.
