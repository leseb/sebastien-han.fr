---
title: "Tour d'horizon sur SSH"
date: 2011-05-16 11:14:00
slug: tour-dhorizon-sur-ssh
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/ssh.png)
SSH ou Secure Shell est l’outil de prédilection de tout administrateur système. Ces utilisations peuvent être très variées. L’objectif de cet article est comprendre le fonctionnement de SSH et de faire un tour d’horizon sur ce protocole.

<!--more-->

I. Introduction
===============

I.1. Historique
---------------

SSH ou Secure Shell est un protocole de la couche applicative (7) du modèle OSI permettant la prise de contrôle à distance, la connexion et l’échange de données entre deux machines de façon sécurisée. Celui-ci succède à son ancêtre, le protocole TELNET, pour rappel non sécurisé où les informations circulées en clair sur le réseau. C’est un des outils de prédilections pour tous les administrateurs systèmes et réseaux dignes de ce nom.

###I.1.1. Version 1

Seul la version Potato de Debian supporte cette version, les méthodes d’authentifications disponibles sont :

* RSAAuthentication : RSA identity key based user authentication
* RhostsAuthentication : .rhosts based host authentication (insecure, disabled)
* RhostsRSAAuthentication : .rhosts authentication combined with RSA host key (disabled)
* ChallengeResponseAuthentication : RSA challenge-response authentication
* PasswordAuthentication : password based authentication

###I.1.2. Version 2

Cette version est supportée par toutes les distributions Debian ayant suivies Woody, les méthodes d’authentifications disponibles sont :

* PubkeyAuthentication : public key based user authentication
* HostbasedAuthentication : .rhosts or /etc/hosts.equiv authentication combined with public key client host authentication (disabled)
* ChallengeResponseAuthentication : challenge-response authentication
* PasswordAuthentication : password based authentication

I.2. Fonctionnement
-------------------

![](/images/principe-ssh.png)

I.3. Installation
-----------------

Les paquets `openssh-server` pour le daemon SSH et le paquet `openssh-client` initiant les connexions sur les machines serveurs font généralement partis des paquets de base installés sur les distributions Linux, UNIX et BSD. Si ce n’est pas le cas (sous Debian) lancer la commande :

```
root$ aptitude install ssh
```

Les fichiers de configuration sont visibles dans :

```
/etc/ssh
```

Le daemon se trouve dans :

```
/etc/init.d/ssh
```

Le fichier de configuration standard de SSH est :

```
sshd_config
```

Afin de tester si le serveur SSH est bien fonctionnel vous pouvez vérifier le status du daemon :

```
root# /etc/init.d/ssh status
* sshd is running
```

Ensuite initier une connexion en local :

```
root# ssh localhost
```

Utilisation de la commande :

```
root# ssh [OPTIONS] user@hostname
```

Une fois que le service fonctionne, nous allons voir de plus prêt le fichier de configuration de SSH et les façons de le sécuriser.

I.4. Sécurisation standard
--------------------------

Ouvrez votre fichier de configuration SSH afin de l’éditer :

```
root# vim /etc/ssh/sshd_config
```

###I.4.1. Changer le port d’écoute

Il est très important afin d’éviter les attaques DoS (Deny of Service) ou DDoS (Distribued Deny of Service) de changer votre port d’écoute SSH, en effet certaines machines scrutent le net en scannant différents ports et en lançant des attaques si ces ports répondent. Vous devez choisir un port de préférence `>1024` (ports non alloués à des protocoles). Si vous êtes sur un réseau avec un firewall un peu capricieux (bloquant différents ports), je vous conseille d’utiliser le port 443. Ce port est réservé à la couche sécurisée du protocole HTTP, soit HTTPS. Si l’administrateur réseau est vraiment pointilleux il peut laisser l’accès à 443 mais par une whitelist, en gros il n’autorise que certaines connexions sur le port 443. Si vous êtes dans ce cas là, il n’y pas grand chose à faire…

```
# What ports, IPs and protocols we listen for
Port 443
```

Dorénavant pour vous connectez il vous faudra préciser le port de SSH :

```
root# ssh -p 443 user@hostname
```

Quoi ? Vous êtes faignant (et vous avez raison !), vous ne voulez pas spécifier le port ? Voici une solution !

Nous allons pour cela éditer le fichier `ssh_config` à ne pas confondre avec `sshd_config` :

```
root# vim /etc/ssh/ssh_config
```

Placez-vous avant cette ligne :

```
Host *
```

Et insérez la ligne suivante :

```
Host "ipServeur ou dnsServeur"
        Port "443 ou autre"
```

###I.4.2. Interdire le login ROOT

Imaginez la catastrophe si une attaque sur SSH logant l’utilisateur ROOT réussie. L’attaquant aura l’accès complet et pourra corrompre votre machine. Il parait donc évident de supprimer la possibilité de login avec l’utilisateur ROOT.

```
# Authentication:
PermitRootLogin no
```

###I.4.3. Autoriser certains utilisateurs et/ou groupes

Afin de gérer de façon plus précise les authentifications, il est possible de spécifier une liste d’utilisateurs ou de groupes ayant le droit de s’authentifier sur le serveur. C’est une whitelist. Rajouter ce paramètre n’importe où dans le fichier de configuration. Exemple pour l’utilisateur `tata` :

```
# On autorise seulement cet utilisateur à se connecter
AllowUsers tata
	 
 # On autorise seulement les utilisateurs du groupe ssh-allow-users à se connecter
AllowGroups ssh-allow-users
```

À l’inverse on peut autoriser tout le monde et interdire certains groupes ou utilisateurs, c’est une backlist :

```
# On interdit cet utilisateur à se connecter
DenyUsers tata
	  
# On interdit les utilisateurs du groupe ssh-deny-users à se connecter
DenyGroups ssh-deny-users
```
  
###I.4.5. Vérification de quelque paramètres natifs
####I.4.5.1. Interdire le login avec mot de passe vide

 Normalement ce paramètre est déjà activé. Encore une fois il paraît logique de ne loger aucun utilisateur sans mot de passe. Veillez que vous possédez bien cette ligne :

```
# To enable empty passwords, change to yes (NOT RECOMMENDED)
PermitEmptyPasswords no
```

####I.4.5.2. Forcer l’utilisation du protocole 2

La version 1 de SSH étant devenue obsolète (même si certains doivent encore l’utiliser pour quelques options), il est important d’utiliser la version 2 afin de garantir un bon niveau de sécurité. Comme pour le login sans mot de passe vérifiez que ce paramètre est activé par défaut.

```
# Use these options to restrict which interfaces/protocols sshd will bind to
#ListenAddress ::
#ListenAddress 0.0.0.0
Protocol 2
```

Une fois tous les changements effectués n’oubliez pas de redémarrer le service SSH :

```
root# /etc/init.d/ssh restart
* Restarting OpenBSD Secure Shell server sshd                                                        [ OK ]
```

I.5. Options intéressantes
--------------------------

Certaines options peuvent encore être ajoutées au fichier de configuration de SSH afin d’améliorer son utilisation.

I.5.1. Déconnexion automatique de l’utilisateur après inactivité
Afin d’éviter le surcharge du réseau et du nombre de connexions entrantes on peut spécifier une durée (en seconde) après laquelle le serveur déconnecte l’utilisateur en cas d’inactivité.

``` 
#L'utilisateur sera déconnecté après 5 minutes d'inactivité
ClientAliveInterval 300
Pour un peu plus de souplesse sur la charge réseau et plus de sécurité n’hésitez pas à jetez un oeil à ces options :

MaxAuthTries
Specifies the maximum number of authentication attempts permitted per connection.  Once the number of failures reaches half this value, additional failures are logged.  The default is 6.

MaxSessions
Specifies the maximum number of open sessions permitted per network connection.  The default is 10.
					 
MaxStartups
Specifies the maximum number of concurrent unauthenticated connections to the SSH daemon. Additionnal connections will be dropped until authentication succeeds or the LoginGraceTime expires for a connection. The default is 10.
``` 

###I.5.2. Mettre une bannière d’avertissement

Cela peut paraître bête comme idée mais non ! Il est important de notifier les utilisateurs se connectant qu’ils entrent dans une zone privée. Pour cela nous allons créer un fichier bannière dans le répertoire de SSH :

```
root# vim /etc/ssh/ssh-banner
``` 

Ensuite on y colle ce genre de message d’avertissement :

``` 
****************************************************************************
NOTICE TO USERS

WARNING ! The use of this system is restricted to authorized users.

All information and communication on this system are subject to review, monitoring and recording at any time, without notice or permission. Users should have no expectation of privacy.

***************************************************************************
``` 

Maintenant rendez-vous dans le fichier de configuration de SSH et décommentez la ligne suivante :

``` 
Banner /etc/ssh/ssh-banner
``` 

Vous pouvez faire un test de connexion rapide afin de vérifier le bon fonctionnement :

```
leseb@leseb-Studio-1557:~$ ssh 192.168.0.11
****************************************************************************
NOTICE TO USERS
WARNING ! The use of this system is restricted to authorized users.
All information and communication on this system are subject to review, monitoring and recording at any time, without notice or permission. Users should have no expectation of privacy.
***************************************************************************
leseb@192.168.0.11's password:
Linux leseb-Studio-1557 2.6.35-28-generic #50-Ubuntu SMP Fri Mar 18 18:42:20 UTC 2011 x86_64 GNU/Linux Ubuntu 10.10
Welcome to Ubuntu!
* Documentation:  https://help.ubuntu.com/
Last login: Tue Apr 26 09:16:51 2011
leseb@leseb-Studio-1557:~$
```

Comme précédemment une fois tous les changements effectués n’oubliez pas de redémarrer le service SSH :

```
root# /etc/init.d/ssh restart
* Restarting OpenBSD Secure Shell server sshd                                                         [ OK ]
```

###I.5.3. Multiplexage du canal de communication

On est souvent tenté de faire de la multi-connexion sur un serveur SSH, simplement parce que nous avons besoin d’un second shell pour effectuer une action en parallèle d’une autre. Il existe un moyen d’unifier les connexions dans un seul tunnel afin de ne pas avoir à se ré-authentifier (saisie de mot de passe ou échange de clef). L’ouverture de la connexion avec la création du tunnel désigne la connexion mère, ensuite suivent des connexions filles. Elles restent actives tant que la connexion mère fonctionne. Nous allons utiliser le paramètre Control master.

![](/images/multiplexage-canal.png)

Retour sur le fichier `ssh_config` et pas `sshd_config` !

Sur un Host précédement crée ou un nouveau ajouté les lignes suivantes :

```
ControlMaster auto
	ControlPath ~/.ssh/ssh-%r@%h:%p
```

Exemple de mon fichier avec les ajouts précédents :
```
Host "ipServeur ou dnsServeur"
	Port 443
	ControlMaster auto
	ControlPath ~/.ssh/ssh-%r@%h:%p
```

Description des paramètres :

* %r : désigne le nom d’utilisateur
* %h : désigne l’hôte distant
* %p : désigne le port distant

Maintenant authentifiez-vous une fois et puis une deuxième fois, normalement vous devriez être logé automatiquement !

Pour en savoir plus sur les options du fichier `sshd_config` n’hésitez pas à faire un `man sshd_config` pour voir la liste complète des options disponibles.

II. Les usages possibles
========================

II.1. Connexion distante
------------------------

###II.1.1. Authentification par mot de passe
####II.1.1.1. Sous Linux

Nous l’avons vu un peu plus haut, SSH permet l’initialisation de connexion distante sur d’autres machines, re-voici la commande à employer :

```
root# ssh -p "port" user@hostname
```

Renseignez votre mot de passe :

```
user@hostname's password:
```

Exemple de message une fois logé :
```
Linux hostname 2.6.35-28-generic #50-Ubuntu SMP Fri Mar 18 18:42:20 UTC 2011 x86_64 GNU/Linux Ubuntu 10.10
Welcome to Ubuntu!
* Documentation:  https://help.ubuntu.com/
Last login: Wed Apr 20 23:02:31 2011
```

Pour vous déconnecter et mettre fin à votre session lancez la commande exit :
```bash
user@hostname:~$ exit
logout
Connection to hostname closed.
```

####II.1.1.2. Sous Windows
Sous Windows, le logiciel le plus employé pour se connecter en SSH est PuTTY. Celui-ci est téléchargeable sur [cette page](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html)

Une fois installé, lancez-le :

![](/images/putty-gen.png)

La configuration de PuTTY est très simple, voyez plutôt :

* Host Name (or IP address) : renseignez l’ IP de votre serveur SSH
* Port :  laissez 22, sinon remplacez par le port, dans mon cas 443
* Connection type : SSH
* Saved Sessions :  enregistrer vos préférences de connexions, donnez un nom
* Cliquez sur Save
* Cliquez sur Open

Lors de votre première connexion, PuTTY vous demande une confirmation de connexion afin d’entrer le serveur joint dans sa liste de serveur connu :

Cliquez sur Oui.

![](/images/putty-log.png)

Renseignez votre login et votre mot de passe.
Appuyez sur Entrée !

![](/images/putty-co.png)

###II.1.2. Authentification par clef publique / clef privé

Si l’on est souvent amener à se loger sur une machine, de même si l’on veut lancer des actions automatisées par script sur des serveurs il peut vite devenir fastidieux et compliqué de renseigner son mot de passe à chaque connexion. Il existe donc une méthode basée sur l’échange de clefs chiffrées vous permettant de vous loger sans mot de passe et également de façon sécurisé. Attention tout de même à ne pas égarer votre clef vous risqueriez de mettre en péril votre serveur.

####II.1.2.1. Côté serveur

Nous allons commencez par éditer une ligne du fichier `sshd_config`:

```
root# nano /etc/ssh/sshd_config
```

Nous allons modifier ce paramètre, changez le `no` en `yes` :

```
PasswordAuthentication yes
```

####II.1.2.2. Côté client (Linux)

Sur le poste client qui va initier la connexion vérifier que le dossier .ssh existe bien sur votre machine, s’il n’existe pas créer-le :

```
root# mkdir ~/.ssh
```

Lancer la génération de vos clefs :

```
root# ssh-keygen -t dsa
Le shell vous retourne ceci, appuyez sur Entrée à chaque question :

Generating public/private dsa key pair.
Enter file in which to save the key (/home/user/.ssh/id_dsa):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in id_dsa.
Your public key has been saved in id_dsa.pub.
The key fingerprint is:

```

Cela va générer 2 clefs dans le dossier ~/.ssh : `id_dsa` et `id_dsa.pub`

On copie notre clef publique sur le serveur distant SSH dans le fichier ~/.ssh/authorized_keys :

```
root# ssh-copy-id -i ~/.ssh/id_dsa.pub "-p 443 user@hostname"
```

Renseignez votre password pour la dernière fois !
Maintenant essayez de vous loger :

```
root# ssh –p 443 user@hostname
```

Magique !

Principe de fonctionnement :

Lors de la tentative de connexion le client va renseigner sa clef publique (celle dans `~/.ssh/`)
À la demande de connexion le serveur va vérifier dans son fichier `authorized_keys` si celle-ci existe
Si c’est le cas la connexion est acceptée.
Bien évidemment le fichier `authorized_keys` peut contenir plusieurs clefs à conditions que celle-ci façon l’objet d’un retour à la ligne à chaque ajout.

Protéger vos clefs privés, au risque de perdre l’avantage de l’authentification sans mot de passe… Vous pouvez utiliser un agent SSH qui va conserver votre clef de façon chiffrées, vous devrez renseigner une passphrase pour les déchiffrer et les utiliser. Il faut cependant être garant du trousseau utilisé, la façon dont ils stockent et protègent vos clefs, c’est donc un cercle vicieux.

####II.1.2.3. Côté client (Windows)

Sous Windows nous allons utiliser PuTTY pour initialiser nos connexions SSH. L’établissement d’authentification n’est pas plus compliquée sous Windows (tout est graphique après tout !). Dans le répertoire d’installation de PuTTY se trouve PuTTYgen, un générateur de clef.

![](/images/putty-key-gen.png)

Cliquez sur Generate et remuez votre souris dans la zone vide afin de générer des nombres aléatoires.

![](/images/putty-key-gen-en-cours.png) 

Une fois terminé, enregistrez vos clef privé (.ppk) et publique (.pub) sur votre poste client. Maintenant il faut copier la clef publique dans le fichier `authorized_keys` de votre serveur, un simple `ctrl + c` et `ctrl + v` !

![](/images/putty-key-gen-ok.png) 

Maintenant il faut quelque peu modifier vos préférences dans PuTTY, tout d’abord sélectionnez le chemin votre clef privé :

![](/images/key-path.png) 

Ensuite renseignez votre login :

![](/images/ssh-login-user.png) 

Et enfin l’encode de caractère en UTF-8 :

![](/images/ut8.png) 

Enregistrez votre configuration et faîte un essai.

![](/images/putty-auth-key.png) 

II.2. Redirection de port
-------------------------

###II.2.1. Port local vers port distant

Parfois il peut être utilie d’avoir accès à des interfaces Web d’administration comme celle de Nagios pour le monitoring, utiliser le service Owncloud en mode local, ou accéder à votre serveur Web sur une votre machine serveur distante. Le principe ici est d’ouvrir un tunnel SSH entre votre machine cliente et votre machine serveur et d’accéder via un port local de votre machine client à un port distant sur la machine serveur.

####II.2.1.1. Sous Linux

Imaginons un test sur mon serveur Web distant de mon serveur SSH.

```
ssh user@hostname -p 443 -L 8080:localhost:80
```

Ici je demande de rediriger mon port local 8080 vers le port 80 de ma machine distante. Pas besoin de modifier vos paramètres proxy de votre navigateur, entrez simplement l’adresse : `http://localhost:8080/`

####II.2.1.2. Sous Windows

Toujours avec PuTTY

![](/images/redirection-local-distant.png) 

Même principe que sous Linux, on ne modifie pas les paramètres proxy du navigateur et on fait un test sur le port 8080 de votre localhost.

###II.2.2. Port distant vers port local

Ici on peut autoriser le serveur SSH à accéder à un port de notre machine locale.

####II.2.2.1. Sous Linux

Dans un terminal entrez la commande :

```
ssh user@hostname -p 443 -R 8080:localhost:80
```

####II.2.2.2. Sous Windows

Toujours à l’aide de PuTTY :

![](/images/redirection-distant-local.png) 

Il ne vous reste plus qu’à faire un test depuis votre serveur.

###II.2.3. Rebond SSH sous Linux

Si l’on veut traverser plusieurs serveur SSH.

Dans un terminal entrez la commande :
```
ssh -T user@passerelle ssh user2@hostnameFinal
```

###II.2.4. X11 forwarding

Même si vous êtes sur un serveur, vous pouvez un jour avoir d’un retour graphique ou d’utiliser une application graphique. Ici nous avons un serveur X11 tournant en local sur la machine cliente, SSH qu’en à lui va rediriger le flux d’affichage vers ce serveur local. Vous pouvez donc lancer une application graphique à distance à travers votre tunnel SSH. Le principe de fonctionnement est assez simple, on utilise les ressources du serveur distant et on exécute l’interface graphique en émulant un serveur X11 sur notre machine. Attention par contre au débit nécessaire, en local cela fonctionne très bien mais au travers d’Internet il faut une bonne bande passante. Pour exemple avec ma connexion et un débit montant d’environ 80/100Ko/sec, un simple éditeur de texte ou navigateur Web n’est pas fluide.

####II.2.4.1. Configuration serveur

Vérifiez que ce paramètre est à yes dans le fichier `sshd_config` :
```
X11Forwarding yes
```

####II.2.4.2. Configuration client Windows

Nous allons commencer par paramétrer PuTTY en activant le X11 Forwarding :

![](/images/x11-putty.png) 

Ensuite, [téléchargez l’émulateur X11](http://www.straightrunning.com/XmingNotes/), installez-le et lancez-le.

Maintenant saisissez une commande dans le terminal de PuTTY par exemple :

```
root# iceweasel
```

![](/images/x11-test.png)   

####II.2.4.3. Configuration client Linux

Ici le serveur X11 est natif, ouvrez simplement un terminal et entrez la commande suivante :

```
root# ssh -X -p 443 user@hostname
```

Une fois connecté à la machine distante :

![](/images/X11-linux.png) 

II.3. Proxy avec SSH ou HTTP Over SSH
-------------------------------------

###II.3.1. Pourquoi utiliser un proxy SSH ?

Concernant cette partie, je ne me tiens en aucun cas responsables des actions que vous pourriez effectuées après l’utilisation induite du protocole SSH.

Capture avec Wireshark d’une requête sur `www.google.com` :

![](/images/Sans-ProxySSH.png) 

Ici en posant un filtre sur http, toutes les requêtes sont visibles en clair.

Capture d’une requête vers la version SSL de google :

![](/images/google_SSL.png)

En posant un filtre sur SSL, on observe bien un échange au travers de SSL mais les données étant encryptés rien n’est interprétable.

L’utilisation de SSL n’empĉhe pas les proxy réseaux de voir vers où sont initiées les connexions réseaux, par exemple ici on sait que l’adresse IP publique 209.85.227.139 correspond au serveur de Google. L’avantage du proxy SSH est la création du tunnel SSH, emprisonnant toutes vos requêtes de façon chiffrée. Ainsi une analyse réseau permet seulement de voir l’adresse de votre serveur SSH et rien d’autre :

![](/images/proxy-ssh-windows.png)

###II.3.2. Proxy SOCKS

####II.3.2.1. Brève sur SOCKS

SOCKS est comme son abréviation l’indique un proxy pour socket, il ne se préoccupe en rien de la nature des protocoles employés lorsque l’on l’utilise. À l’inverse d’un proxy type qui lui est donné pour un protocole précis. Le gros avantage de SOCKS est donc de pouvoir faire transiter tout type de flux en sein et de ne pas se limiter à un protocole précis (POP, SMTP, HTTP).

####II.3.2.2. Mise en oeuvre avec SSH sous Linux

Le principe est identique à celui employé pour la redirection de port ave SSH, la commande que j’utilise pour mon proxy SOCK :

```
ssh user@hostname -Cp443 -ND3128
```

Détails des options utilisées :

* -C : compresser la connexion
* -p : on spécifie le port SSH
* -N : on interdit le contrôle à distance. Nous n’avons pas d’accès à un shell distant, en même temps nous n’en avons pas besoin !
* -D : redirection de port de dynamique en utilisant SOCKS, ici SSH agît comme un serveur SOCKS

On peut également observer les traces des connexions en ajoutant l’option verbeuse sur la commande SSH :

Initialisation de la connexion :

```
leseb@leseb-Studio-1557:~$ ssh user@hostname -Cp443 -ND3128 -v
OpenSSH_5.5p1 Debian-4ubuntu5, OpenSSL 0.9.8o 01 Jun 2010
debug1: Reading configuration data /etc/ssh/ssh_config
debug1: Applying options for *
debug1: Connecting to hostnameIP [hostnameIP] port 443.
debug1: Connection established.
debug1: identity file /home/leseb/.ssh/id_rsa type -1
debug1: identity file /home/leseb/.ssh/id_rsa-cert type -1
debug1: identity file /home/leseb/.ssh/id_dsa type 2
debug1: Checking blacklist file /usr/share/ssh/blacklist.DSA-1024
debug1: Checking blacklist file /etc/ssh/blacklist.DSA-1024
debug1: identity file /home/leseb/.ssh/id_dsa-cert type -1
debug1: Remote protocol version 2.0, remote software version OpenSSH_5.5p1 Debian-6
debug1: match: OpenSSH_5.5p1 Debian-6 pat OpenSSH*
debug1: Enabling compatibility mode for protocol 2.0
debug1: Local version string SSH-2.0-OpenSSH_5.5p1 Debian-4ubuntu5
debug1: SSH2_MSG_KEXINIT sent
debug1: SSH2_MSG_KEXINIT received
debug1: kex: server-&gt;client aes128-ctr hmac-md5 zlib@openssh.com
debug1: kex: client-&gt;server aes128-ctr hmac-md5 zlib@openssh.com
debug1: SSH2_MSG_KEX_DH_GEX_REQUEST(1024&lt;1024&lt;8192) sent
debug1: expecting SSH2_MSG_KEX_DH_GEX_GROUP
debug1: SSH2_MSG_KEX_DH_GEX_INIT sent
debug1: expecting SSH2_MSG_KEX_DH_GEX_REPLY
debug1: Host '[hostnameIP]:443' is known and matches the RSA host key.
debug1: Found key in /home/leseb/.ssh/known_hosts:1
debug1: ssh_rsa_verify: signature correct
debug1: SSH2_MSG_NEWKEYS sent
debug1: expecting SSH2_MSG_NEWKEYS
debug1: SSH2_MSG_NEWKEYS received
debug1: Roaming not allowed by server
debug1: SSH2_MSG_SERVICE_REQUEST sent
debug1: SSH2_MSG_SERVICE_ACCEPT received
debug1: Authentications that can continue: publickey,password
debug1: Next authentication method: publickey
debug1: Offering public key: /home/leseb/.ssh/id_dsa
debug1: Server accepts key: pkalg ssh-dss blen 435
debug1: Enabling compression at level 6.
debug1: Authentication succeeded (publickey).
debug1: Local connections to LOCALHOST:3128 forwarded to remote address socks:0
debug1: Local forwarding listening on ::1 port 3128.
debug1: channel 0: new [port listener]
debug1: Local forwarding listening on 127.0.0.1 port 3128.
debug1: channel 1: new [port listener]
debug1: Requesting no-more-sessions@openssh.com
debug1: Entering interactive session.
```

Exemple de requête sur google, ici le mot « test » renvoie :

```
debug1: channel 11: free: direct-tcpip: listening port 3128 for www.google.fr port 80, connect from 127.0.0.1 port 45024, nchannels 12
debug1: Connection to port 3128 forwarding to socks port 0 requested.
debug1: channel 5: new [dynamic-tcpip]
```

Puis lorsque je me rends sur le premier site délivré par la recherche :

```
debug1: channel 21: new [dynamic-tcpip]
debug1: channel 14: free: direct-tcpip: listening port 3128 for api.mywot.com port 80, connect from 127.0.0.1 port 49996, nchannels 22
debug1: channel 16: free: direct-tcpip: listening port 3128 for xml.alexa.com port 80, connect from 127.0.0.1 port 49998, nchannels 21
debug1: channel 18: free: direct-tcpip: listening port 3128 for www.testcouleur.com port 80, connect from 127.0.0.1 port 50000, nchannels 20
debug1: channel 11: free: direct-tcpip: listening port 3128 for www.testcouleur.com port 80, connect from 127.0.0.1 port 49994, nchannels 19
debug1: channel 17: free: direct-tcpip: listening port 3128 for www.testcouleur.com port 80, connect from 127.0.0.1 port 49999, nchannels 18
debug1: channel 19: free: direct-tcpip: listening port 3128 for www.testcouleur.com port 80, connect from 127.0.0.1 port 50001, nchannels 17
debug1: channel 20: free: direct-tcpip: listening port 3128 for www.testcouleur.com port 80, connect from 127.0.0.1 port 50002, nchannels 16
debug1: channel 21: free: direct-tcpip: listening port 3128 for www.testcouleur.com port 80, connect from 127.0.0.1 port 50003, nchannels 15
debug1: channel 13: free: direct-tcpip: listening port 3128 for api.ipinfodb.com port 80, connect from 127.0.0.1 port 49995, nchannels 14
```

Paramétrage dans Chromium :

![](/images/pref-chromium-proxy.png)

####II.3.2.3. Mise en oeuvre avec SSH sous Windows

On utilise toujours puTTY, on sélectionne D dans le forwarding :

![](/images/param-putty-socks.png)

Choisissez un port `> 1024` par exemple 1111.

Renseignez les paramètres proxy dans votre navigateur, exemple avec Chrome/Chromium qui utilisent les paramètres système Windows :

![](/images/socks-windows-param-proxy.png)

Capture en local avec Wireshark, encore une fois on observe un trafic crypté (SSL) entre 2 noeuds du réseau :

![](/images/sock-windows.png)

###II.3.3. Proxy HTTP SQUID

####II.3.3.1. Brève sur SQUID

Pourquoi SQUID ? Parce que SQUID est un proxy et que l’on peut simplement tirer partie de sa mise en cache du contenu statique (image, html) afin d’accélérer notre navigation Internet.

####II.3.3.2. Configuration serveur

Il faut installer SQUID sur votre serveur :
```
root# aptitude install squid
```

Il n’y a pas réellement de paramètrage à effectuer, SQUID fonctionne un peu tout seul, vous pouvez à la rigueur modifier son port d’écoute.

Le fichier de configuration est dans `/etc/squid/squid.conf`

Après modification n’oubliez pas de relancer le daemon de SQUID :

```
root# /etc/init.d/squid restart
```

####II.3.3.3. Configuration client Windows

Nous utilisons toujours PuTTY, pour cela il faut créer une règle de forward local sur le port d’écoute natif de SQUID (3128) :

![](/images/putty-proxy-squid.png)

Enregistrer cette règle dans votre profil de connexion PuTTY.

Ensuite il faut paramétrer votre navigateur, exemple sous Chrome qui utilise les paramètres système d’Internet Explorer :

![](/images/param-chrome-proxy-ssh.png)

###II.3.4. Partager son proxy SSH

Une option de PuTTY permet aux machines du réseau d’utiliser votre tunnel :

![](/images/partage-proxy-ssh.png)

Il suffit de cocher Local ports accepts connections from other hosts. Les utilisateurs du réseau devront renseigner dans leurs paramètres proxy votre adresse IP privé et le port d’écoute 3128.

II.4. Transfert de fichier
--------------------------

###II.4.1. Utilisation de SCP

SCP, Secure CoPy permet d’effectuer des copies distantes de façon chiffrées au travers un tunnel SSH.

####II.4.1.1. Sous Linux

Dans un terminal entrez le commande suivante :

```
root# scp –P 443 -i ~/.ssh/id_dsa « fichier » user@ip:/repertoireDestination
```

####II.4.1.2. Sous Windows

Sous Windows on utilise WinSCP, une interface graphique reposant sur SSH et le protocole SCP. [Télécharger WinSCP ici](http://winscp.net/eng/download.php). Comme sous Linux, il est possible de synchroniser des données entre différents ordinateurs d’un réseau local ou distant.

Une fois installé, lancez-le, cliquez sur Editer pour créer un profil :

![](/images/winscp-conf.png)

Une fois votre profil crée cliquez sur Sauver… :

![](/images/winscp-co.png)

Cliquez sur Connecter :

![](/images/winscp-mdp-co.png)

Entrez votre mot de passe et cliquez sur OK :

![](/images/winscpp-global.png)

À l’image d’un outil de connexion FTP vous retrouvez du côté droit le contenu de votre serveur et du côté gauche le contenu de votre machine cliente. WinSCP permet l’utilisation du drag n drop entre les deux environnements. Il propose des options supplémentaires comme l’ouverture de terminal distant mais à vous de fouiller un petit peu car ce n’est pas l’objet de l’article.

###II.4.2. Utilisation de RSYNC over SSH

RSync est un outil de synchronisation de fichier très répandu dans le monde du libre. On l’utilise pour effectuer des backups, de la synchronisation de répertoire. Il supporte les fortes charges et les gros volume de données.

Pour l’installer :

```
root# aptitude install rsync
```

Une option de Rsync permet son utilisation en combinaison de SSH :

Serveur vers client :
```
rsync -avz -e "ssh -p 443 -i $HOME/.ssh/id_dsa" user@hostname:/home/user/"
```

Client vers serveur :
```
rsync -avz -e "ssh -o PreferredAuthentications=publickey -p 443 –i $HOME/.ssh/id_dsa" Scripts/ user@hostname:/home/user
```

II.5. Montage de répertoires distant
------------------------------------

SSH propose le montage de FileSystem de façon distante via SSHFS.

Installer SSHFS :

```
root# aptitude install sshfs
```

Fonctionnement :

```
root# sshfs user@hostname:/repertoireDistant /PointDeMontage
```

Exemple :

```
root$ sshfs -p 443 user@hostname:/home/user/rép-à-monter/ /home/user/monPointDeMontage
```

Pour démonter le répertoire :

```
root# umount /pointDeMontage
```

Montage permanent dans le FSTAB, créer un répertoire de montage et éditez votre FSTAB :

```
root# mkdir /mnt/monPointDeMontage
root# nano /etc/fstab
```

Ajouter cette ligne au FSTAB :

```
sshfs#user@hostname:/repertoireDistant               /mnt/monPointDeMontage          fuse            port=votrePortSSH,user,noauto,noatime     0 0
```

Maintenant le répertoire distant sera automatiquement monté à chaque démarrage.
