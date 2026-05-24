---
title: "Culture G: Scalability"
date: 2011-07-20 00:15:00
slug: culture-g-scalability
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/scalability.png)

Introduction d’une nouvelle section sur le site: Culture G. Ici j’expose et définie brièvement certaines notions/termes technique. On débute donc avec « scalability », le terme revient très souvent lorsque l’on parle de cloud et de datacenter.

<!--more-->

I. Introduction
===============

C’est un terme que l’on retrouve souvent dans les publications sur les problématiques de SI, d’applications, du cloud computing et des datacenters. Ce mot est vraiment ancré dans le langage courant des experts IT. L’objectif ici est de mieux comprendre ce qu’est la scalabilité. Tout d’abord le terme en français pourrait être traduit par extensibilité. Si je devais donner une définition, c’est la capacité d’une application ou d’une architecture à évoluer et à conserver ses performances par l’ajout de composant ou l’augmentation du nombre de machines. Mais la scalabilité c’est aussi et surtout:

* Le fait d’effectuer l’opération à chaud afin de conserver le service
* La capacité à mieux fonctionner lors d’un rescaling, la plateforme est plus agile après le scaling
* Scalablité ne veut pas dire  inclure des coûts supplémentaires à mon architecture après avoir scalé bien au contraire, on ajoute c’est tout !
* Un trafic grandissant
* Des données grandissante

Ce que ce n’est pas :

* Des protocoles
* Des technologies
* Des performances en écritures/lectures
* La haute disponibilité
* L’élasticité des ressources, l’élasticité c’est allouer des ressources on demand à une application ou une plateforme.

Maintenant voyons les types de scalabilité.

I.1. Scalability horizontale
----------------------------

La scalabilité horizontale ou scale out correspond à l’augmentation du nombre de machine physique.

* Le coût n’est pas nécessairement élevé car l’ajout d’une même machine dans le temps est soumis à une baisse de prix
* Réduit les SPOF
* Rapide à déployer
* Augmente les difficultés d’administration
* Agrandie le parc de machines

I.2. Scalability verticale
--------------------------

La scalabilité verticale ou scale up correspond à l’augmentation des ressources sur une machine physique comme par exemple :

* Le nombre de processeurs
* La quantité de RAM
* Le nombre de disques durs

Comparativement avec un scalabilité horizontale on peut penser que :

* Le coût est moins élevé ou plus élevé cela dépend de
    * Je remplace la machine par une autre machine plus puissance (plus chers)
    * J’ajoute de la ressource à celle existante, là le prix des composants aura chuté avec le temps
    * Je remplace certains composants, coût moyen mais gaspillage
* Génère des SPOF
* S’allie parfaitement avec les techniques de virtualisation

Généralement on ne fait pas soit l’un soit l’autre, l’idéal comme somment est une juste addition des deux méthodes.

II. Scaler ?
============

II.1. Quand ?
-------------

Il est important de savoir quand scaler, surtout quand nous sommes dans des problématiques de gestion de côuts/ressource notamment avec un recourt à la virtualisation où les ressources sont allouées au plus proche du besoin. Voici une liste des différents cas où il serait intéressant de scaler son architecture :

* L’accès à la ressource est trop long
* L’exécution d’un script/programme est trop long
* Les connexions sont trop importantes
* La charge des serveurs devient trop importante (du moins avant que ne l’on s’en rende compte)

Avant d’arriver à ce genre de situation (elles peuvent arriver plus rapidement que prévu), il est important de soumettre nos applications et notre architecture à des tests de charge notamment dans des contextes d’intégration logiciel continu. Pour cela il existe des softs de validation de tests unitaires ou des add-on notamment dans Visual Studio pour les applications.

II.2. Quoi ?
------------

Il faut également savoir quoi scaler à partir du moment où l’on sait qu’il faut le faire.

* Identifier précisément ce qu’il faut étendre
    * I/O
    * RAM
    * CPU (SMP, thread…)
    * etc…

II.3. Comment ?
---------------

Une fois que la décision a été prise il va falloir réfléchir aux problématiques et aux contraintes que vont poser la scalabilité.

* Bien avoir étudié son besoin
* Mon réseau le permet-il (temps de réponse, vitesse…) ?
* Voir les coûts constructeurs
* Repérer les bottlenecks
* Tuner votre code
