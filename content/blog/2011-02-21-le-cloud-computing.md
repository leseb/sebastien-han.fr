---
title: Le Cloud Computing
date: 2011-02-21 19:39:00
slug: le-cloud-computing
draft: false
categories: ["cloud"]
tags: ["cloud"]
---

![](/images/cloud.png)

> Les grands acteurs du secteur informatique utilisent des datacenters pour promouvoir leurs services. Seulement ceux-ci ne les exploitent pas dans leur intégralité. Un datacenter ou centre de données est un bâtiment contenant des milliers de serveurs. Ces bâtiments sont soumis à des normes très rigoureuses en termes de sécurité et sont conçus par les architectures les plus brillants. Pour continuer à rentabiliser leurs infrastructures Google, Amazon, Microsoft et bien d’autres décidèrent de louer une partie de leurs ressources inutilisées. C’est là qu’est né le Cloud Computing !

<!--more-->

I. Introduction
===============

Le Cloud Computing ou informatique dans les nuages est un terme définissant la délocalisation des infrastructures, des applications métiers et des données du SI chez un opérateur de service. Celui-ci est régit par le modèle SPI:

* Software – SaaS – Software As A Service :
Application accessible sur Internet de façon sécurisée à l’aide d’un navigateur.Elle repose essentiellement sur les technologies RIA.

* Plateform – Paas – Plateform As A Service :
C’est une plateforme d’exécution hébergée dans le nuage. On l’utilise généralement pour exécuter des applications d’entreprise ou afin de disposer d’un environnement de développement. Ces plateformes n’étant pas standardisées, faites attention  à vérifier la compatibilité de vos applications avec les technologies employées par le PaaS (framework…).

* Infrastructure – IaaS – Infrastructure As A Service :
Le plus bas niveau de Cloud, considéré comme de l’outsourcing cette offre n’est ni plus ni moins qu’une location de serveurs (virtualisés ou non) dans le nuage. L’entreprise a donc un contrôle total sur le système d’exploitation et la machine. Il nécessite de fortes compétences techniques pour l’administration.

Nous reviendrons en détail sur les modèles du Cloud dans les futurs articles.

II. La gestion dans le modèle SPI
=================================
![](/images/SPI.png)

III. Modèles économique
=======================

La location de services peut prendre différentes formes selon les opérateurs de service et suivant le type de demande. Ainsi chacun pourra fournir des services d’applications en ligne ou de la location de ressources « brut ». Mais comment se caractérise une offre Cloud Computing ?

* Service d’applications en ligne : ici les entreprises louent une ou plusieurs application(s) hébergée(s) en ligne et accessible sur Internet, c’est un SaaS.
* Run à la consommation : ici les entreprises louent des ressources serveurs (CPU, RAM, stockage) ou une plateforme logicielle, c’est un IaaS ou un PaaS.

III.1. Sans le Cloud Computing
-----------------------------

![](/images/sans-cloud.png)

On observe que selon les différentes étapes de la croissance nous sommes soit en surplus soit en manque de ressources.

III.2. Avec le Cloud Computing
------------------------------

![](/images/avec-cloud.png)

On observe que grâce au Cloud Computing nous sommes toujours au plus proche de nos besoins en consommation. Ce qui permet un lissage des coûts, de fortes économies et une très bonne réponse à la demande.

IV. Cas d'utilisations
======================

IV.1. Puissance ponctuelles
---------------------------

![](/images/puissances-ponctuelle.png)

* Besoin inopiné et imprévisibles de ressource pour une période très courte
* Ex : test de charge d’une nouvelle application avant mise en production

IV.2. Croissance rapide
-----------------------

![](/images/croissance-rapide.png)

* Plus la demande augmente plus le Cloud fournit de ressources
* La réponse à la demande est effective, bonne qualité de service

IV.3. Pics imprévisibles
------------------------

![](/images/pics-imprevisibles.png)

* Pics difficiles à prévoir
* Lors de pics on fait une demande de ressources supplémentaires

IV.4. Pics prévisibles
----------------------

![](/images/pics-previsibles.png)

* Pics ponctuels comme par exemple la mise en ligne des résultats du baccalauréat
* Ici les montées en charge sont prévisibles, tout comme la facture sur l’année

V. Avantages et promesses
=========================

Voici une liste non exhaustive des avantages du Cloud Computing :

* Accès aux données au travers d’Internet  - Logique « Anywhere »: au bureau, à la maison, en déplacement.
* Opérateur de service, notion de contrat et de respect d’engagements, tous les avantages d’un prestataire (hotline etc…)
* HA (Hight Availability) pour Haute Disponibilité, au minimum 99,9% soit moins de 9h/an d’indisponibilité
* Plateforme scalable – Capacité d’évolution de l’infrastructure (côté datacenter)
* Elasticité des ressources « on demand » – Self Service (ex: pouvoir augmenter sa puissance de calcul et voir sa demande satisfaite dans l’heure voir moins)
* Modèle économique du « Pay as you go » – Tarification à la consommation
* Suppression des problématiques de versionning, l’opérateur fait évoluer son produit mais cela ne vous coûte pas plus cher
* Ressources illimités
* Données sécurisées
* Interface user-friendly
* Disparition du poste de travail, il sera remplacé par un client léger
* Réduction du TCO (coût de possession) pour les IaaS et PaaS et suppression de celui-ci pour les SaaS

VI. Freins à l'adoption
=======================

* Réduction des équipes techniques ?
Point très divergeant, certains pensent à juste titre que le rôle des équipes admin système va évoluer vers un recentrage sur l’activité métier et cela sans suppression d’emploi. C’est en partie vrai, hors je pense de mon côté que certains postes disparaîtront inévitablement ou du moins leur charge de travail diminuera fortement. Imaginons un nombre optimum de 3 admin-sys pour gérer un parc d’environs 120 postes. 3 afin d’assurer un roulement confortable entre les vacances/maladies. Si l’équipe décide de migrer sa gestion de messagerie vers une offre SaaS comme par exemple Google Apps, les tâches administratives seront réduites à 0, la seule administration sera la création/gestion des comptes dans le nuage. Ainsi l’entreprise aura-t-elle réellement besoin de 3 personnes ? Ou aura t-elle l’impression de surpayer 3 personnes afin de garantir une garantie de service ?

* Impact utilisateur sur un environnement en ligne
* Forte dépendance à Internet, selon moi c’est un faux argument car actuellement quelle entreprise n’est pas dépendante à Internet pour maintenir son activité ? Je donne cet argument car certains « anti-cloudiste » le propose, vous saurez quoi leurs répondre maintenant ! Attention ils pourront toujours vous dire que si l’on dispose de bases de données en local le personnel peut travailler. C’est un semblant de continuité d’activité mais surtout du chômage technique.
* Psychologique, c’est la principale barrière vers le Cloud.
* Dépossession des données, mes données sont toutes migrées dans le nuage.
* Qu’advient-il de mes données en cas de rupture de contrat ? Bien lire les termes de l’opérateur de services avant de s’engager.

Ma partie introductive sur le Cloud Computing s’achève ici, j’espère avoir été clair, auquel cas n’hésitez pas à commentez ou à me contacter.


