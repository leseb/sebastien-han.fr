---
title: "OpCode cache: XCache pour Magento"
date: 2012-01-03 01:15:00
slug: opcode-cache-xcache-pour-magento
draft: false
categories: ["magento"]
tags: ["magento"]
---

Suite de mes articles sur l’optimisation d’une infrastructure Magento. Ici nous détaillons la mise en place de XCache et introduisons le concept des OpCode cacher.

<!--more-->

> XCache est OpCode cache open source, son rôle est d’accélérer les performances de votre serveur PHP. Celui-ci va optimiser PHP en supprimant les temps de compilation des scripts PHP en cachant ces scripts PHP compilés en RAM. Lorsque que le script doit être exécuté XCache fait appel à la version compilée stockée en RAM. Cela va indéniablement réduire les temps de chargements de vos pages,  chargement 5 fois plus rapide selon l’auteur de XCache. Le gros avantage de cacher les scripts PHP compilés a pour effet de réduire la charge du serveur.

Le project XCache est dirigé par mOo, le développeur de Lighttpd.

Pour un [historique du projet](http://xcache.lighttpd.net/wiki/Introduction) plus complet.

Comme OpCode cache, on peut également citer:

* APC
* eAccelerator
* ionCube
* Zend Cache
* MMCache

Pour plus d’informations, le [site du projet](http://xcache.lighttpd.net/wiki/)

I. Installation et configuration
================================

On commence par installer le composant serveur:

```
root@webserver:~# apt-get install php5-xcache
```

Est-ce que tout est bien installé ?

```
root@webserver:~# php -m | grep XCache
XCache
root@webserver:~# cat /etc/php5/fpm/conf.d/xcache.ini
; configuration for php xcache module
extension=xcache.so
```

Est-ce que la librairie existe ?

```
 root@webserver:~# find / -name xcache.so
/usr/lib/php5/20090626+lfs/xcache.so
```

On modifie le fichier `/etc/php5/fpm/conf.d/xcache.ini` comme suit:

```
[xcache.admin]
extension = xcache.so
# Pour que le plugin Munin puisse graffer l'activité on active la console d'admin
xcache.admin.user = "webserver"
xcache.admin.pass = "ea227598196be437de0d1cebae93a48b"
;xcache.test = On
;xcache.admin.enable_auth = On
[xcache]
xcache.shm_scheme =        "mmap"
xcache.size  =                64M
xcache.count =                 5 # nb de processeurs +1
xcache.slots =                8K
xcache.ttl   =                 0
xcache.gc_interval =           0
xcache.var_size  =            64M
xcache.var_count =             1
xcache.var_slots =            8K
xcache.var_ttl   =             0
xcache.var_maxttl   =          0
xcache.var_gc_interval =     300
xcache.test =                Off
xcache.readonly_protection = Off
xcache.mmap_path =    "/dev/zero"
xcache.coredump_directory =   ""
xcache.cacher =               On
xcache.stat   =               On
xcache.optimizer =            On
[xcache.coverager]
xcache.coverager =          Off
xcache.coveragedump_directory = ""
```

Personnellement je n’ai trouvé aucun moyen de vérifier le bon fonctionnement de XCache hormis d’installer l’interface d’administration et de faire interpréter les résultats dans des graphes. J’ai utilisé ce [projet là](http://www.ohardt.com/dev/munin/) pour générer mes graphes XCache sour Munin.

Voici des exemples de sortie de graphe:

![](/images/xcache.png)

Pour activer l’interface d’administration seul ces lignes sont nécessaires:

```
xcache.admin.user = "webserver"
xcache.admin.pass = "ea227598196be437de0d1cebae93a48b"
;xcache.test = On
;xcache.admin.enable_auth = On
```

Il suffit simplement de créer un utilisateur au hasard et de lui assigner un mot de passe. Au préalable il faut fournir ce mot en MD5 à la configuration de XCache. Pour aider à la génération de votre MD5 vous pouvez vous rendre sur ce [site](http://www.phpbbhacks.com/md5.php) ou utiliser perl.
Si vous voulez plus d’informations sur la mise en place de [l’interface d’administration](http://xcache.lighttpd.net/wiki/InstallAdministration)

Et voilà! Oui c’est tout 
