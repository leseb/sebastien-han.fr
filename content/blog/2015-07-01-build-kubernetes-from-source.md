---
title: Build Kubernetes from source
date: 2015-07-01 16:27:00
slug: build-kubernetes-from-source
draft: false
categories: ["containers"]
tags: ["containers"]
---

![Build Kubernetes from source](/images/build-kubernetes-from-source.jpg)

It is crucial to know how to build Kubernetes from source if you want to implement new features.

<!--more-->

```bash
$ git clone https://github.com/GoogleCloudPlatform/kubernetes
$ cd kubernetes/
$ sudo yum install -y golang
$ ./hack/local-up-cluster.sh
```

On a different window, run the following

```bash
$ cluster/kubectl.sh config set-cluster local --server=http://127.0.0.1:8080 --insecure-skip-tls-verify=true
$ cluster/kubectl.sh config set-context local --cluster=local
$ cluster/kubectl.sh config use-context local
```

On yet another different window, run the following command to run kubelet on command line and see verbose logging message

```bash
$ pkill -9 kubelet
$ ~/kubernetes/_output/local/bin/linux/amd64/kubelet --v=3 --chaos_chance=0.0 --container_runtime=docker --hostname_override=127.0.0.1 --address=127.0.0.1 --api_servers=127.0.0.1:8080 --port=10250
```

<br />

> You are good to go! Happy hacking with k8s!
