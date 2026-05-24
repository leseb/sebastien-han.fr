---
title: sebastien-han.fr version 3
date: 2016-04-21 15:08:38
slug: sebastien-han-version-3
draft: false
categories: ["life"]
tags: ["life"]
---

![Hexo](/images/hexo.png)

Yes I know I have been a bit quiet recently, the reason? I was working on a new version of the website.
More than four years after my migration from [Wordpress to Octopress](http://www.sebastien-han.fr/blog/2012/03/19/fresh-start/) I decided to move away from Octopress.
Today the site has a new design with a brand new landing page and not so new but very similar design for the blog.
In this article, I will quickly explain some of the reasons.

<!--more-->

Don't get me wrong [Octopress](http://octopress.org/) did more than its job during those years.
Even if at some point I had to tweak to do what I wanted I got really pissed and tired of fixing both ruby and gem dependencies after each OSX updates.
Moreover, for some reasons while running a `rake watch`, equivalent of `hexo server` to run a preview my website, the Jekyll server was taking up to 100% of my CPU.
This thing drove me crazy, I never looked into it and the easiest solution for me was to use `cputhrottle` to limit the CPU usage of the process.
As a result, previewing the changes of my website took forever, thing that works instantaneously with Hexo now and with no CPU usage at all.

However, this was not the only reason of my move, I have been waiting for a while the version 3 of Octopress.
Last year when I read [Octopress 3.0 Is Coming](http://octopress.org/2015/01/15/octopress-3.0-is-coming/) I was really exited as most of the features I was looking for were there.
Later while looking at the [contributions on Github](https://github.com/imathis/octopress/graphs/contributors), I noticed the project didn't get much attention recently.
I even tried to install Octopress 3 when it was in beta or so but I was not really successfully.
As far as I remember I had issue with some version of `rake`.
I did not dig further and basically sticked with what I had.

This is just recently that after yet another OSX update, everything was broken and got really pissed with the rest of the issues mentioned earlier.
So this is how I started to look at another static website engine. After looking at a couple of comparison on the web I decided to give a try at both [Hugo](https://gohugo.io/) and [Hexo](https://hexo.io/).
I liked the fact that Hugo is in Go and that it can be installed via brew but it just did not work at of the box.
Since I didn't want to spend to much time on this I took the faster way and Hexo did the job quite rapidly.
Since Hexo is based on [Node.hs](https://nodejs.org/en/) it is quite easy to hack it and all of its modules, this avoids the burden of having to do any re-compilation.

In the end, most of the time I spent was on the design. The blog is a modified version of the [casper](https://github.com/moretwo/hexo-theme) theme.
Once again I was really happy with the design I had with Octopress so I just tweaked casper to make it look like what I had.
I might continue to add a couple of things but for now I'm quite happy with the results.

As for the migration, it was really like describes [here](https://hexo.io/docs/migration.html#Octopress).
I just had some missing modules that I later installed.
