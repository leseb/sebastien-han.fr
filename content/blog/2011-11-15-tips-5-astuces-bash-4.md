---
title: "Tips: 5 astuces Bash – 4"
date: 2011-11-15 00:53:00
slug: tips-5-astuces-bash-4
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/ILoveBash1.png)

Pour les amoureux du bash on continue :)

<!--more-->

###Tip 1. Retourner dans le répertoire précédent

```
$ cd -
```

###Tip 2. Aller dans son home directory

```
$ cd
```

###Tip 3. Améliorer le rendu du shell lors de l’exécution du commande

Sans

```
$ mount
/dev/disk0s2 on / (hfs, local, journaled)
devfs on /dev (devfs, local, nobrowse)
/dev/disk1s2 on /Volumes/Macintosh HD Data (hfs, local, journaled)
/dev/disk1s3 on /Volumes/BOOTCAMP (fusefs, local, synchronous)
map -hosts on /net (autofs, nosuid, automounted, nobrowse)
map auto_home on /home (autofs, automounted, nobrowse)
localhost:/Gwqhu3ZQl26So6wVBVB1f1 on /Volumes/MobileBackups (mtmfs, nosuid, read-only, nobrowse)
afp_2l22D92d31Ch2s8kZZ0daCDj-4.2e000006 on /Volumes/Time Capsule (afpfs, nobrowse)
/dev/disk4s2 on /Volumes/Copies de sauvegarde Time machine (hfs, local, nodev, nosuid, journaled)
```

Avec

```
$ mount | column -t
/dev/disk0s2                             on         /                       (hfs,     local,      journaled)
devfs                                    on         /dev                    (devfs,   local,      nobrowse)
/dev/disk1s2                             on         /Volumes/Macintosh      HD        Data        (hfs,         local,        journaled)
/dev/disk1s3                             on         /Volumes/BOOTCAMP       (fusefs,  local,      synchronous)
map                                      -hosts     on                      /net      (autofs,    nosuid,       automounted,  nobrowse)
map                                      auto_home  on                      /home     (autofs,    automounted,  nobrowse)
localhost:/Gwqhu3ZQl26So6wVBVB1f1        on         /Volumes/MobileBackups  (mtmfs,   nosuid,     read-only,    nobrowse)
afp_2l22D92d31Ch2s8kZZ0daCDj-4.2e000006  on         /Volumes/Time           Capsule   (afpfs,     nobrowse)
/dev/disk4s2                             on         /Volumes/Copies         de        sauvegarde  Time          machine       (hfs,       local,  nodev,  nosuid,  journaled)
```

###Tip 4. Exécuter une commande sans l’enregistrer dans l’historique

```
$ <espace>command
```

###Tip 5. Exécuter un seul ping

```
$ ping -c 1 google.com
PING google.com (74.125.230.70) 56(84) bytes of data.
64 bytes from par03s01-in-f6.1e100.net (74.125.230.70): icmp_seq=1 ttl=58 time=4.71 ms
 
 --- google.com ping statistics ---
 1 packets transmitted, 1 received, 0% packet loss, time 0ms
 rtt min/avg/max/mdev = 4.716/4.716/4.716/0.000 ms

```
