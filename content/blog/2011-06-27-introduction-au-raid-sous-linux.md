---
title: Introduction au RAID sous Linux
date: 2011-06-27 18:27:00
slug: introduction-au-raid-sous-linux
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/disque.png)

Le RAID, Redundant Arrays of Inexpensive Disks est une technologie permettant l’usage de plusieurs disques simultanément. Il peut optimiser les performances, gérer la tolérance de panne ou les deux à la fois. Ce tutoriel introduit une chaine de tutoriaux sur la HA (Hight Availability), Haute disponibilité. Nous débutons par la mise en place de RAID, pour ensuite voir les clusters et enfin le RAID over IP avec DRBD.

<!--more-->

<br />

I. Retour rapide sur les types de RAID
======================================
Rapide pourquoi ? Parce que le texte ci-dessous est un copier/coller de l’article sur le NAS et que Wikipedia dispose d’un très bon article sur les technologies RAID.

* JSOB : pour ‘n’ disques physiques le système ne voit qu’un disque logique. Les disques physiques sont regroupés en une grappe, les données sont écrites au fur et à mesure que les disques se remplissent. Une fois que le premier disque est plein le système débute l’écriture sur le deuxième disque et ainsi de suite… Aucune tolérance de panne.
* RAID 0 : nécessite au minimum 2 disques, pour ‘n’ disques physiques le système ne voit qu’un disque logique. La capacité est égale à la combinaison des disques. Il allie la puissance des disques installés, les temps d’accès et les taux de lectures/écritures sont plus élevés que sur un seul disque. Orienté performance. Aucune tolérance à la panne, les données sont écrites aléatoirement sur les 2 disques, si un disque crash il sera difficile de récupérer les données, voir impossible.
* RAID 1 : souvent appelé mirroring, nécessite au minimum 2 disques, pour ‘n’ disques physiques le système ne voit qu’un disque logique. La capacité est égale à ‘n’ disque – 1. Les données sont écrites simultanément sur les 2 disques. Oui on perd un disque au niveau de la capacité de stockage mais la tolérance à la panne est intéressante. Si le volume perd un disque, le second possède l’intégralité des données. Une étape de reconstruction des données est possible après réinsertion d’un nouveau disque à la grappe.
* RAID 5 : nécessite 3 disques minimum, pour ‘n’ disques physiques le système ne voit qu’un volume de données correspondant à ‘n’ – 1 disque en capacité de stockage. Sur chaque disque sont écrits des bits de parité, réservant automatiquement 1/3 du disque. Forte tolérance de panne. Si panne d’un disque (et pas plus) la réinsertion d’un nouveau disque reconstruira le volume et les données sur celui-ci. Le temps de reconstruction varie selon le volume de données à reconstruire même si celui-ci est généralement de plusieurs heures.
* RAID 5 + spare :  nécessite au moins 4 disques dont un sera assigné à la  reconstruction automatique  du volume en cas de crash.
* RAID 6 : nécessite au minimum 4 disques, même principe que le RAID 5 (gestion du bit de parité) hormis qu’il peut gérer la panne simultanée de 2 disques durs.
* RAID 10 : nécessite au minimum 4 disques, combinaison des RAID 0 et 1, ici on allie performance et tolérance de panne.
Différence RAID 0+1 et RAID 1+0 :

Un exemple avec 6 disques, avec un RAID 1+0 la grappe est formée comme suit :

    Hdd 1 – hdd 2  = raid 1, volume A
    Hdd 3 – hdd 4  = raid 1, volume B
    Hdd 5 – hdd 6  = raid 1, volume C

Un RAID 0 de A,B,C est formé. On remarque que si le disque 3 crash l’intégrité de la grappe n’est pas affectée. Seul le volume B est atteint, les données seront conservées sur le disque 4.

* Un exemple avec 6 disques, avec un RAID 0+1 la grappe est formée comme suit :

    Hdd 1, hdd 2, hdd 3 = raid 0, volume A
    Hdd 4, hdd 5, hdd 6 = raid 0, volume B

Un RAID 1 des volumes A & B est formé. On Remarque que si le disque 3 crash c’est les  données de la grappe entières qui seront perdues (disques 1 et 2) car par définition un RAID 0 fusionne tous les disques afin d’en optimiser l’espace et les performances.

Au final le raid 1+0 offre une meilleure tolérance à la panne et conserve les mêmes performances.

<br />

II. Réalisation sous Linux
==========================

II.1. Le matériel
-----------------

Personnellement j’ai utilisé VmWare pour réaliser ces démos, détails de ma machine virtuelle :

* OS : Debian 6 Squeeze
* RAM : 192 Mo
* 1 core
* 5 disques :
    * 1 disque système 5 Go
    * 4 disques x 1 Go, pour mes tests de RAID

Le fait que j’ai réalisé cela sous machine virtuel ne change en rien le bon fonctionnement sur une machine physique, la procédure est identique.

II.2. Pré-requis
----------------

Avant de débuter et d’installer le paquet nécessaire au RAID logiciel, il est important de vérifier si le module raid que l’on veut gérer est activé sur le noyau :

```
root@cluster-node-1:~$ lsmod | grep raid
raid10                 16697  0
raid456                42848  0
async_raid6_recov       4062  1 raid456
async_pq                2575  2 raid456,async_raid6_recov
raid6_pq               77468  2 async_raid6_recov,async_pq
async_xor               1886  3 raid456,async_raid6_recov,async_pq
async_memcpy             838  2 raid456,async_raid6_recov
async_tx                1290  5 raid456,async_raid6_recov,async_pq,async_xor,async_memcpy
raid1                  16339  0
raid0                   5569  0
md_mod                 67309  7 raid10,raid456,raid1,raid0,multipath,linear
```

Ici nous aurons besoin de RAID 0, 1, 5, 10, pour les activer :

```
root@cluster-node-1:~$ modprobe raid1
```

Ainsi de suite pour les modules non chargés.

Installer le paquet mdadm qui va gérer notre RAID logiciel :

```
root@cluster-node-1:~$ aptitude install mdadm -y
```

Repérer les disques (chez moi) :

```
root@cluster-node-1:~# fdisk -l
 
Disk /dev/sda: 5368 MB, 5368709120 bytes
255 heads, 63 sectors/track, 652 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x0009b8cd

Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *           1          43      340992   83  Linux
Partition 1 does not end on cylinder boundary.
/dev/sda2              43         653     4898817    5  Extended
Partition 2 does not end on cylinder boundary.
/dev/sda5              43         268     1807360   83  Linux
/dev/sda6             268         382      910336   83  Linux
/dev/sda7             382         419      297984   82  Linux swap / Solaris
/dev/sda8             419         437      141312   83  Linux
/dev/sda9             437         653     1737728   83  Linux

Disk /dev/sdb: 1073 MB, 1073741824 bytes
255 heads, 63 sectors/track, 130 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x00000000

Disk /dev/sdb doesn't contain a valid partition table

Disk /dev/sdc: 1073 MB, 1073741824 bytes
255 heads, 63 sectors/track, 130 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x00000000
 
Disk /dev/sdc doesn't contain a valid partition table

Disk /dev/sdd: 1073 MB, 1073741824 bytes
255 heads, 63 sectors/track, 130 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x00000000

Disk /dev/sdd doesn't contain a valid partition table
    
Disk /dev/sde: 1073 MB, 1073741824 bytes
255 heads, 63 sectors/track, 130 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x00000000

Disk /dev/sde doesn't contain a valid partition table

```

Formatage des disques, je montre l’exemple pour un disque la procédure sera identique pour le reste :

```
root@cluster-node-1:~# fdisk /dev/sdc
Device contains neither a valid DOS partition table, nor Sun, SGI or OSF disklabel
Building a new DOS disklabel with disk identifier 0x4e9fc94e.
Changes will remain in memory only, until you decide to write them.
After that, of course, the previous content won't be recoverable.
 
Warning: invalid flag 0x0000 of partition table 4 will be corrected by w(rite)
  
WARNING: DOS-compatible mode is deprecated. It's strongly recommended to
switch off the mode (command 'c') and change display units to
sectors (command 'u').
	     
Command (m for help): n
Command action
    e   extended
    p   primary partition (1-4)
p
Partition number (1-4): 1
First cylinder (1-130, default 1):
Using default value 1
Last cylinder, +cylinders or +size{K,M,G} (1-130, default 130):
Using default value 130

Command (m for help): t
Selected partition 1
Hex code (type L to list codes): fd
Changed system type of partition 1 to fd (Linux raid autodetect)
     
Command (m for help): w
The partition table has been altered!

Calling ioctl() to re-read partition table.
Syncing disks.

``` 


<br />

II.3. Construction des matrices RAID
------------------------------------

###II.3.1 Pour du RAID 0

```
root@cluster-node-1:~# mdadm --create --verbose /dev/md0 --level=raid0 --raid-devices=2 /dev/sdb1 /dev/sdc1
```

Vérifier le statut du RAID :
```
root@cluster-node-1:~#root@cluster-node-1:~# mdadm --detail /dev/md0
/dev/md0:
Version : 1.2
Creation Time : Mon Jun 27 22:29:47 2011
Raid Level : raid0
Array Size : 2085888 (2037.34 MiB 2135.95 MB)
Raid Devices : 2
Total Devices : 2
Persistence : Superblock is persistent

Update Time : Mon Jun 27 22:29:47 2011
State : clean
Active Devices : 2
Working Devices : 2
Failed Devices : 0
Spare Devices : 0
 
Chunk Size : 512K

Name : cluster-node-1:0  (local to host cluster-node-1)
UUID : 6d1bd89e:3d87472c:19950752:cb08c71a
Events : 0
       
Number   Major   Minor   RaidDevice State
0       8       17        0      active sync   /dev/sdb1
1       8       33        1      active sync   /dev/sdc1
```

<br />

###II.3.3. Pour du RAID 5

```
root@cluster-node-1:~# mdadm --create --verbose /dev/md0 --level=raid5 --raid-devices=3 /dev/sdb1 /dev/sdc1 /dev/sdd1
```

Vérifier le statut du RAID :

```
root@cluster-node-1:~# mdadm --detail /dev/md0
/dev/md0:
Version : 1.2
Creation Time : Mon Jun 27 22:26:46 2011
Raid Level : raid5
Array Size : 2087936 (2039.34 MiB 2138.05 MB)
Used Dev Size : 1043968 (1019.67 MiB 1069.02 MB)
Raid Devices : 3
Total Devices : 3
Persistence : Superblock is persistent

Update Time : Mon Jun 27 22:26:46 2011
State : clean, degraded
Active Devices : 2
Working Devices : 3
Failed Devices : 0
Spare Devices : 1

Layout : left-symmetric
Chunk Size : 512K

Name : cluster-node-1:0  (local to host cluster-node-1)
UUID : 616c8041:3d80f17a:2b2e2498:051d3b25
Events : 0

Number   Major   Minor   RaidDevice State
0       8       17        0      active sync   /dev/sdb1
1       8       33        1      active sync   /dev/sdc1
2       0        0        2      removed

3       8       49        -      spare   /dev/sdd1
```

<br />

###II.3.4. Pour du RAID 10

```
root@cluster-node-1:~# mdadm --create --verbose /dev/md0 --level=raid10 --raid-devices=4 /dev/sdb1 /dev/sdc1 /dev/sdd1 /dev/sde1
``` 

Vérifier le statut du RAID :

```
root@cluster-node-1:~# root@cluster-node-1:~# mdadm --detail /dev/md0
/dev/md0:
Version : 1.2
Creation Time : Mon Jun 27 22:21:26 2011
Raid Level : raid10
Array Size : 2087936 (2039.34 MiB 2138.05 MB)
Used Dev Size : 1043968 (1019.67 MiB 1069.02 MB)
Raid Devices : 4
Total Devices : 4
Persistence : Superblock is persistent

Update Time : Mon Jun 27 22:22:59 2011
State : active
Active Devices : 4
Working Devices : 4
Failed Devices : 0
Spare Devices : 0

Layout : near=2
Chunk Size : 512K

Name : cluster-node-1:0  (local to host cluster-node-1)
UUID : 8290adcb:6028714a:027e9473:b603e67a
Events : 35

Number   Major   Minor   RaidDevice State
0       8       17        0      active sync   /dev/sdb1
1       8       33        1      active sync   /dev/sdc1
2       8       49        2      active sync   /dev/sdd1
3       8       65        3      active sync   /dev/sde1

``` 

Ensuite on créé le file system :

```
root@cluster-node-1:~# mkfs.ext2 /dev/md0
```

On monte le device :

```
root@cluster-node-1:~# mount /dev/md0 /mnt/raidX
```

On finalise ça dans le fstab, afin de conserver un montage persistant à chaque démarrage:

```
root@cluster-node-1:~# nano /etc/fstab
```

Ajouter la ligne suivante (conformément à votre système de fichier et répertoire de montage) :

```
/dev/md0        /mnt/raidX           ext2    defaults                0       2
```

<br />

III. On va tout casser ?!
=========================

III.1. Casse d’ un RAID 1.
--------------------------

Si comme moi vous voulez tester ça en virtuel, voici ce que j’ai fait :

* Éteindre la VM
* Déplacer un des deux .vmdk correspondant aux disques du RAID
* Supprimer le disque dans les paramètres de la VM
* Lancer la machine

Maintenant on observe le statut du RAID :

```
root@cluster-node-1:~# mdadm --detail /dev/md0
/dev/md0:
Version : 1.2
Creation Time : Mon Jun 27 17:37:20 2011
Raid Level : raid1
Array Size : 1044181 (1019.88 MiB 1069.24 MB)
Used Dev Size : 1044181 (1019.88 MiB 1069.24 MB)
Raid Devices : 2
Total Devices : 1
Persistence : Superblock is persistent

Update Time : Mon Jun 27 18:03:27 2011
State : clean, degraded
Active Devices : 1
Working Devices : 1
Failed Devices : 0
Spare Devices : 0

Name : cluster-node-1:0  (local to host cluster-node-1)
UUID : 3e23123a:d1a59084:33e2398a:bb3ad346
Events : 54

Number   Major   Minor   RaidDevice State
0       8       17        0      active sync   /dev/sdb1
1       0        0        1      removed

```

Aller faire un tour du côté du répertoire de montage, les données existes encore (merci raid1).
On remarque aussi qu’un device nommé `md127` a été ajouté (du moins se fût le cas pour moi), solution le supprimer :

```
root@cluster-node-1:~# mdadm -S /dev/md127
mdadm: stopped /dev/md127
```

Avec un `fdisk -l` on peut voir que celui-ci a disparu, maintenant éteindre la VM et rajouter l’ancien disque et relancer la VM. On lance la commande suivante pour rajouter le disque manquant et reconstruire le RAID 1 :

```
root@cluster-node-1:~# mdadm --manage /dev/md0 --add /dev/sdc1
mdadm: re-added /dev/sdc1
```

Malheureusement (mais logique) après avoir rajouter le disque il faut recréer un file system ce qui veut dire suppression des données. Oui c’est dommage et c’est la la grande limitation du RAID 1.

<br />

III.2. Tips en vrac
-------------------

Voici quelque commande utiles afin de manager au mieux vos volumes RAID. Pour plus d’infos n’oublier pas de faire un `man mdadm`, qui comme toujours est très complet.
Connexion et déconnexion du RAID à chaud :

```
root@cluster-node-1:~# mdadm --manage /dev/md0 --stop
mdadm: stopped /dev/md0
root@cluster-node-1:~# mdadm --assemble --scan
mdadm: /dev/md/0 has been started with 2 drives.
mdadm: /dev/md/0_0 has been started with 2 drives.
```

Bien sûr si les volumes ne sont pas endommagés vous ne perdez pas vos données.

Enregistrer votre configuration courante :

```
root@cluster-node-1:~# mdadm --examine --scan >> /etc/mdadm/mdadm.conf
```

C’est tout ? Oui désolé ce n’était pas plus difficile que ça  . Je ne suis pas tellement rentré dans des cas complexes mais vous avez les cartes pour vous débrouiller maintenant !

<br />

> Bon RAID ;)
