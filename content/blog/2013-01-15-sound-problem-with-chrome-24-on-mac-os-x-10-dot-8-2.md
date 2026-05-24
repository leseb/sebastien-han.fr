---
title: Sound problems with Chrome 24 on Mac OS X 10.8.2
date: 2013-01-15 19:26:00
slug: sound-problem-with-chrome-24-on-mac-os-x-10-dot-8-2
draft: false
categories: ["syslife"]
tags: ["syslife"]
---


Shortest article ever written on my blog...

From time to time I notice that switching from my audio local source to my Airplay station (and the other way around) somehow muted the sound on Chrome. After some googling I noticed that the problem came from a flash player plugin. You just need to disable it.

For this go to `chrome://plugins`, Show details an then disable the PPAPI plugin located in: 

    /Applications/Google Chrome.app/Contents/Versions/24.0.1312.52/Google Chrome Framework.framework/Internet Plug-Ins/PepperFlash/PepperFlashPlayer.plugin

> Hope it helps!
`

<!--more-->
