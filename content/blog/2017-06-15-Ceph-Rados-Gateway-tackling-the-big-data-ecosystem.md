---
title: Ceph Rados Gateway tackling the big data ecosystem
date: 2017-06-15 16:04:29
slug: Ceph-Rados-Gateway-tackling-the-big-data-ecosystem
draft: true
categories: []
tags: []
---

![Title](/images/image.png)


<!--more-->

S3A plugin is part of Apache Hadoop for connecting to S3 compatible object store and is supported by major Hadoop vendors
S3A connector to interact with HDFS.

You have a new interface to access Hadoop.
Traditionally, you would use such schema `hdfs://foo/bar`, with S3A you will now do `s3a://foo/bar`.


Benefits of using S3A

* Strong open source community
* Amazon S3 is the standard object access protocol
* S3A is a requirement for all Hadoop data analytics on data stored on AWS S3
* Ability to provide an “Amazon like” experience to the data scientist
* Enable hybrid cloud analytics deployments and application portability between Red Hat and AWS


The approach we are recommending is to use the HDFS S3A filesystem connector and Ceph RGWs.
This eliminates having to worry about replication on top of replication, and instead enables erasure coding.
The 12+1 designs are solid, and are being used by a at least one very large customer for this use case.

DIAGRAM


<br />

> bla
