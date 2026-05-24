---
title: Github get the contributor list of a repository
date: 2016-02-11 10:44:00
slug: github-get-the-contributor-list-of-a-repository
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

Quick tip to retrieve the contributor list of a given repository.
Example bellow with [ceph-ansible](https://github.com/ceph/ceph-ansible):

```bash
$ curl -s https://api.github.com/repos/ceph/ceph-ansible/stats/contributors | grep login | awk -F ":" '{print $2}' | sed 's/"/,@/;s/,$//;s/"$//' | tr -d '\n'
 ,@bmanojlovic ,@hunter ,@guits ,@lorin ,@marmot21 ,@mcsage ,@byronmccollum ,@maethor ,@mhubig ,@laboshinl ,@fcharlier ,@bstillwell ,@lyandrew ,@jjoos ,@BjoernT ,@psy-q ,@bsanders ,@pb-it ,@eikef ,@lpabon ,@ti-mo ,@alfredodeza ,@aisrael ,@andymcc ,@Abhishekvrshny ,@gpocentek ,@Logan2211 ,@git-harry ,@darkcrux ,@nexecook ,@rootfs ,@crcceph ,@mattt416 ,@bengland2 ,@bjne ,@HanXHX ,@andrewschoen ,@matthewrees ,@xals ,@jcftang ,@flisky ,@guestisp ,@msambol ,@leseb
```

> Now you can easily ping them.

<!--more-->
