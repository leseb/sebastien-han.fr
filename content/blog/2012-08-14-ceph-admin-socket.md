---
title: Ceph admin socket
date: 2012-08-14 11:12:00
slug: ceph-admin-socket
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph admin socket](/images/ceph-admin-socket.jpg)

The release of the first stable version of Ceph brought a lot of improvment at admin socket level. This is a really useful command that you should use.

<!--more-->

Simple usage:

```bash
$ ceph --admin-daemon /path/to/your/ceph/socket
```

Here an example:

```bash
$ ceph --admin-daemon /var/run/ceph/ceph-osd.2.asok help
config set         set_config <field> <val>: set a config settings
config show        dump current config settings
dump_ops_in_flight show the ops currently in flight
git_version        get git sha1
help               list available commands
log dump           dump recent log entries to log file
log flush          flush log entries to log file
log reopen         reopen log file
perf dump          dump perfcounters value
perf schema        dump perfcounters schema
version            get ceph version
```

Perfcounters value:

```bash
$ ceph --admin-daemon /var/run/ceph/ceph-osd.2.asok perf dump
{"filestore":{"journal_queue_max_ops":500,"journal_queue_ops":0,"journal_ops":117237,"journal_queue_max_bytes":104857600,"journal_queue_bytes":0,"journal_bytes":11014966013,"journal_latency":{"avgcount":117237,"sum":177.87},"op_queue_max_ops":24,"op_queue_ops":0,"ops":117237,"op_queue_max_bytes":104857600,"op_queue_bytes":0,"bytes":11014062523,"apply_latency":{"avgcount":117237,"sum":144327},"committing":0,"commitcycle":171,"commitcycle_interval":{"avgcount":171,"sum":1468.69},"commitcycle_latency":{"avgcount":171,"sum":560.663},"journal_full":3},"osd":{"opq":0,"op_wip":0,"op":33955,"op_in_bytes":4133103742,"op_out_bytes":2890601592,"op_latency":{"avgcount":33955,"sum":5579.27},"op_r":869,"op_r_out_bytes":2890601592,"op_r_latency":{"avgcount":869,"sum":25.0045},"op_w":33086,"op_w_in_bytes":4133103742,"op_w_rlat":{"avgcount":33086,"sum":20.1825},"op_w_latency":{"avgcount":33086,"sum":5554.26},"op_rw":0,"op_rw_in_bytes":0,"op_rw_out_bytes":0,"op_rw_rlat":{"avgcount":0,"sum":0},"op_rw_latency":{"avgcount":0,"sum":0},"subop":31756,"subop_in_bytes":5227493524,"subop_latency":{"avgcount":31756,"sum":2513.02},"subop_w":0,"subop_w_in_bytes":5227493524,"subop_w_latency":{"avgcount":30379,"sum":2258.47},"subop_pull":0,"subop_pull_latency":{"avgcount":0,"sum":0},"subop_push":0,"subop_push_in_bytes":0,"subop_push_latency":{"avgcount":1377,"sum":254.549},"pull":644,"push":635,"push_out_bytes":661397624,"recovery_ops":322,"loadavg":0,"buffer_bytes":0,"numpg":287,"numpg_primary":157,"numpg_replica":127,"numpg_stray":3,"heartbeat_to_peers":4,"heartbeat_from_peers":0,"map_messages":216,"map_message_epochs":325,"map_message_epoch_dups":274},"throttle-filestore_bytes":{"val":0,"max":104857600,"get":0,"get_sum":0,"get_or_fail_fail":0,"get_or_fail_success":0,"take":117237,"take_sum":11014966013,"put":81437,"put_sum":11014966013,"wait":{"avgcount":0,"sum":0}},"throttle-filestore_ops":{"val":0,"max":500,"get":0,"get_sum":0,"get_or_fail_fail":0,"get_or_fail_success":0,"take":117237,"take_sum":117237,"put":81437,"put_sum":117237,"wait":{"avgcount":14,"sum":0.126713}},"throttle-msgr_dispatch_throttler-client":{"val":0,"max":104857600,"get":34513,"get_sum":4172570704,"get_or_fail_fail":0,"get_or_fail_success":0,"take":0,"take_sum":0,"put":34513,"put_sum":4172570704,"wait":{"avgcount":0,"sum":0}},"throttle-msgr_dispatch_throttler-cluster":{"val":0,"max":104857600,"get":109716,"get_sum":6732246409,"get_or_fail_fail":0,"get_or_fail_success":0,"take":0,"take_sum":0,"put":109716,"put_sum":6732246409,"wait":{"avgcount":0,"sum":0}},"throttle-msgr_dispatch_throttler-hbclient":{"val":0,"max":104857600,"get":8670,"get_sum":407490,"get_or_fail_fail":0,"get_or_fail_success":0,"take":0,"take_sum":0,"put":8670,"put_sum":407490,"wait":{"avgcount":0,"sum":0}},"throttle-msgr_dispatch_throttler-hbserver":{"val":0,"max":104857600,"get":8794,"get_sum":413318,"get_or_fail_fail":0,"get_or_fail_success":0,"take":0,"take_sum":0,"put":8794,"put_sum":413318,"wait":{"avgcount":0,"sum":0}},"throttle-osd_client_bytes":{"val":0,"max":524288000,"get":34039,"get_sum":4171998396,"get_or_fail_fail":0,"get_or_fail_success":0,"take":0,"take_sum":0,"put":67191,"put_sum":4171998396,"wait":{"avgcount":0,"sum":0}}}
```

Looking for all the options available or default option value?

```bash
$ ceph --admin-daemon /var/run/ceph/ceph-osd.2.asok config show | grep rbd
debug_rbd = 0/5
rbd_cache = false
rbd_cache_size = 33554432
rbd_cache_max_dirty = 25165824
rbd_cache_target_dirty = 16777216
rbd_cache_max_dirty_age = 1
```

<br />

> That was a little tip about Ceph. I'm currently quite busy benchmarking Ceph, so way more things about Ceph are coming... Stay tuned ;-)
