---
title: Broken rake after update to Mountain Lion
date: 2012-07-26 00:35:00
slug: broken-rake-after-update-to-mountain-lion
draft: false
categories: ["syslife"]
tags: ["syslife"]
---

As you may have noticed, I blog using [Octopress](http://octopress.org/).
I just updated to Mac OS X Mountain Lion and the first s*** happened.
I use an amazing project called [pow](http://pow.cx/) to preview all my article before deploying them to S3.
Usually I run a terminal tab with the `rake watch` command and see this output:

<!--more-->

```bash
$ rake watch
Starting to watch source with Jekyll and Compass.
/usr/local/rvm/gems/ruby-1.9.3-p125/gems/maruku-0.6.0/lib/maruku/input/parse_doc.rb:22:in `<top (required)>': iconv will be deprecated in the future, use String#encode instead.
Configuration from /Volumes/Macintosh HD Data/Users/Leseb/Documents/octopress/_config.yml
/usr/local/rvm/gems/ruby-1.9.3-p125/gems/ffi-1.0.9/lib/ffi/platform.rb:27: Use RbConfig instead of obsolete and deprecated Config.
Auto-regenerating enabled: source -> public
[2012-07-26 00:33:14] regeneration: 381 files changed
/usr/local/rvm/gems/ruby-1.9.3-p125/gems/fssm-0.2.7/lib/fssm/support.rb:40: Use RbConfig instead of obsolete and deprecated Config.
>>> Compass is watching for changes. Press Ctrl-C to Stop.
[2012-07-26 00:35:17] regeneration: 1 files changed
```

But since this update when I tried to preview my article I got this error:

	Traceback (most recent call last):
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site.py", line 565, in <module>
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site.py", line 547, in main
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site.py", line 278, in addusersitepackages
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site.py", line 253, in getusersitepackages
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site.py", line 243, in getuserbase
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/sysconfig.py", line 523, in get_config_var
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/sysconfig.py", line 419, in get_config_vars
	  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/sysconfig.py", line 298, in _init_posix
	IOError: invalid Python installation: unable to open /usr/include/python2.7/pyconfig.h (No such file or directory)

After investigating a bit I discover that apparently the directory as changed:

```bash
$ sudo find / -name pyconfig.h
/Applications/Google Drive.app/Contents/Frameworks/Python.framework/Versions/2.6/include/python2.6/pyconfig.h
/Applications/Google Drive.app/Contents/Resources/include/python2.6/pyconfig.h
/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.6.sdk/System/Library/Frameworks/Python.framework/Versions/2.5/include/python2.5/pyconfig.h
/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.6.sdk/System/Library/Frameworks/Python.framework/Versions/2.6/include/python2.6/pyconfig.h
/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.7.sdk/System/Library/Frameworks/Python.framework/Versions/2.5/include/python2.5/pyconfig.h
/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.7.sdk/System/Library/Frameworks/Python.framework/Versions/2.6/include/python2.6/pyconfig.h
/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.7.sdk/System/Library/Frameworks/Python.framework/Versions/2.7/include/python2.7/pyconfig.h
find: /dev/fd/3: Not a directory
find: /dev/fd/4: Not a directory
/Developer/SDKs/MacOSX10.6.sdk/System/Library/Frameworks/Python.framework/Versions/2.5/include/python2.5/pyconfig.h
/Developer/SDKs/MacOSX10.6.sdk/System/Library/Frameworks/Python.framework/Versions/2.6/include/python2.6/pyconfig.h
/Developer/SDKs/MacOSX10.7.sdk/System/Library/Frameworks/Python.framework/Versions/2.5/include/python2.5/pyconfig.h
/Developer/SDKs/MacOSX10.7.sdk/System/Library/Frameworks/Python.framework/Versions/2.6/include/python2.6/pyconfig.h
/Developer/SDKs/MacOSX10.7.sdk/System/Library/Frameworks/Python.framework/Versions/2.7/include/python2.7/pyconfig.h
/Library/Frameworks/Python.framework/Versions/3.2/include/python3.2m/pyconfig.h
/System/Library/Frameworks/Python.framework/Versions/2.5/include/python2.5/pyconfig.h
/System/Library/Frameworks/Python.framework/Versions/2.6/include/python2.6/pyconfig.h
/System/Library/Frameworks/Python.framework/Versions/2.7/include/python2.7/pyconfig.h
/usr/local/Cellar/python/2.7.3/include/python2.7/pyconfig.h
```

I just assumed that the good pointer was:

    /System/Library/Frameworks/Python.framework/Versions/2.7/include/python2.7/pyconfig.h

Here the solution below, the MacGyver (oh oh oh) solution :

```bash
$ sudo mkdir -p /usr/include/python2.7/
$ sudo ln -s /System/Library/Frameworks/Python.framework/Versions/2.7/include/python2.7/pyconfig.h /usr/include/python2.7/pyconfig.h
```

Nothing 'terrific'.

> Hope it can help all the Octopress users. And don't forget the mention 'framework for hackers' ;)
