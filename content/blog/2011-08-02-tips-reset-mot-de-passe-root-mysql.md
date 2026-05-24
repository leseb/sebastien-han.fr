---
title: "Tips: reset mot de passe root MySQL"
date: 2011-08-02 21:30:00
slug: tips-reset-mot-de-passe-root-mysql
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

Il y a peu j’ai du intervenir sur un serveur possedant une base de données MySQL. Problème, plus personne ne se rappelait le mot de passe de l’utilisateur root. Un site étant encore en ligne il me fallait trouver une solution rapide avec un downtime de MySQL inférieur à 2 secondes. Le script a été trouvé au hasard sur la toile, j’y ai apporté quelques modifications concernant la compatibilité des distributions. Sur Debian re-lancer le daemon MySQL par le script INIT fût necessaire alors que sur Ubuntu Server non. Bref un petit script bien pratique.

<!--more-->

```
#!/bin/bash

DISTRO=$(lsb_release -i | awk '{print $3}')

function reset_root_mysql {
	killall -15 mysqld
	read -s -p 'Enter a new root password: ' MYSQL_ROOT_PASSWORD
	echo "UPDATE mysql.user SET Password=PASSWORD('$MYSQL_ROOT_PASSWORD') WHERE User='root';" | mysqld --bootstrap
}

if [[ ! ${DISTRO} =~ (Ubuntu) ]]; then
	reset_root_mysql
	service mysql start
else
	reset_root_mysql
fi
```
