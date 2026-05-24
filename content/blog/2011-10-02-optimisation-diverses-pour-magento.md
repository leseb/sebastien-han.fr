---
title: Optimisation diverses pour Magento
date: 2011-10-02 22:48:00
slug: optimisation-diverses-pour-magento
draft: false
categories: ["magento"]
tags: ["magento"]
---

![](/images/magento-logo.png)

Pour faire suite au billet sur Nginx voici une liste non-exhaustives des différentes optimisations que l’on peut apporter à une plateforme propulsée par Magento. Concernant l’implémentation des solutions proposées cela fera l’objet d’autres billets.

<!--more-->

Magento est un CMS Open Source de gestion de boutiques e-commerce. À travers ma petite expérience j’ai pu accumuler différentes best-practices et optimisations pour construire une architecture pouvant supporter de fortes charges.

I. Utiliser une infrastructure Cloud
====================================

Afin de profiter de l’élasticité des ressources et du provisionning on demand on fera idéalement appel à des fournisseurs de IaaS comme Rackspace ou Amazon. L’utilisation de Cloud Server permet également une réduction de vos coûts  . Important aussi, dès le départ imaginer votre infrastructure de façon scalable, horizontalement de préférence. On aimera compartimenter les ressources en front, middle et back end. Par exemple:

1. Front web: serveur de cache
2. Middle web: serveur web
3. Back end: serveur de base de données

II. Front web:  reverse-proxy cache de type Varnish
===================================================

En effet l’essentiel du contenu d’un site boutique sont les images. Implémenter une solution de cache est idéale. Dans ce contexte Varnish va mettre en cache tous les objets statiques comme les images et ne fera pas d’appelles au serveur web. S’il détecte un changement côté serveur web, il mettra à jour son cache d’objets. Vous pouvez donc activer le mode Full Page Caching avec Varnish et Magento. À savoir aussi si vous développez votre propre template que Varnish gère à ce jour la norme ESI (Edge Slide Include). Un gros plus pour booster votre site. 

Personnellement j’ai utilisé ce projet qui fonctionne à merveille:
[https://github.com/madalinoprea/magneto-varnish](https://github.com/madalinoprea/magneto-varnish)

Autrement il existe une version payante qui implémente une compatibilité complète avec Varnish. [http://www.magentocommerce.com/magento-connect/pagecache-powered-by-varnish.html](http://www.magentocommerce.com/magento-connect/pagecache-powered-by-varnish.html)

III. Nginx au lieu d’Apache
===========================

Je ne représente pas Nginx, celui-ci c’est depuis quelque année montré beaucoup plus performant qu’Apache. Depuis Janvier il est même passé devant le serveur web de Microsoft IIS. Ici le but du serveur web est gérer les requêtes dynamiques avec PHP et les accès à la base de données.

IV. Opcode cache
================

Aussi appelé accélérateur php, son rôle est de mettre en cache une partie du code PHP qui est exécuté de façon récurrente. On peut Xcache, APC, eAccelerator…

V. Sessions et cache de Magento en ram
======================================

Vous pouvez simplement utiliser le système de fichiers TMPFS ou en utilisant un serveur memcached. Ici nous ne sommes plus dépendants des débits I/O des disques mais nous passons tout par la RAM. On gagne en temps d’accès et en rapidité.

VI. Serveur Memcached ou Redis
==============================

Celui-ci peut faire office de cache session et/ou cacher les requêtes sur la base de données.
Redis est le petit dernier en date des optimisations de Magento, Redis est une base de donnée de type NoSQL possédant une architecture de type clef/valeur. Un article entier lui est consacré.

VII. Load balancer
==================

Très souvent les providers d’infrastructures proposent des solutions de load-balancing. Il est donc intéressant de placer un load-balancer en front, celui-ci s’occupera de répartir la charge entre chaque serveur web en middle end.

VIII. Content Delivery Network
==============================

Si votre site est renommée, vos clients y accèdent depuis le monde entier. Un client basé en Chine accédant à votre site dont le serveur est basé aux États-Unis aura très certainement des temps de réponses et de chargements plus lent qu’un client accédant au site depuis les États-Unis. Le constat est donc très simple, les contenus les plus long à délivrer sont les images, de plus en plus lourdes. Utiliser un CDN ou Content Delivery Network permet de délivrer le contenu désiré en étend au plus proche de l’origine de la requête. Pour reprendre l’exemple du client Chinois, avec un CDN celui-ci accédera au contenu dynamique via le serveur basé aux États-Unis et aux images via le CDN basé en Chine. On peut imager les CDN comme des serveurs de cache. On peut citer Akamai comme CDN provider le plus reconnu, il est utilisé par Rackspace pour son service Cloud Files.
