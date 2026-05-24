---
title: Introduction à Juju avec LXC
date: 2012-02-07 17:14:00
slug: introduction-a-juju-avec-lxc
draft: false
categories: ["containers"]
tags: ["containers"]
---

![](/images/juju-logo.png)

Juju fait parti des nouveaux outils développés par Ubuntu dans sa gamme Ubuntu Cloud pour déployer votre infrastructure Cloud privé. Il fait parti intégrante du projet Orchestra. Actuellement Juju est en cours de développement. Il est toutefois possible de réaliser des tests soit avec des instances Amazon EC2 soit en local avec des LXC. Pour ma part j'ai testé cela à partir de conteneur LXC.

<!--more-->

I. Introduction à Juju
======================

Juju fait parti de la gamme Ubuntu Cloud, il se positionne clairement dans le mouvement DevOps. La philosophie de Juju est de manager des service et non des machines. Chacun de ces services est appelé une unité. Afin de déployer des services sur un grand parc de serveurs Juju utilise des charmes. Ce sont eux qui vont servir à déployer un service. Les différentes particularité des charmes sont nombreuses, globalement ceux-ci sont ré-utilisables, ré-exécutables, modifiables (afin de les adapter à vos besoins).

Quelques exemples des charmes actuels:

* OpenStack
* Hadoop
* Apache
* Varnish
* MySQL
* WordPress

Les limitations actuelles de Juju:

* 8 développeurs
* projet jeune: 2 ans
* un seul service par unité, la cohabitation de plusieurs services sur une unité est prévu pour Ubuntu 12.04 LTS.

Note importante de la part des développeurs de Juju:

> Juju is still in a stage of fast development, and is not yet ready for prime time. The current software is being made available as an early technology preview, and while it can be experimented with, it should not be used in real deployments just yet.

J’ai préféré rédiger cela sous forme de script afin de réaliser des démos rapides.

```
#!/bin/bash
# Quickly deploy Juju LXC based
 
echo "Dependencies installation"
sudo apt-get update && sudo apt-get install libvirt-bin lxc apt-cacher-ng libzookeeper-java zookeeper juju
if [ $? -eq 1 ] ; then
        echo "Create a SSH key pair"
        ssh-keygen -t rsa
        juju bootstrap 2&1> /dev/null
 
        echo "Generate your environment"
        cat > ~/.juju/environement.yaml << EOF
        environments:
                sample:
                type: local
                control-bucket: juju-a14dfae3830142d9ac23c499395c2785999
                admin-secret: 6608267bbd6b447b8c90934167b2a294999
                default-series: oneiric
                juju-origin: distro
                data-dir: /home/user/some_directory
        EOF
        echo "Bootstrapping your environement"
        juju bootstrap
        if [ $? -eq 1 ] ; then
                echo "Deploying Wordpress"
                juju deploy --repository=/usr/share/doc/juju/exampless local:mysql
                juju deploy --repository=/usr/share/doc/juju/examples/ local:wordpress
                juju add-relation wordpress mysql
                juju expose wordpress
                if [ $? -eq 1 ] ; then
                        IP_PUBLIC=$(juju status | grep public-address | sed -n '2p' | awk '{print $2}')
                        if [[ ${IP_PUBLIC} ~= (null) ]] ; then
                                echo "LXC container error, please reboot your machine and re-launch the script."
                        else
                                echo -e "Installation finished.$\nConfigure your Wordpress here http://$IP_PUBLIC "
                        fi
                fi
        fi
fi
```

À vous de tester tout ça !
