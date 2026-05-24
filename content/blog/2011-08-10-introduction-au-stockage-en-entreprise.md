---
title: Introduction au stockage en entreprise
date: 2011-08-10 00:22:00
slug: introduction-au-stockage-en-entreprise
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/stockage.png)

Utiliser de bonnes solutions de stockage en entreprise est primordial car les données du SI sont plus importantes que tout. Les données étant critiques, il est important de comprendre les solutions de stockage disponibles afin ‘évaluer notre besoin. Ici nous allons décrire les 3 formes de stockage à savoir le DAS, NAS et le SAN et les technologies qui les composent.

<!--more-->

I. Pour bien commencer
======================

Avant de débuter avec les techniques de stockage il est important de revenir sur ce qui fait le stockage, le disque dur. C’est l’unité de stockage des données, l’élément primordiale à toutes architectures de stockage. Il vous avant tout se poser la question suivante : pourquoi faire ai-je besoin de cette capacité de stockage ? Pour quel usage ? Archivage ? Sauvegarde ? Service utilisateurs ? Partage ? La différence entre le choix sera donc significative.

Mais comment choisir son disque dur sur des critères plus généraux ?

![#3](/images/disque.png)

* La capacité
* Les temps d’accès
* Les taux de lectures/écritures
* Nombre de rotations par minutes 5400-15 000
* MTBF
* Mémoire cache
* Débit théorique de son interface (ATA, SATA, etc…)
* Marque reconnue pour sa fiabilité ?
* Prix !

Autant de composantes pour définir son architecture de stockage

Mais qu’est-ce qui fait réellement la performance d’un disque dur ?

* Le contrôleur de son interface I/O
* Ses spécifications mécaniques

> Quid des disques SSD ?
>
> Apparût sur le marché depuis bientôt 7 ans, les Solid State Drive jouissent de temps d’accès extrêmement réduits, de taux écritures 2 voir 3 fois supérieurs à des disques mécaniques et bien d’autres avantages tels que l’absence de mécanique (le rendant plus résistant) et d’émission de chaleur. On accorde donc qu’il y a véritablement un fossé côté performances entre disques mécaniques et flash. Pour autant, ils ne sont que très peu répandus dans les baies de stockage du fait du prix du GO encore trop élevé et de la durée de vie assez imprévisible. L’investissement est trop lourd, le SSD reste presque un luxe (non justifié à long terme ?) pour les entreprises. Le SSD n’a donc pas encore révolutionné l’ère du stockage, l’offre n’ayant pas tellement évolué depuis leur arrivée.

II. DAS : Direct Attached Storage
=================================

![](/images/DAS.png) 

Le DAS est une extension de stockage reliée à une machine par un câble. On accède généralement à la ressource par un point unique (la machine auquelle le périphérique est connecté). On peut donc l’imaginer comme un disque dur externe que l’on brancherait sur un ordinateur.

Les principales caractéristiques :

* N’utilise pas le réseau
* Les échanges sont effectués par bloc de données
* Débits

Le protocole I/O est SCSI tandis que les liaisons (media) supportées sont nombreuses :
* SAS
* SSA
* FC
* Ethernet

II.1. Avantages et inconvénients
--------------------------------

La solution est principalement adaptée à des entreprises de petites tailles

* Rapide à mettre en place
* Peu coûteux

II.2. Inconvénients
-------------------

Celle-ci a néanmoins quelques inconvénients :

* Point de défaillance unique (SPOF)
* Pas de fonction de partage de la donnée
* 1 disque pour 1 machine = mauvaise gestion de la capacité des disques durs
* Restreint à une machine

III. NAS : Network Area Storage
===============================

Un NAS est une unité de stockage accessible à travers le réseau. On l’utilise pour stocker des types données, c’est notamment ce qui le différencie le plus des autres méthodes de stockages qui elles gèrent des types blocs. Supportant la plupart des protocoles de partage tel que CIFS (Windows) et NFS (Unix), ils disposent d’autres fonctions comme le FTP, la gestion d’utilisateurs/groupes, le support de nombreux systèmes de fichiers ce qui les rendant très polyvalent. Ils font office de solution all-in-one car ils sont construits comme des petits serveurs composés de baies pour entreposer les disques, d’une carte mère, cpu, RAM, contrôleur I/O. Ils fonctionnent dans 99% (pour ne pas dire 100%) autour d’architecture embarquée à base de noyau Linux.

Les principales caractéristiques :

* Utilise le réseau
* Les échanges sont en mode fichier
* Permet l’accès simultanée d’une même donnée
* Les disques sont stockés dans la carcasse du NAS
* Débits correspondants à celui du réseau sur lequel il est implémenté

Les protocoles I/O sont :
* NFS
* CIFS

Tandis que la liaison (media) supportée est Ethernet (paire torsadée).

III.1. Avantages
----------------

* Mise en place rapide sur le réseau existant
* Rien à recabler
* Supporte beaucoup de protocole réseau et notamment ceux de partage
* Sécurisé
    * Firewall intégré
    * Cryptage des données
* Administration simple
* Performances intéressantes selon les composants (charge CPU + RAM)
* Peut se placer en tant que NAS Gateway devant un SAN
* Module DAS plugable pour étendre le nombre de baies et ajouter des disques
 
III.2. Inconvénients
--------------------

* Point de défaillance unique (SPOF)
* La puissance du NAS peut s’avérer insuffisante selon le nombre de connexion, on parle bien de limite au niveau des ressources RAM et CPU

III.3. NAS Gateway
------------------

Le NAS en tant que passerelle est une autre façon d’appréhender les problématiques de stockage. Dans ce modèle, un NAS est placé en frontal du SAN et ne contient aucun disque, ce qui permet de traiter les requêtes en mode fichier par le NAS. Il se positionne comme une passerelle pour SAN qui lui contient les disques de stockage. Le NAS requête les blocks de données  du SAN et les retranscrit en un type fichier.

IV. SAN : Storage Area Network
==============================

L’utilisation d’un SAN est basée sur l’utilisation d’un réseau dédié au transfert de données. Il permet le stockage et l’accès aux données à très grande échelle. Généralement on parle de baie contenant un grand nombre de disques durs. Le réseau dédié est la plupart du temps basé sur du FC. FC pour Fiber Channel est un protocole l est important de comprendre que l’on gère des blocs de données.

Les principales caractéristiques :

* Utilise le réseau
* Les échanges sont en mode bloc
* On accède aux données à travers le réseau
* Les disques ne sont pas stockés sur les serveurs mais dans la baie du SAN
* On peut relier les disques à plusieurs machines en utilisant des systèmes de fichiers distribués comme OCFS ou GFS2

Le protocole I/O est SCSI tandis que les liaisons (media) supportées sont nombreuses :

* Fiber Channel
* iSCSI
* AoE : ATA over Ethernet
* Fiber Channel over Ethernet

IV.1. Avantages
---------------

* Débits rapides en Fiber Channel
* Débits honorables en iSCSI
* Durée de vie des disques plus importantes
* Meilleurs gestion de données, moins de gaspillage sur l’utilisation des disques
* Administration centralisée

IV.2. Inconvénients
-------------------

* Long à mettre en place (déploiement) car necessite un câblage complet
* Très couteux
* SPOF très critique

J’espère que cette introduction vous sera profitable.
