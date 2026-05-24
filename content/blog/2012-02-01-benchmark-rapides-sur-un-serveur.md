---
title: Benchmark rapides sur un serveur
date: 2012-02-01 01:30:00
slug: benchmark-rapides-sur-un-serveur
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

![](/images/performance.png)

Avant la mise en production il est indispensable de faire des benchmarks des différents services fonctionnants sur la machine. Voici ici quelques outils pour faire des tests de charge/performance rapides de votre infrastructure. Nous nous focaliserons sur les serveurs web. Les outils présentés ici ne sont en aucun cas suffisant pour de bon test pré-prod mais utiles pour un premier jet !

<!--more-->

I. Benchmark machine physique
=============================

Les tests présentés ci-dessous ont été effectués sur un Cloud server de chez Rackspace sous la distribution Debian Squeeze.

I.1. Performances en écriture
-----------------------------

Pour cela nous allons simplement utiliser 2 commandes natives sous Linux:

* `time`
* `dd`

```
root@server:~# time dd if=/dev/zero of=32gb bs=1024k count=16384
32768+0 records in
32768+0 records out
34359738368 bytes (34 GB) copied, 127.562 s, 269 MB/s
real        2m7.566s
user        0m0.020s
sys         1m25.710s
```

I.2. Performances en lecture
----------------------------

```
root@server:~# time dd if=16gb of=/dev/null bs=1024k count=16384
32768+0 records in
32768+0 records out
34359738368 bytes (34 GB) copied, 152.927 s, 425 MB/s
real        1m32.975s
user       0m0.020s
sys         0m31.880s
```

I.3. Performances en effacement
-------------------------------

```
root@server:~# time rm 16gb
real        0m1.667s
user       0m0.000s
sys         0m1.510s
```

I.4. Performances des I/O
-------------------------

Ici on utilise un script Python de [Benjamin Schweizer](http://benjamin-schweizer.de/files/iops/). Merci à lui.
On télécharge le script et on l’exécute:

```
root@server:~# wget http://benjamin-schweizer.de/files/iops/iops-2011-02-11
root@server:~# chmod +x iops-2011-02-11
root@server:~# python iostest.py /dev/sda1 10
/dev/sda1, 163.21 GB:
512   B blocks:  113.8 IOs/s,  56.9 KiB/s (466.0 kbit/s)
1 KiB blocks:  111.3 IOs/s, 111.3 KiB/s (911.7 kbit/s)
2 KiB blocks:   94.7 IOs/s, 189.4 KiB/s (  1.6 Mbit/s)
4 KiB blocks:   91.9 IOs/s, 367.5 KiB/s (  3.0 Mbit/s)
8 KiB blocks:   94.3 IOs/s, 754.5 KiB/s (  6.2 Mbit/s)
16 KiB blocks:   80.5 IOs/s,   1.3 MiB/s ( 10.6 Mbit/s)
32 KiB blocks:   62.3 IOs/s,   1.9 MiB/s ( 16.3 Mbit/s)
64 KiB blocks:   55.2 IOs/s,   3.4 MiB/s ( 28.9 Mbit/s)
128 KiB blocks:   36.0 IOs/s,   4.5 MiB/s ( 37.7 Mbit/s)
256 KiB blocks:   36.8 IOs/s,   9.2 MiB/s ( 77.1 Mbit/s)
512 KiB blocks:   28.9 IOs/s,  14.4 MiB/s (121.1 Mbit/s)
1 MiB blocks:   26.8 IOs/s,  26.8 MiB/s (225.2 Mbit/s)
2 MiB blocks:   23.4 IOs/s,  46.9 MiB/s (393.2 Mbit/s)
4 MiB blocks:   18.9 IOs/s,  75.5 MiB/s (633.7 Mbit/s)
8 MiB blocks:   13.3 IOs/s, 106.0 MiB/s (889.5 Mbit/s)
16 MiB blocks:    9.3 IOs/s, 148.9 MiB/s (  1.2 Gbit/s)
32 MiB blocks:    5.2 IOs/s, 165.7 MiB/s (  1.4 Gbit/s)
64 MiB blocks:    2.8 IOs/s, 181.2 MiB/s (  1.5 Gbit/s)
128 MiB blocks:    1.6 IOs/s, 199.6 MiB/s (  1.7 Gbit/s)
256 MiB blocks:    0.7 IOs/s, 188.9 MiB/s (  1.6 Gbit/s)
```

II. Benchmark serveur Web
=========================

II.1. Siège
-----------

###II.1.1. Installation

Rien de nouveau:

```
root@server:~# apt-get install siege
```

###II.1.2. Let’s bench!

```
root@server:~# siege -d1 -r300 -c100 http://50-57-47-119.static.cloud-ips.com./index.php
Transactions:		       29864 hits
Availability:		       99.55 %
Elapsed time:		      332.41 secs
Data transferred:	      243.96 MB
Response time:		        0.45 secs
Transaction rate:	       89.84 trans/sec
Throughput:		        0.73 MB/sec
Concurrency:		       40.01
Successful transactions:       29864
Failed transactions:	         136
Longest transaction:	       21.20
Shortest transaction:	        0.16
```

Détail des options utilisées:

* `-d` , interval entre chaque requêtes utilisateurs en seconde
* `-r` , nombre de requêtes envoyées
* `-c` , nombre d’utilisateurs simultanés

II.2. Apache Bench
------------------

###II.2.1. Installation

AB vient avec le package `apache-utils`, une dépendance d’Apache. Si Apache n’est pas installé:

```
root@server:~# apt-get install apache2-utils
```

###II.2.2. Let’s bench!

```
root@server:~# ab -n5000 -c50 http://50-57-47-119.static.cloud-ips.com.:80/
This is ApacheBench, Version 2.3 -$Revision: 655654 
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/
 
Benchmarking 50-57-47-119.static.cloud-ips.com. (be patient)
Completed 500 requests
Completed 1000 requests
Completed 1500 requests
Completed 2000 requests
Completed 2500 requests
Completed 3000 requests
Completed 3500 requests
Completed 4000 requests
Completed 4500 requests
Completed 5000 requests
Finished 5000 requests
 
Server Software:        Varnish
Server Hostname:        50-57-47-119.static.cloud-ips.com.
Server Port:            80
 
Document Path:          /
Document Length:        0 bytes
 
Concurrency Level:      50
Time taken for tests:   272.637 seconds
Complete requests:      5000
Failed requests:        0
Write errors:           0
Non-2xx responses:      5000
Total transferred:      3160000 bytes
HTML transferred:       0 bytes
Requests per second:    18.34 [#/sec] (mean)
Time per request:       2726.371 [ms] (mean)
Time per request:       54.527 [ms] (mean, across all concurrent requests)
Transfer rate:          11.32 [Kbytes/sec] received
 
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:       40   44   0.2     44      51
Processing:   263 2677 194.4   2673    3925
Waiting:      263 2677 194.4   2673    3925
Total:        307 2721 194.4   2717    3969
 
Percentage of the requests served within a certain time (ms)
  50%   2717
  66%   2757
  75%   2786
  80%   2803
  90%   2863
  95%   2931
  98%   3127
  99%   3371
 100%   3969 (longest request)
```

Détail des options utilisées:

* `-n` , nombre total de requêtes envoyées
* `-c` , nombre de requêtes envoyées en parallèle


Ces petits outils peuvent bien aider pour nous offrir quelque indicateurs, ils ne sont en revanche absolument pas suffisant pour décider d’une mise en production. On se tournera dans ce cas là vers des sites spécialisés comme [loadimpact.com](http://loadimpact.com/) ou [blitz.io](http://blitz.io/), on pourra encore utiliser [J-Meter](http://jmeter.apache.org/) pour bien bencher sa plateforme.
