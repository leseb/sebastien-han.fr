---
title: Introduction à la virtualisation
date: 2011-04-12 23:50:00
slug: introduction-a-la-virtualisation
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/vmware.png)

Pour l’optimisation des coûts la virtualisation est devenue une réelle nécessité pour les entreprises. Introduction à un concept vieux de plus de 30 ans mais qui correspond à l’avenir des architectures informatiques.

<!--more-->

I. Introduction
===============

I.1. Historique et définition
-----------------------------

La virtualisation permet de faire fonctionner simultanément et de façon étanche (ou non) plusieurs systèmes d’exploitation sur une même machine physique. Dans l’esprit, il y aura plusieurs machines virtuelles sur une machine physique se partageant les ressources de celle-ci. L’évolution exponentielle des composants informatique et de leur puissance de calculs donnèrent de nouvelles optiques à l’informatique. La loi liée à l’évolution des composants informatique est la loi de Moore :

> La loi de Moore veut que tous les 18 mois, une des 3 variables suivantes : la « puissance » , la « vitesse » ou « l’espace » soit doublée.

Les notions physiques et logiques sont également à leurs apogées du fait des limitations matérielles.

### Analogie avec les processeurs

> Prenons l’exemple d’un processeur, une fois que la cadence de celui-ci a atteint sa limite physique de fabrication et d’utilisation, comprenez là environs 3,6 Ghz, les fondeurs (Intel & AMD) ont élaboré un nouveau système : le multi-cœurs. À l’origine un processeur ne contient qu’un seul cœur cadencé à une certaine vitesse, mais du fait de l’amélioration des finesses de gravure il est possible de disposer de plusieurs cœurs physiques sur un même processeur. Ici il est question non pas d’augmenter le nombre de processeurs dans une machine mais d’augmenter le nombre de cœurs dans un processeur, cette notion de mise en abîme va encore plus loin avec le concept de l’hyper-threading qui pour un cœur d’un processeur crée 2 cœurs logiques. Exemple : un processeur Intel Core i7 a pour caractéristique 1 processeur, 4 cœurs physiques hyper-threadés, soit 2×4=8 coeurs logiques.

Dans la logique, la virtualisation fonctionne sur le même principe, au lieu de multiplier les machines physiques avec un seul système d’exploitation, on utilise une machine physique pour virtualiser plusieurs systèmes d’exploitations. La virtualisation a notamment été créée pour répondre à la problématique de la sous-utilisation des ressources matérielles.

La virtualisation représente donc l’addition des meilleurs pratiques informatique à savoir :

* Architecture multi-processeurs (plusieurs processeurs dans une machine)
* Architecture multi-cœurs (plusieurs cœurs dans un processeur)
* Architecture hyper-threadé (2 cœurs logiques par cœur physique du processeur)

![](/images/archi-sans-avec.png)

I.2. Pourquoi virtualiser ?
---------------------------

> Un serveur consomme autant d'électricité à 20% de charge qu'à 80% !

Prenons un cas fictif d’une PME d’une cinquantaine d’employés n’ayant pas mis en oeuvre de virtualisation sur leur infrastructure. Voici une liste des serveurs avec leur indice de solicitation :

* Un cluster Active Directory avec service Terminal Server (2 serveurs), 70%
* Un serveur de messagerie, 12%
* Un serveur d’application, 25%
* Un serveur de comptabilité, 5%

On peut remarquer et ce à juste titre que les seuls serveurs dont la puissance est convenablement exploitée sont ceux du cluster. On observe facilement le gaspillage des ressources. Cette entreprise aurait donc à gagner à employer de la virtualisation sur son architecture serveur. Elle pourrait très bien conserver son cluster tel quel mais regrouper les 3 serveurs restants au sein d’un seul et même serveur et virtualiser les 3 OS.

Résumé :

* Rentabiliser son infrastructure et ses ressources du fait d’une utilisation plus intelligente
* Exécuter plusieurs types de systèmes d’exploitation (Linux, Mac OS, Windows)
* Réduire son coup de possession du matériel (électricité, leasing serveur, climatisation)
* Administration logique/physique centralisée
* Rapidité de déploiement (clonage)
* Souplesse d’évolution du matériel
* Allocation des ressources  et load-balancing
* Cloisonnement

**Cela tombe sous le sens, mais n’employez pas la virtualisation si vos serveurs sont assez sollicités. Cela rajoute une couche supplémentaire inutile et  vous perdrez en performance !**

II. Types de virtualisation
===========================

II.1. Hyperviseur de type 1
----------------------------

L’hyperviseur de type 1 ou bare-metal est un outil qui s’interpose entre la couche matérielle et logicielle. Celui-ci a accès aux composants de la machine et possède son propre noyau. C’est donc par dessus ce noyau que les OS seront installés. Il pilote donc les OS à partir de la couche matérielle, il s’administre via une interface de gestion des machines virtuelles. Il est beaucoup plus puissant que les hyperviseurs de type 2 notamment grâce à sa proximité au matériel à la différence d’un prix prohibitif.

Les couches sont organisées comme suit :

* Couche matérielle
* Couche de virtualisation (hyperviseur)
* Virtualisation d’OS

Parmi ces hyperviseurs on trouve :

* VmWare vSphere
* Microsoft Hyper-V
* XEN
* KVM (open source)

![](/images/wmware_hypervisor.png)

*Source de l’illustration : VmWare.*

I.2. Hyperviseur de type 2
--------------------------

L’hyperviseur de type 2 ou architecture hébergée est une application installée sur un système d’exploitation, elle est donc dépendante de celui-ci. Les performances sont réduites en comparaison des hyperviseurs de type car l’accès au matériel (CPU, RAM…) se fait via une couche intermédiaire. Néanmoins il propose une parfaite étanchéité entre les systèmes d’exploitations installés.

Les couches sont organisées comme suit :

* Couche matérielle
* Système d’exploitation hôte
* Couche de virtualisation
* Virtualisation d’OS

Parmi ces hyperviseurs on trouve :

* VmWare Workstation, Fusion, Player
* Oracle VirtualBox
* Microsoft Virtual PC
* QEMU (open source)

![](/images/wmware_hosted.png)

*Source de l’illustration : VmWare.*

III. Les principaux fournisseurs et leur solutions
==================================================

III.1. VmWare
-------------

* VmWare vSphere : L’hyperviseur de référence pour les datacenters et les grands infrastructures d’entreprise ; orienté professionnels
* VmWare Workstation : création, administration de machines virtuelles ; orienté grand public
* VmWare Player : gratuit, il permet l’exécution de machines virtuelles à partir de fichierx .vmx mais pas leur création ; orienté grand public

III.2. Microsoft
----------------

* Hyper-V et Hyper-V2, rôle implémenté dans Windows Server 2008 R2 ; orienté professionnels
* Virtual PC, intégré dans Windows Seven pour la cohabitation d’applications fonctionnant sous XP ; orienté grand public

III.3. Xen
----------

* XEN : hyperviseur de type open source, orienté professionnels

