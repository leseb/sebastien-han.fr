---
title: "Tips: 5 astuces Bash – 5"
date: 2011-12-15 01:09:00
slug: tips-5-astuces-bash-5
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/ILoveBash1.png)

Pour les amoureux du Bash on continue  Celui-ci est orienté réseau.

<!--more-->

###Tip 1. Un serveur web rapide pour délivrer le contenu du répertoire courant avec Python

```
$ /usr/bin/python -m SimpleHTTPServer
Serving HTTP on 0.0.0.0 port 8000 ...
```

###Tip 2. Voir les connexions en cours sur un port défini. 

On utilise la commande lsof qui liste les fichiers ouverts par les processus.

```
$ lsof -i :80
COMMAND    PID  USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Dropbox    833 Leseb   30u  IPv4 0xffffff8017359160      0t0  TCP 192.168.0.12:53845-sjc-not15.sjc.dropbox.com:http (ESTABLISHED)
```

###Tip 3. Requêter rapidement un DNS.

```
$ dig +short sebastien-han.fr
213.186.33.19
```

###Tip 4. Un traceroute et un ping dans une même commande

```
$ mtr google.com
 
My traceroute  [v0.75]
45873hpv102119 (0.0.0.0)        Mon Feb 27 22:21:37 2012
Keys:  Help   Display mode   Restart statistics   Order of fields   quit
                                                                                                            Packets               Pings
 Host                                                         Loss%   Snt   Last   Avg  Best  Wrst StDev
 1. hpv178170123001.ikoula.com             0.0%    13    0.7   0.9   0.5   3.1   0.7
 2. po1.core7.ikdc1.ikoula.com                  0.0%    13    0.5  11.1   0.5 125.9  34.5
 3. te1-2.core9.rb.ikoula.com                    0.0%    13    4.1  17.4   3.8 120.9  34.1
 4. google.franceix.net                               0.0%    13    6.4   4.9   4.2   6.7   0.9
 5. 72.14.238.234                                      0.0%    13    4.4  16.1   4.3 106.9  29.5
 6. 64.233.175.115                                    0.0%    12    5.0   6.0   4.7  11.3   1.9
 7. par03s01-in-f5.1e100.net                    0.0%    12    4.5   4.7   4.4   6.1   0.5
```

###Tip 5. Un bon netstat avec un bon moyen mnémotechnique. 

Attention celui-ci renvoi également les processus et leur numéros vous devez donc être root à l’exécution

```
$ sudo netstat -plantu
```

