---
title: Authentification SSH forte par deux facteurs avec Google Authenticator
date: 2011-10-22 17:05:00
slug: authentification-ssh-forte-par-deux-facteurs-avec-google-authenticator
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/google-authenticator-logo.png)

Un long article a déjà été consacré à SSH. Google depuis tout juste 1 an a lancé son service de double authentification par token. Personnellement je l'utilise pour sécuriser mon compte Google et mon compte LastPass. Le projet Google Authenticator est un projet Open Source développé sous licence Apache 2.0. Une librairie PAM est également disponible. Un moyen supplémentaire d'ajouter de la sécurité lors de la connexion à votre serveur via SSH.

<!--more-->

I. L’authentification forte
===========================

I.1. Définition
---------------

Une authentification dite forte est un mécanisme d’identification requérant au minimum 2 facteurs. Google Authenticator propose une authentification en 2 étapes reposant sur la technique One Time Password:

1. Un mot de passe
2. Un token d’identification unique, généré par votre téléphone, sa durée de vie est de 30 secondes

I.2. Principe de fonctionnement
-------------------------------

Dans la pratique, lorsque vous allez vous loger sur un système vous aller renseigner votre mot de passe puis le token d’identification. Google Authenticator dispose d’une application sur iOS, Android, Windows Phone.
Le site du projet [Google Authenticator](http://goo.gl/HXIiF) et la [description par Google](https://www.youtube.com/watch?feature=player_embedded&v=zMabEyrtPRg).


II. Mise en oeuvre avec openSSH
===============================

Installation des paquets necessaires:

```
$ sudo apt-get update && sudo apt-get install -y subversion build-essential gcc python-dev
```

On installe la version la plus récente de Mercurial car la version du dépôt ne fonctionne pas.

```
$ wget http://mercurial.selenic.com/release/mercurial-2.1.tar.gz
$ tar xzf mercurial-2.1.tar.gz
$ cd mercurial-2.1/
```

Personnellement je n’ai pas pour objectif de disposer de Mercurial de façon permanente sur ma machine. J’effectue donc une installation locale.

```
$ make local
$ sudo ./hg clone https://code.google.com/p/google-authenticator/ gauth
warning: code.google.com certificate with fingerprint 08:b0:3f:75:80:9e:e3:e5:30:a8:75:5e:03:64:15:7e:95:59:dc:c7 not verified (check hostfingerprints or web.cacerts config setting)
requesting all changes
adding changesets
adding manifests
adding file changes
added 99 changesets with 468 changes to 315 files
updating to branch default
...
```

Une fois le répo du projet cloné on installe la librairie PAM.

```
$ cd gauth/libpam/
$ make && make install
...
You need to be root to install this module.
Invoking sudo:
cp pam_google_authenticator.so /lib/security
cp google-authenticator /usr/local/bin
```

On édite ses directives PAM pour le service SSH dans `/etc/pam.d/sshd` en rajoutant après `@include common-auth`:

```
auth required pam_google_authenticator.so
```

On édite enfin notre configuration SSH, `/etc/ssh/sshd_config` en modifiant à yes la directive suivant:

```
ChallengeResponseAuthentication yes
```

Relancer votre daemon SSH:

```
$ sudo service ssh restart
```

On appelle le binaire de configuration du service de double authentification de Google:

```
$ google-authenticator
 
Do you want authentication tokens to be time-based (y/n) y
https://www.google.com/chart?chs=200x200&amp;chld=M|0&amp;cht=qr&amp;chl=otpauth://totp/user@server%3Fsecret%3DTVZ3JDHEPGJ6QKFNS
Your new secret key is: TVZ3DJFPQH6QQHZR
Your verification code is 647363
Your emergency scratch codes are:
43448709
37387604
70975514
14374562
23845044
 
Do you want me to update your "/home/leseb/.google_authenticator" file (y/n) y>
 
Do you want to disallow multiple uses of the same authentication
token? This restricts you to one login about every 30s, but it increases
your chances to notice or even prevent man-in-the-middle attacks (y/n) y>
 
By default, tokens are good for 30 seconds and in order to compensate for
possible time-skew between the client and the server, we allow an extra
token before and after the current time. If you experience problems with poor
time synchronization, you can increase the window from its default
size of 1:30min to about 4min. Do you want to do so (y/n) y
 
If the computer that you are logging into isn't hardened against brute-force
login attempts, you can enable rate-limiting for the authentication module.
By default, this limits attackers to no more than 3 login attempts every 30s.
Do you want to enable rate-limiting (y/n) y
```

Copier le lien, coller le dans un navigateur et scanner le QRcode avec votre téléphone. Le lien n’est valide que très peu de temps.

Notes:

* Vous pouvez ajouter des codes personnalisés dans `~/.google_authenticator`
* Si vous comme moi vous utilisé l’authentification par clef privé/publique cela ne fonctionnera pas. Fonctionne uniquement avec l’authentification par mot de passe.
On test le tout :

```
$ ssh user@server
Password: 
Verification code: 
Linux server 2.6.32-37-server #81-Ubuntu SMP Fri Dec 2 20:49:12 UTC 2011 x86_64 GNU/Linux
Ubuntu 10.04.3 LTS
 
Welcome to the Ubuntu Server!
 * Documentation:  http://www.ubuntu.com/server/doc
Last login: Fri Oct 21 14:20:40 2011 from foobar
user@server:~$
```

Et voilà !
