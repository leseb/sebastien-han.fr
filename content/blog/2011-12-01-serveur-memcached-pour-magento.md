---
title: Serveur Memcached pour Magento
date: 2011-12-01 01:00:00
slug: serveur-memcached-pour-magento
draft: false
categories: ["magento"]
tags: ["magento"]
---

![](/images/memcached-logo.png)

Suite de mes articles sur l’optimisation d’une infrastructure Magento. Ici nous détaillons la mise en place d’un serveur Memcached.

<!--more-->

Memcached est un système d’usage général servant à gérer la mémoire cache distribuée. Il est souvent utilisé pour augmenter la vitesse de réponse des sites web créés à partir de bases de données. Il gère les données et les objets en RAM de façon à réduire le nombre de fois qu’une même donnée stockée dans un périphérique externe est lue. Il fonctionne sous Unix, Windows et MacOS et est distribué selon les termes d’une licence libre dite permissive.

I. Installation de Memcached
============================

La mise en place d’un serveur cache peut s’avérer très utile pour cacher les requêtes récurantes. Ici nous l’utilisons dans le cadre de Magento pour mettre en cache les sessions mais nous pourrions très bien l’utiliser pour cacher les requêtes d’une base de données.
Nous commençons par installer le composant serveur:

```
user@memcache-server~:$ sudo apt-get install memcached
```

Est-ce que memcached tourne ?

```
user@memcache-server~:$ sudo lsof -i :11211
COMMAND     PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
memcached 13649 nobody   26u  IPv4  94582      0t0  TCP localhost:11211 (LISTEN)
memcached 13649 nobody   27u  IPv4  94584      0t0  UDP localhost:11211
```

On installe ensuite le module php:

```
user@memcache-server~:$ sudo apt-get install php5-memcached
```

Est-ce que ma librairie s’est bien installée ?

```
user@memcache-server~:$ sudo php -m | grep memcached
memcached
```

II. Configuration dans Magento
==============================

On ajoute cette configuration dans le fichier `/var/www/vhosts/website/app/etc/local.xml`:
Votre configuration est à adapter si votre service memcached n’est pas sur la machine hébergeant Magento (changez l’adresse IP)

```
<global>
  <cache>
        <backend>memcached</backend>
        <memcached>
          <compression/>
          <cache_dir/>
          <hashed_directory_level/>
          <hashed_directory_umask/>
                  <file_name_prefix/>
                  <servers>
                         <default>
                          <host>127.0.0.1</host>
                          <port>11211</port>
                         <persistent>1</persistent>
                   </default>
                  </servers>
          </memcached>
  </cache>
<session_save><![CDATA[memcache]]></session_save>
<session_save_path><![CDATA[tcp://127.0.0.1:11211?persistent=1]]></session_save_path>
</global>
```

III. Est-ce que memcached cache bien les objets ?
=================================================

Pour vérifier cela nous allons initier une connexion Telnet sur le port d’écoute de memcached et se connecter dans sa console.
Une fois dans la console de memcached rentrer `stats`.

```
user@memcache-server~:$ telnet localhost 11211
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
stats
STAT pid 13649
STAT uptime 742
STAT time 1327986177
STAT version 1.4.5
STAT pointer_size 32
STAT rusage_user 0.020001
STAT rusage_system 0.000000
STAT curr_connections 5
STAT total_connections 7
STAT connection_structures 6
STAT cmd_get 0
STAT cmd_set 0
STAT cmd_flush 0
STAT get_hits 0
STAT get_misses 0
STAT delete_misses 0
STAT delete_hits 0
STAT incr_misses 0
STAT incr_hits 0
STAT decr_misses 0
STAT decr_hits 0
STAT cas_misses 0
STAT cas_hits 0
STAT cas_badval 0
STAT auth_cmds 0
STAT auth_errors 0
STAT bytes_read 38
STAT bytes_written 798
STAT limit_maxbytes 67108864
STAT accepting_conns 1
STAT listen_disabled_num 0
STAT threads 4
STAT conn_yields 0
STAT bytes 0
STAT curr_items 0
STAT total_items 0
STAT evictions 0
STAT reclaimed 0
END
quit
Connection closed by foreign host.
```

Et voilà! La mise en place de votre serveur memcached est terminée.


