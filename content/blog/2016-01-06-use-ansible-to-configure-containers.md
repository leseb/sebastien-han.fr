---
title: Use Ansible to configure containers
date: 2016-01-06 14:32:00
slug: use-ansible-to-configure-containers
draft: false
categories: ["ansible"]
tags: ["ansible"]
---

![Use Ansible to configure containers](/images/ansible-configure-containers.jpg)

Typically, when we build a container image we have 2 main files:

* `Dockerfile` is the essence of the container, it is what the container is made of, it generally contains packages installation steps and files
* `entrypoint.sh` is where we configure the container, during the bootstrap sequence this script will get executed.
Usually the `entrypoint.sh` file contains bash instructions.

So the idea is, instead of relying on bash scripting when writing container's entrypoint we could call an Ansible to configure it.

<!--more-->

**Do not forget to replace all the my-application statement with the name of your application ;).**

File example for base image `Dockerfile` that your application will be using:.
We simple install Ansible and our application here:


    FROM ubuntu:14.04
    MAINTAINER Sébastien Han "seb@redhat.com"

    # Install prerequisites
    RUN apt-get update && \
        apt-get install -y python python-dev python-pip python-yaml && \
        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

    # Install Ansible
    RUN pip install pyyaml ansible

    # Install my application
    RUN apt-get install -y --force-yes my-application && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

    RUN mkdir -p /opt/ansible/my-application/
    ADD site.yml /opt/ansible/my-application/site.yml

    ADD entrypoint.sh /entrypoint.sh
    ENTRYPOINT ["/entrypoint.sh"]


File example for a `site.yml`, this file will later be used by Ansible in your application container:

    ---
    # Defines deployment design and assigns role to server groups

    - hosts: my-application
      connection: local
      sudo: True
      roles:
      - { role: application1, tags: installation }
      - { role: application2, tags: configuration }


File example for an application `entrypoint.sh`. This is some of the brief instructions that you will find to run Ansible:

    cat >/opt/ansible/my-application/inventory <<EOF
    [my-application]
    127.0.0.1
    EOF

    cat >/opt/ansible/my-application/group_vars/all <<EOF
    foo: bar
    foo1: bar1
    EOF

    cd /opt/ansible/my-application
    ansible-playbook -vvv -i inventory site.yml

Now simply run `docker run <image>` and your container will get configured by Ansible :).
As always use `docker logs -f <container-id>` to check the bootstrap process.

<br />

> Ansible power! Now it would be interesting to do a bit of profiling as Ansible might slow things down a little bit.
From some of the test I ran, this is not much but it is up to you to decide whether it is acceptable or not.
