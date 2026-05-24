---
title: "Nova: archive deleted rows"
date: 2013-05-23 22:38:00
slug: nova-archive-deleted-rows
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Deploy a Ceph MDS server](/images/nova-manage-archive.jpg)

Archiving deleted rows made easy by Grizzly.

<!--more-->

Main purposes:

* Archiving
* Traceability

Move up to max_rows rows from production tables to corresponding shadow tables. Tables can be found in the Nova database.

```sql
mysql> show tables like 'sha%';
+--------------------------------------------+
| Tables_in_nova (sha%)                      |
+--------------------------------------------+
| shadow_agent_builds                        |
| shadow_aggregate_hosts                     |
| shadow_aggregate_metadata                  |
| shadow_aggregates                          |
| shadow_block_device_mapping                |
| shadow_bw_usage_cache                      |
| shadow_cells                               |
| shadow_certificates                        |
| shadow_compute_node_stats                  |
| shadow_compute_nodes                       |
| shadow_console_pools                       |
| shadow_consoles                            |
| shadow_dns_domains                         |
| shadow_fixed_ips                           |
| shadow_floating_ips                        |
| shadow_instance_actions                    |
| shadow_instance_actions_events             |
| shadow_instance_faults                     |
| shadow_instance_id_mappings                |
| shadow_instance_info_caches                |
| shadow_instance_metadata                   |
| shadow_instance_system_metadata            |
| shadow_instance_type_extra_specs           |
| shadow_instance_type_projects              |
| shadow_instance_types                      |
| shadow_instances                           |
| shadow_iscsi_targets                       |
| shadow_key_pairs                           |
| shadow_migrate_version                     |
| shadow_migrations                          |
| shadow_networks                            |
| shadow_provider_fw_rules                   |
| shadow_quota_classes                       |
| shadow_quota_usages                        |
| shadow_quotas                              |
| shadow_reservations                        |
| shadow_s3_images                           |
| shadow_security_group_instance_association |
| shadow_security_group_rules                |
| shadow_security_groups                     |
| shadow_services                            |
| shadow_sm_backend_config                   |
| shadow_sm_flavors                          |
| shadow_sm_volume                           |
| shadow_snapshot_id_mappings                |
| shadow_snapshots                           |
| shadow_task_log                            |
| shadow_virtual_interfaces                  |
| shadow_virtual_storage_arrays              |
| shadow_volume_id_mappings                  |
| shadow_volume_metadata                     |
| shadow_volume_type_extra_specs             |
| shadow_volume_types                        |
| shadow_volume_usage_cache                  |
| shadow_volumes                             |
+--------------------------------------------+
55 rows in set (0.00 sec)
```

<br/>

> Hope it helps!
