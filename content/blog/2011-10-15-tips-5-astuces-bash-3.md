---
title: "Tips: 5 astuces Bash – 3"
date: 2011-10-15 00:25:00
slug: tips-5-astuces-bash-3
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/ILoveBash1.png) 

Pour les amoureux du Bash on continue  Celui-ci est orienté contrôle du terminal.

<!--more-->

###Tip 1. Écrire une ligne de commande dans un fichier. 

Si vous avez un gros one-ligner sous le shell. Ce raccourci copiera la ligne en cours dans un fichier.

```
ctrl+x e
```

###Tip 2. Mettre en pause, créer un ‘job’. 

Parfois Nous sommes en train d’éditer un fichier mais nous avons d’avoir un visu sur le shell. Le raccourci ici met le processus en pause. Pour l

```
$ vim foo
"foo" [Nouveau fichier]
ctrl + z
[1]+  Stopped                 vim foo
$ vim bar
ctrl + z
[2]+  Stopped                 vim bar
$ jobs
[1]+  Stopped                 vim foo
[2]+  Stopped                 vim bar
```

On voit bien que ceux-ci sont numérotés, pour revenir dans le fichier voulu il suffit d’utiliser la commande foreground plus le numéro:

```
$ fg 2
```

###Tip 3. Provoquer l’interruption d’un programme

```
$ ping google.com
PING google.com (74.125.230.72) 56(84) bytes of data.
64 bytes from par03s01-in-f8.1e100.net (74.125.230.72): icmp_seq=1 ttl=58 time=4.33 ms
ctrl + c
^C
--- google.com ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 4.339/4.339/4.339/0.000 ms
```

###Tip 4. Ramener le prompt au début de la ligne du shell

```
ctrl + a
```

###Tip 5. Amener le prompt en fin de ligne du shell

```
ctrl + e
```
