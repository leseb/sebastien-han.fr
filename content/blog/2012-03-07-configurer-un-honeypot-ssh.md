---
title: Configurer un Honeypot SSH
date: 2012-03-07 17:29:00
slug: configurer-un-honeypot-ssh
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/Honey.png)

Dans cet article nous allons traiter de la mise en place d'un Honeypot.

<!--more-->

I. Concept du Honeypot
======================

Un honeypot ou pot de miel en français est une technique assez utilisée dans les DMZ. Celle-ci a pour objectifs de volontairement laisser entrer tout attaquant depuis l’extérieur. Il se matérialise par un serveur sur lequel un programme spécifique a été installé. Il va autoriser toutes les connexions sur des ports de services connus. Prenons le cas de SSH, celui-ci par défaut écoute sur le port 22. La mise en place d’un Honeypot écoutant sur le port 22 permettra de volontairement céder aux attaques de brute force sur un login root en ayant spécifié un mot de passe simple comme « azerty ». Une fois l’attaquant logé sur la machine, il se retrouve à son insue dans un environnement virtuel, un fake environnement. Pour la même occasion toutes ces actions depuis son loging sont enregistré dans les logs du service Honeypot. Tout l’intérêt réside dans l’analyse comportementale des attaquants, de leur programme, de leur manipulation et des outils utilisés. Au final nous serons mieux à même de nous prévenir de ce genre de méthodes.

Pour cette démonstration nous utiliserons le logiciel Open Source Kippo, [Kippo project](https://code.google.com/p/kippo/).

II. Installation et configuration
=================================

Nous allons débuter en modifiant le port d’écoute de notre vrai serveur SSH. La manipulation permettra à Kippo d’écouter sur le port par défaut de SSH:`22`.Rendez-vous dans le fichier `/etc/ssh/sshd_config` et changer le port par défaut:

```
Port 5643
```

On relance SSH après la modification:

```
$ sudo service ssh restart
```

Installer les paquets Python s’il ne sont pas déjà présent:

```
$ sudo apt-get install python-twisted
```

Kippo a besoin d’être exécuté par un utilisateur normal, nous allons donc lui en créer un:

```
$ sudo useradd -m kippo && sudo passwd kippo
```

On télécharge les sources du projet et on extrait son contenu:

```
$ wget https://kippo.googlecode.com/files/kippo-0.5.tar.gz
--2012-02-24 23:47:16--  https://kippo.googlecode.com/files/kippo-0.5.tar.gz
Resolving kippo.googlecode.com... 173.194.67.82
Connecting to kippo.googlecode.com|173.194.67.82|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 387148 (378K) [application/x-gzip]
Saving to: `kippo-0.5.tar.gz'
 
100%[===========================================>] 387,148      457K/s   in 0.8s 
 
2012-02-24 23:47:17 (457 KB/s) - `kippo-0.5.tar.gz' saved [387148/387148]
$ tar xzf kippo-0.5.tar.gz
```

On exporte le tout dans le dossier personnel de kippo:

```
$ sudo mv kippo-0.5 /home/kippo/
$ sudo chown -R kippo:kippo /home/kippo/
```

On change d’utilisateur pour Kippo et on configure Kippo:

```
$ su kippo
$ cd kippo-0.5
~/kippo-0.5$ sed -i s/'ssh_port = 2222'/'ssh_port = 22'/ kippo.cfg
```

Dans l’état des choses si on lance Kippo cela ne fonctionnera pas car le script essaiera d’écouter sur un port réservé à root. Pour rappel, tous les ports inférieurs à 1024. Étant donné que 22 en fait parti, la parade est d’utiliser les capacités. L’utilisation des capacités va nous permettre de contourner les limitations imposées par le noyau. Il faut donc les utiliser avec précision.

> Extrait du man: Pour vérifier les permissions, les implémentations Unix traditionnelles distinguent deux catégories de processus : les processus privilgis (dont l’UID effectif est 0, appelé superutilisateur ou root), et les processus non privilgis (dont l’UID effectif est non-nul). Les processus privilégiés contournent les vérifications de permissions du noyau, alors que les processus non-privilégiés sont soumis à une vérification complète basée sur l’identification du processus (habituellement : UID effectif, GID effectif, et liste des groupes).

À partir du noyau 2.2, Linux propose un mécanisme (encore incomplet) de capacits, qui scinde les privilèges traditionnellement associés au superutilisateur en unités distinctes que l’on peut activer ou inhiber individuellement.

```
$ sudo setcap 'cap_net_bind_service=+ep' /usr/bin/python2.7
```

Maintenant on lance Kippo:

```
~/kippo-0.5$ ./start.sh 
Starting kippo in background...Generating RSA keypair...
done.
```

On vérifie que Kippo fonctionne bien:

```
$ ps aux | grep `cat kippo.pid`
kippo    16632  0.0  6.8  30824 21612 ?        S    02:31   0:00 /usr/bin/python /usr/bin/twistd -y kippo.tac -l log/kippo.log --pidfile kippo.pid
```

Comme précisé dans l’introduction l’intégralité des actions effectuées par l’attaquans sont loguées dans `/home/kippo/kippo-0.5/log/kippo.log`

```
$ ssh root@192.168.146.157
Password:
sale:~# ls
```

Visualisation des logs :

```
$ tail log/kippo.log 
2012-02-25 02:31:09+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] channel open
2012-02-25 02:31:09+0100 [SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] got global no-more-sessions@openssh.com request
2012-02-25 02:31:09+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] pty request: ansi (60, 236, 1652, 900)
2012-02-25 02:31:09+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] Terminal size: 60 236
2012-02-25 02:31:09+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] unhandled request for env
2012-02-25 02:31:09+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] getting shell
2012-02-25 02:31:09+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] Opening TTY log: log/tty/20120225-023109-8964.log
2012-02-25 02:31:11+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] Received unhandled keyID: '\x08'
2012-02-25 02:33:18+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] CMD: ls
2012-02-25 02:33:18+0100 [SSHChannel session (0) on SSHService ssh-connection on HoneyPotTransport,0,192.168.146.1] Command found: ls
```

Et voilà !
