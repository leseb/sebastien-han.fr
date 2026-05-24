---
title: "Redis: cache backend pour Magento"
date: 2012-03-01 01:51:00
slug: redis-cache-backend-pour-magento
draft: false
categories: ["magento"]
tags: ["magento"]
---

![](/images/redis-logo.png)

Dans un précédent article, j’avais parlé de cacher vos sessions avec Memcached. Ici le principe reste identique, seulement nous utilisons une base de données NoSQL: Redis. Le but de cet article n’est pas de faire une introduction aux bases NoSQL, mais simplement de présenter l’utilisation de Redis dans un contexte avec Magento.

<!--more-->

I. À propos de Redis
====================

Le paragraphe qui suit est tiré du livre blanc sur l’introduction aux bases NoSQL de la société Smile. Merci à son auteur Aurélien Foucret.

Long story short, sachez qu’il existe plusieurs types de base NoSQL, on peut en dénombrer 4:

* Paradigme clé / valeur
* Bases orientées colonnes
* Bases documentaires
* Bases orientées graphes

Redis se positionne comme une base clé / valeur (key/value). Il s’agit de la catégorie de base NoSQL la plus basique. Ici chaque « objet » est identifié par une clé unique, clé grâce à laquelle celui-ci pourra être requêté. Dans ce modèle on ne dispose généralement que des quatre opérations.

Dans un précédent article, j’avais parlé de cacher vos sessions avec Memcached. Ici le principe reste identique, seulement nous utilisons une base de données NoSQL: Redis. Le but de cet article n’est pas de faire une introduction aux bases NoSQL, mais simplement de présenter l’utilisation de Redis dans un contexte avec Magento.

* `create` : créer un nouvel objet avec sa clé → create(key, value)
* `read` : lit un objet à partir de sa clé → read(key)
* `update` : met à jour la valeur d’un objet à partir de sa clé → update(key, value)
* `delete`: supprime un objet à partir de sa clé → delete(key)

Les bases de ce type disposent pour la plupart d’une interface HTTP REST permettant de procéder très simplement à des requêtes, et ceci depuis n’importe quel langage de développement.

L’approche volontairement très limitée de ces systèmes sur le plan fonctionnel est radicale et leur permet d’afficher des performances exceptionnellement élevées en lecture et en écriture ainsi qu’une scalabilité horizontale considérable. Le besoin de scalabilité verticale est fortement réduit au niveau des bases par le caractère très simple des opérations effectuées.

II. Installation de la solution
===============================

II.1. Installation de Redis
---------------------------

Pour cela rendez-vous sur le [site du projet](http://redis.io/)

Ensuite nous appliquons la procédure habituelle d’installation depuis les sources:

```
user@magento:~$ mkdir redis
user@magento:~$ cd redis/
user@magento:~/redis$ wget http://redis.googlecode.com/files/redis-2.4.7.tar.gz
--2012-01-31 15:38:29--  http://redis.googlecode.com/files/redis-2.4.7.tar.gz
Résolution de redis.googlecode.com... 173.194.65.82
Connexion vers redis.googlecode.com|173.194.65.82|:80...connecté.
requête HTTP transmise, en attente de la réponse...200 OK
Longueur: 611577 (597K) [application/x-gzip]
Sauvegarde en : «redis-2.4.7.tar.gz»
 
100%[=======================================================================] 611 577     1,03M/s   ds 0,6s    
 
2012-01-31 15:38:30 (1,03 MB/s) - «redis-2.4.7.tar.gz» sauvegardé [611577/611577]
user@magento:~/redis$ tar xzf redis-2.4.7.tar.gz
user@magento:~/redis$ cd redis-2.4.7/
user@magento:~/redis/redis-2.4.7$ make &&make install
user@magento~/redis/redis-2.4.7$ cd utils/
user@magento:~/redis/redis-2.4.7/utils$ ./install_server.sh
Welcome to the redis service installer
This script will help you easily set up a running redis server
 
Please select the redis port for this instance: [6379]
Selecting default: 6379
Please select the redis config file name [/etc/redis/6379.conf]
Selected default - /etc/redis/6379.conf
Please select the redis log file name [/var/log/redis_6379.log]
Selected default - /var/log/redis_6379.log
Please select the data directory for this instance [/var/lib/redis/6379]
Selected default - /var/lib/redis/6379
Please select the redis executable path [/usr/local/bin/redis-server]
Copied /tmp/6379.conf =&gt; /etc/init.d/redis_6379
Installing service...
update-rc.d: using dependency based boot sequencing
insserv: warning: script 'K02perl-fcgi' missing LSB tags and overrides
insserv: warning: script 'redis_6379' missing LSB tags and overrides
insserv: warning: script 'perl-fcgi' missing LSB tags and overrides
insserv: There is a loop between service munin-node and redis_6379 if stopped
insserv:  loop involving service redis_6379 at depth 2
insserv:  loop involving service munin-node at depth 1
insserv: Stopping redis_6379 depends on munin-node and therefore on system facility `$all' which can not be true!
insserv: exiting now without changing boot order!
update-rc.d: error: insserv rejected the script header
Starting Redis server...
Installation successful!
```

Nous vérifions que le serveur est bien démarré:

```
user@magento:~/redis/redis-2.4.7/utils$ lsof -i :6379
COMMAND     PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
redis-ser 10137 root    4u  IPv4 242917      0t0  TCP *:6379 (LISTEN)
```

La base est-elle fonctionnelle ?

```
user@magento:/usr/share/munin/plugins$ redis-cli
redis 127.0.0.1:6379> ping
PONG
redis 127.0.0.1:6379> set foo bar
OK
redis 127.0.0.1:6379> get foo
"bar"
```

Redis fonctionne correctement, passons maintenant à l’installation de la librairie php.

II.2. Installation de la librairie php_redis
--------------------------------------------

Afin de faire communiquer Magento et Redis nous avons besoin d’une [librairie php](https://github.com/nicolasff/phpredis).
Nous clonons le rep Git:

```
user@magento:~/redis$ mkdir phpredis
user@magento:~/redis$ cd phpredis/
user@magento:~/redis/phpredis$ sudo git clone https://github.com/nicolasff/phpredis.git
Cloning into phpredis...
remote: Counting objects: 2440, done.
remote: Compressing objects: 100% (855/855), done.
remote: Total 2440 (delta 1638), reused 2361 (delta 1574)
Receiving objects: 100% (2440/2440), 530.71 KiB | 401 KiB/s, done.
Resolving deltas: 100% (1638/1638), done.
user@magento:~/redis/phpredis$ cd phpredis/
user@magento:~/redis/phpredis/phpredis$ sudo apt-get install php5-dev
user@magento:~/redis/phpredis/phpredis$ phpize
Configuring for:
PHP Api Version:         20090626
Zend Module Api No:      20090626
Zend Extension Api No:   220090626
user@magento:~/redis/phpredis/phpredis$ sudo ./configure
user@magento:~/redis/phpredis/phpredis$ sudo make && make install
```

La méthode proposée ici correspond à une installation avec `php-fpm`, éditons la configuration de php-fpm et ajoutons la nouvelle librairie :

```
user@magento:~/redis/phpredis/phpredis$ sudo echo -e "; configuration for php redis module \n extension=redis.so" > /etc/php5/fpm/conf.d/redis.ini
```

On relance php et on vérifie que la librairie est bien présente:

```
user@magento:~/redis/phpredis/phpredis$ sudo service php5-fpm restart
Restarting PHP5 FastCGI Process Manager: php5-fpm.
user@magento:~/redis/phpredis/phpredis$ php5 -m | grep redis
redis
```

II.3. Installation du module pour Magento
-----------------------------------------

Maintenant que Redis et la librairie php sont fonctionnels, il ne manque plus que l’installation du module dans Magento.

```
cd [votre répertoire Magento]
user@magento:/var/www/vhosts/nginx-magento$ sudo modman init
user@magento:/var/www/vhosts/nginx-magento$ sudo modman rediscache clone git://github.com/colinmollenhour/Cm_Cache_Backend_Redis.git
```

Maintenant éditez votre `app/etc/local.xml` avec :

```
<cache>
    <backend>Zend_Cache_Backend_Redis</backend>
    <slow_backend>2</slow_backend>
    <slow_backend_store_data>0</slow_backend_store_data>
    <auto_refresh_fast_cache>0</auto_refresh_fast_cache>
    <backend_options>
        <server>127.0.0.1</server>
        <port>6379</port>
        <database>database</database>
        <use_redisent>0</use_redisent>  <!-- 0 for phpredis, 1 for redisent -->
        <automatic_cleaning_factor>20000</automatic_cleaning_factor> <!-- optional, 20000 is the default, 0 disables auto clean -->
    </backend_options>
</cache>
```

III. Test de l’installation
===========================

Ici nous allons nous connecter à la console de redis et observer les objets.

```
user@magento:/var/www/vhosts/nginx-magento$ redis-cli
redis 127.0.0.1:6379> select 2
OK
redis 127.0.0.1:6379[2]> KEYS *
 1) "zc:k:21d_STORE_DEFAULT_CONFIG_CACHE"
 2) "zc:k:21d_STORE_ADMIN_CONFIG_CACHE"
 3) "zc:ti:21d_TRANSLATE"
 4) "zc:k:21d_CONFIG_GLOBAL_STORES"
 5) "zc:k:21d_CONFIG_GLOBAL"
 6) "zc:k:21d_CORE_CACHE_OPTIONS"
 7) "zc:k:21d_CONFIG_GLOBAL_STORES_DEFAULT"
 8) "zc:k:21d_CONFIG_GLOBAL_WEBSITES"
 9) "zc:ti:21d_STORE_GROUP"
10) "zc:ti:21d_MAGE"
11) "zc:ti:21d_THEME_FRONTEND_DEFAULT_DEFAULT"
12) "zc:k:21d_CONFIG_GLOBAL_STORES_ADMIN"
13) "zc:k:21d_C7E582F7A3B1B41FD5CD10C492C2EE13C60BAE44"
14) "zc:k:21d_CONFIG_GLOBAL_ADMIN"
15) "zc:ti:21d_BLOCK_HTML"
16) "zc:k:21d_APP_B1FB6E8F13287C01E5C05063633DDA4C"
17) "zc:k:21d_99A9775DDD6C385A949466E569BFEDD7B452769B"
18) "zc:ti:21d_COLLECTION_DATA"
19) "zc:ti:21d_DEFAULT"
20) "zc:ti:21d_LAYOUT_GENERAL_CACHE_TAG"
21) "zc:k:21d_LAYOUT_1D6CC9D53ACBA5EFACEDB7DAD4C6F14E6"
22) "zc:k:21d_CONFIG_GLOBAL_INSTALL"
23) "zc:k:21d_TRANSLATE_EN_US_FRONTEND_1_DEFAULT_DEFAULT"
24) "zc:ti:21d_CMS_BLOCK"
25) "zc:ti:21d_STORE"
26) "zc:k:21d_LAYOUT_FRONTEND_STORE1_DEFAULT_DEFAULT"
27) "zc:k:21d_CONFIG_GLOBAL_ADMINHTML"
28) "zc:ti:21d_STORE_DEFAULT"
29) "zc:k:21d_APP_E4D52B98688947405EDE639E947EE03D"
30) "zc:ti:21d_WEBSITE"
31) "zc:ti:21d_CHECKOUT_CART_INDEX"
32) "zc:ti:21d_CONFIG"
33) "zc:ti:21d_CUSTOMER_ACCOUNT_LOGIN"
34) "zc:ti:21d_CATALOG_CATEGORY"
35) "zc:ti:21d_CUSTOMER_LOGGED_OUT"
36) "zc:k:21d_CONFIG_GLOBAL_CRONTAB"
37) "zc:k:21d_APP_4E4ABDD8DC00C3DACB3C1597944A3B6C"
38) "zc:k:21d_LAYOUT_140B29DDD8AC46F1AA7747C10AC2D0A32"
redis 127.0.0.1:6379[2]>
```
Et voilà!
