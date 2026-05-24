---
title: "Tips: 5 astuces Bash – 1"
date: 2011-08-15 21:39:00
slug: tips-5-astuces-bash-1
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/ILoveBash1.png)

M’étant imposé un rythme de deux semaines entre chaque tips, j’inaugure une petite section sur le langage Bash. Dans cette rubrique on retrouve généralement les commandes les plus utiles ainsi que les jolies découvertes.

<!--more-->

###Tip 1. Supprimer complètement un fichier

```
$ shred -z -u mon_fichier
```

###Tip 2. Effacer rapidement le contenu d’un fichier

```
$ > mon_fichier
```

###Tip 3. Répéter une commande avec des privilèges root

```
$ sudo !!
```

###Tip 4. Répéter la dernière commande

```
$ !!
echo "bar"
bar
```

###**Tip 5.** Répéter la commande commençant par…

```
$ !e
echo "foo"
foo
```
