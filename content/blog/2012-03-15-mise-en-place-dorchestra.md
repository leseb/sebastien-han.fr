---
title: Mise en place d’Orchestra
date: 2012-03-15 02:10:00
slug: mise-en-place-dorchestra
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/orchestra.png)

Orchestra est l’outil développé par Ubuntu pour déployer votre propre Cloud privé. Celui-ci est notamment utilisé par Canonical pour gérer son infrastructure Ubuntu Cloud. Pour cela il se base sur plusieurs projets qui ont fait leur preuves par leur robustesse au file des années.

<!--more-->

I. Introduction à Orchestra
===========================

Lorsque qu’un administrateur système gère un parc de machines, il fait généralement une installation du nouveau service qu’il veut mettre en place manuellement. Réaliser une installation manuelle permet de bien comprendre le fonctionnement de la solution mise en place, ce qui pourra aider au débugage ultérieurement si besoin. Très rapidement il scripte le tout afin d’automatiser les tâches. Lorsque le parc grandit ou qu’il comprendra plus de 100 machines, même le script d’automatisation devient compliquer à mettre en place, une perte de temps. C’est là qu’interviennent des outils comme Orchestra, capables de gérer des parcs de machines à grande échelle. Orchestra est une collection des meilleurs outils pour construire un Cloud Open Source. Il déploie des Ubuntu Server à partir un Ubuntu Server.

Il regroupe plusieurs familles telles que:

* Provisionning – Cobbler
* Configuration – Juju
* Orchestration  - Juju
* Monitoring – Nagios
* Log centralisé –  Rsyslog

Orchestra offre la possibilité de manager son infrastructure depuis un seul point de contrôle et les déploiements de services. Comme un bon schéma vaut mieux que de longue discussion, je vous laisse observer:

![](/images/orchestra-deploying.png)

Vous comprendrez donc qu’un serveur central (orchestra server) gère les déploiements sur toutes les machines de votre parc.
Séquentiellement on obtient:

1. Rack votre serveur
2. Allumer le serveur
3. Enregistrer vos machines via leur adresses MAC dans l’interface de l’outil de provisionning fournit par Orchestra (Cobbler) et activer l’option ‘netboot’
4. Éteignez les serveurs
5. (PATIENTER)
6. Depuis l’interface, choisissez les machines à déployer, le WOL étant activer les machines vont s’allumer toutes seules and Cobbler va déployer et installer Ubuntu Server
7. Juju déploie vos services, Juju fera l’objet d’un article à part entière.

Pour résumer, les points forts d’Orchestra:

* Package all-in-one
* Réduit considérablement les temps de déploiements (vital)
* Open source (AGPL), janvier 2011

II. Installation
================

II.1. Orchestra Server
----------------------

Mes tests ont bien évidemment été réalisés sur Ubuntu Server Oneiric 11.10. Détails de la machine virtuelle:

* 1 core, 400Mo RAM
* 2 NIC :
    * NAT
    * Host only

Configuration des cartes réseaux à votre convenance mais je poste quand même la mienne.

```
orchestra@orchestra:~$ cat /etc/network/interfaces
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto eth0
iface eth0 inet static
address 192.168.146.153
netmask 255.255.255.0
gateway 192.168.146.2

auto eth1
iface eth1 inet static
address 192.168.1.100
netmask 255.255.255.0
```

On active également l’IP forwarding au niveau du noyau :

```
orchestra-user@orchestra:~$ sudo iptables -t nat --append POSTROUTING --out-interface eth0 -j MASQUERADE
orchestra-user@orchestra:~$ sudo iptables --append FORWARD --in-interface tun0 -j ACCEPT
orchestra-user@orchestra:~$ sudo echo 1 > /proc/sys/net/ipv4/ip_forward
```

Pour rendre cela permanent au reboot, éditer votre `/etc/sysctl.conf` avec:

```
net.ipv4.ip_forward = 1
```

Appliquer le changement: 

``` bash
orchestra-user@orchestra:~$ sudo sysctl -p
net.ipv4.ip_forward = 1
```

II.2.  Orchestra installation
-----------------------------

Mise à jours de la liste des paquets et installation du paquet:

```
orchestra-user@orchestra:~$ sudo apt-get update && sudo apt-get install ubuntu-orchestra-server –y
```

Réponses aux étapes importantes durant l’installation:

* Set the Boot and PXE server address: `ip_de_le_carte_host_only` - dans mon cas 192.168.1.100
* Enable Orchestra manage DNS/DHCP: `Yes`
* Set the network range for DHCP Clients: `192.168.1.101 – 192.168.1.200`
* Set the default gateway for DHCP Clients: `ip_de_le_carte_host_only` - dans mon cas 192.168.1.100

Si vous avez fait une erreur durant l’installation vous pouvez soit faire dpkg-reconfigure soit modifier la configuration de Cobbler dans: /etc/cobbler/settings

II.3. Cobbler web interface managment
-------------------------------------

Rendez-vous  `http://ip_address_orchestra_server/cobbler_web/system/list`

Si tout c’est bien passé vous devriez charger cette page:

![](/images/orchestra-1.png)

Rentrer les identifiants que vous avez saisis durant l’installation d’orchestra-server.

![](/images/orchestra-2.png)

Aller dans `Systems > Create New System` et remplissez les champs comme suit:

* Profile:  `oneiric-86_64-juju`
* Gateway: `addresse_ip_host_only`
* Name Servers: `addresse_ip_host_only`
* Add Interface:  entrer `eth0` et cliquer sur `Add`
* Edit Interface: `eth0`
* MAC Address: `MAC_address_Orchestra_Slave`
* Management Classes: ajouter  **UNIQUEMENT** la classe: `orchestra-juju-available` (si vous voulez utiliser juju, plus tard)


I.4. Monitorer votre installation
---------------------------------

Avant de démarrer votre machine « esclave », celle sur laquelle votre serveur Orchestra va déployer Ubuntu Server modifier la séquence de démarrage de votre machine sur Boot PXE. Puis lancez votre machine, voilà normalement la magie est train de s’opérer.

Pour voir en direct l’installation et ce qu’il se passe « under the hood »  trouvez l’adresse IP de la machine esclave :

```
orchestra-user@orchestra:~$ sudo netstat -plantu | grep rsyslogd | grep ESTABLISHED | awk '{print $5}' | cut -d ':' -f 1
192.168.1.157
```

Installer un outil pour colorier vos logs :

```
orchestra-user@orchestra:~$ sudo apt-get install -y tmux ccze
```

Admirer les logs du serveur Orchestra :

```
orchestra-user@orchestra:~$ tail -f /var/log/syslog | ccze
```

Ainsi que les logs de SQUID :

```
orchestra-user@orchestra:~$ sudo tail -f /var/log/squid/access.log | ccze
```

Lorsque l’installation est terminée vous pouvez vous logger sur la machine esclave avec :

```
identifiant: ubuntu
mot de passe: ubuntu
```

Et voilà ! 

J’espère que cela pourra vous être utile pour déployer des machines sur votre parc. Comprenez bien que ce tuto n’est qu’une présentation en surface des capacités d’ Orchestra ou plus concrètement de Cobbler pour les déploiements de systèmes d’exploitation. La sortie imminente de la nouvelle LTS 12.04 apportera son lot de nouveauté. Un autre composant que je n’ai pas évoquer ici est `juju`. Un outils relativement puissant et bluffant par sa simplicité bien que très instables à leur actuelle. Il fera l’objet d’un futur article.


