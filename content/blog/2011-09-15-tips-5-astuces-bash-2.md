---
title: "Tips: 5 astuces Bash – 2"
date: 2011-09-15 22:38:00
slug: tips-5-astuces-bash-2
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/ILoveBash1.png)

Pour les amoureux du Bash on continue :)

<!--more-->

###Tip 1. Installer toutes les dépendances d’un paquet avant de l’installer via ses sources

```
$ apt-get build-dep mon_paquet
```

###Tip 2. Supprimer un paquet pour de bon

```
$ apt-get autoremove --purge mon_paquet
```

###Tip 3. Lecture des log en continu

```
$ tail -f /var/log/auth.log
```

###Tip 4. Rechercher une chaine de caractère de façon récursive

```
$ grep -RHin chaine path
```

* `-R` : recherche récursive
* `-H` : afficher le nom de fichier pour chaque concordance
* `-i` : ignorer la distinction de la casse
* `-n` : afficher les numéros de lignes avec les lignes sorties

###Tip 5. Insulter les utilisateurs de sudo quand ils se trompent dans la saisie de leur mot de passe. 

La commande sed remplace simplement `env_reset` par `env_reset,insults` dans le fichier sudoers.
On édite le fichier /etc/sudoers:

```
$ sed -i s/env_reset/env_reset,insults/ /etc/sudoers
```

Et on test le tout 

```
sudo reboot
[sudo] password for administrateur:
We'll all be murdered in our beds!
```
