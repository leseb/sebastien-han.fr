---
title: "Ceph: update Cephx Keys"
date: 2013-07-26 21:30:00
slug: ceph-update-cephx-keys
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph update Cephx Keys](/images/cephx-update-keys.jpg)

It's not really clear from the command line

<!--more-->

Generate a dummy key for the exercise

```bash
$ ceph auth get-or-create client.dummy mon 'allow r' osd  'allow rwx pool=dummy'

[client.dummy]
    key = AQAPiu1RCMb4CxAAmP7rrufwZPRqy8bpQa2OeQ==
```

Verify that the key is present:

```bash
$ ceph auth list
installed auth entries:
...
client.dummy
    key: AQAPiu1RCMb4CxAAmP7rrufwZPRqy8bpQa2OeQ==
    caps: [mon] allow r
    caps: [osd] allow rwx pool=dummy
...
```

Then grant more permission on the mon:

```bash
$ ceph auth caps client.dummy mon 'allow rwx' osd 'allow rwx pool=dummy'
updated caps for client.dummy
```

Verify that the change has been applied:

```bash
$ ceph auth list
installed auth entries:
client.dummy
    key: AQAPiu1RCMb4CxAAmP7rrufwZPRqy8bpQa2OeQ==
    caps: [mon] allow rwx
    caps: [osd] allow allow rwx pool=dummy
```

<br />

> Hope it helps!
