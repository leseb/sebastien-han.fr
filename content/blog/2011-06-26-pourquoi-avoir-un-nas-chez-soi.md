---
title: Pourquoi avoir un NAS chez soi ?
date: 2011-06-26 00:02:00
slug: pourquoi-avoir-un-nas-chez-soi
draft: false
categories: ["cloud"]
tags: ["cloud"]
---

![](/images/synology-ds-411j.png)

À l’heure où la dématérialisation écrase tous les supports physiques sur son passage, que va-t-il advenir de nos vieux lecteurs salon ? De plus le volume de données chez les particuliers augmentent considérablement (photos, vidéos de vacance). Seulement une crainte surgit, celle de perdre toutes nos précieuses données ! Pourquoi ne pas apporter un peu de redondance dans le stockage de nos données en utilisant un NAS ! Ayant récemment fait l’acquisition d’un NAS, c’est l’occasion d’en parler un peu ici !

<!--more-->

I. Un NAS c’est quoi ?
======================

I.1. Définition du NAS
----------------------

NAS : Network Area Storage est un boitier équipé de baies contenant des disques durs. Celui-ci repose principalement sur des technologies embarquées (carte mère et processeur). L’OS est généralement à base d’un noyaux UNIX ou Linux. Relié au réseau il sert principalement à stocker des données et partager de l’information à travers le réseau local. Il offre une bonne disponibilité et une forte tolérance à la panne avec l’utilisation de technologies RAID. Parmi les principaux avantages :

* Encombrement réduit
* Faible consommation
* Technologies embarquées
* Possibilités de RAID
* Relié au réseau (accessible depuis les postes du LAN)

I.2. Retour sur les technologies de stockage
--------------------------------------------

Retour rapide sur les technologies de stockage et de  RAID les plus connues disponibles sur les NAS :

* JSOB : pour ‘n’ disques physiques le système ne voit qu’un disque logique. Les disques physiques sont regroupés en une grappe, les données sont écrites au fur et à mesure que les disques se remplissent. Une fois que le premier disque est plein le système débute l’écriture sur le deuxième disque et ainsi de suite… Aucune tolérance de panne.
* RAID 0 : nécessite au minimum 2 disques, pour ‘n’ disques physiques le système ne voit qu’un disque logique. La capacité est égale à la combinaison des disques. Il allie la puissance des disques installés, les temps d’accès et les taux de lectures/écritures sont plus élevés que sur un seul disque. Orienté performance. Aucune tolérance à la panne, les données sont écrites aléatoirement sur les 2 disques, si un disque crash il sera difficile de récupérer les données, voir impossible.
* RAID 1 : souvent appelé mirroring, nécessite au minimum 2 disques, pour ‘n’ disques physiques le système ne voit qu’un disque logique. La capacité est égale à ‘n’ disque – 1. Les données sont écrites simultanément sur les 2 disques. Oui on perd un disque au niveau de la capacité de stockage mais la tolérance à la panne est intéressante. Si le volume perd un disque, le second possède l’intégralité des données. Une étape de reconstruction des données est possible après réinsertion d’un nouveau disque à la grappe.
* RAID 5 : nécessite 3 disques minimum, pour ‘n’ disques physiques le système ne voit qu’un volume de données correspondant à ‘n’ – 1 disque en capacité de stockage. Sur chaque disque sont écrits des bits de parité, réservant automatiquement 1/3 du disque. Forte tolérance de panne. Si panne d’un disque (et pas plus) la réinsertion d’un nouveau disque reconstruira le volume et les données sur celui-ci. Le temps de reconstruction varie selon le volume de données à reconstruire même si celui-ci est généralement de plusieurs heures.
* RAID 5 + spare :  nécessite au moins 4 disques dont un sera assigné à la  reconstruction automatique  du volume en cas de crash.
* RAID 6 : nécessite au minimum 4 disques, même principe que le RAID 5 (gestion du bit de parité) hormis qu’il peut gérer la panne simultanée de 2 disques durs.
* RAID 10 : nécessite au minimum 4 disques, combinaison des RAID 0 et 1, ici on allie performance et tolérance de panne.

I.3. Exemple d’un réseau
------------------------

![](/images/reseau-syno.png)

II. Présentation du matériel
============================

II.1. Synology DS-411J
----------------------

![](/images/synology-ds-411j.png)

Caractéristiques  principales :

* Processeur à 1 200 MHz
* Mémoire : 128 Mo
* 4 baies 3,5″ pour disques SATA (non livrés) jusqu’à 12 To
* Format des disques : FAT et NTFS en externe et EXT3 ou Synology Hybrid RAID (SHR) en interne
* Géométrie des disques :
    * Pas de RAID
    * RAID 0 pour accélérer les échanges
    * RAID 1 pour sécuriser les données copiées en mode miroir
    * RAID 5 pour sécuriser les données copiées avec une parité partagée sur 3 ou 4 disques
    * RAID 5 avec 1 disque en réserve
    * RAID 6 supportant la panne de 2 disques

* Interfaces :
    * 1 port Ethernet 10/100/1000 Mbps sur RJ-45
    * 2 ports USB 2.0 Hi-Speed (imprimantes compatibles, disques externes, onduleur compatible)

Informations supplémentaires sur le site de [Synology](http://www.synology.com/enu/products/DS411j/index.php)


Au dos de mon NAS sont connectés sur les ports USB mon imprimante et mon onduleur, tous deux parfaitement reconnus.


II.2. Les disques durs
----------------------

![](/images/barracuda-green.png)

Caractéristiques du Seagate Barracuda 2To :

* 2 To
* 5900 rpm
* 64 Mo de cache
* 4 plateaux de 500 Go

II.2. L'onduleur
----------------

![](/images/onduleur.png)

L’achat d’un onduleur était essentiel selon moi afin de préserver le NAS de toutes coupures ou perturbations électriques.

Caractéristiques principales :

* APC Back-UPS ES 550
* 8x alimentation tripolaire ( 4x anti-coupures et 4x anti-coupures et anti-surtensions )
* 3 ports RJ-45 pour la gestion de ligne téléphonique et de lignes de données.
* Puissance fournie : 330 Watt / 550 VA

Sont reliés à mon onduleur sur les prises anti-coupures et anti-surtensions :

* Freebox V5
* Switch Netgear GS 605
* Imprimante laser Samsung CPL-310
* DS411J sur un prise et sur une prise RJ-45

II.4. Justification des choix techniques pour usage
---------------------------------------------------

* Faible encombrement
* Faible consommation, architecture ARM
* Forte tolérance de panne RAID 5, ici il y a 4 baies parfait pour du RAID 5
* Possibilité de lire des blue-ray rip depuis le NAS à travers le réseau, celui-ci dispose d’un port Gigabit et d’un processeur cadencé @1,2Ghz
* La possibilité d’installer des paquets et des logiciels diverses, la machine tourne sous Linux et même si tous les paquets ne sont pas compilés pour les architectures ARM les possibilités sont nombreuses. De plus Synology dispose d’une couche très bien développée et propose de nombreuses applications tierces. De plus, la communauté Synology est très importante.

Finalement tous mes souhaits sont satisfaits avec ce NAS, je peux aisément lire des blue-ray rip à travers le réseau (Wi-Fi ou filaire 1Gb/sec). Je gère également les autorisations d’accès aux répertoires pour les utilisateurs de mon réseau local (ACL).
Bref un matériel que je recommande à tous ceux qui ne veulent plus être bloqué à l’usage d’un gros boitier et qui voudront privilégier l’utilisation d’un ordinateur portable avec un accès aux données aisé et le tout pour un prix très abordable surtout quand on parle de NAS.
