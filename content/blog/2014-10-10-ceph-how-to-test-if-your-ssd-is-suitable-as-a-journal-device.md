---
title: "Ceph: how to test if your SSD is suitable as a journal device?"
date: 2014-10-10 12:12:00
slug: ceph-how-to-test-if-your-ssd-is-suitable-as-a-journal-device
draft: false
categories: ["ceph"]
tags: ["ceph"]
---

![Ceph: how to test if your SSD is suitable as a journal device?](/images/ceph-ssd-approved.jpg)

A simple benchmark job to determine if your SSD is suitable to act as a journal device for your OSDs.

<!--more-->

<br />

# I. Testing

To give you a little bit of background when the OSD writes into his journal it uses `D_SYNC` and `O_DIRECT`.
Writing with `O_DIRECT` bypasses the Kernel page cache, while `D_SYNC` ensures that the command won't return until every single write is complete.
So yes, basically the OSD forces all the writes to be flushed prior to start the next IO.

First disable the write cache on the disk:

```bash
$ sudo hdparm -W 0 /dev/hda 0
```

Disable the controller cache, assuming your controller is from HP, in slot 2 and your logical drive is the number 1:

```bash
$ sudo hpacucli ctrl slot=2 modify dwc=disable
$ sudo hpacucli controller slot=2 logicaldrive 1 modify arrayaccelerator=disable
```

Now you can start benchmarking your SSD correctly using two different methods.
The FIO way:

```bash
$ sudo fio --filename=/dev/sda --direct=1 --sync=1 --rw=write --bs=4k --numjobs=1 --iodepth=1 --runtime=60 --time_based --group_reporting --name=journal-test
```

Now it is important to understand the option we passed:

* `--filename`: device we want to test
* `--direct`: we open the device with `O_DIRECT` which means that we are bypassing the Kernel page cache
* `--sync`: we open the device with `O_DSYNC` we don't acknowledge until we are sure that the IO has been completely written
* `--rw`: IO pattern, here we use `write` for sequential writes, journal writes are always sequential
* `--bs`: block size, here we are submitting 4K IOs, this is probably the worst case scenario, so you can always change this value if you know your workload
* `--numjobs`: number of threads that will be running, think this has `ceph-osd` daemons writing to the journal
* `--iodepth`: we are submitting IO one by one.
* `--runtime`: job duration in seconds
* `--time_based`: run for the specified runtime duration even if the files are completely read or written
* `--group_reporting`: If set, display per-group reports instead of per-job when numjobs is specified.
* `--name`: name of the run

<br />

# II. Ramp up

Increase `--numjobs` through every single new run. Here is a little example on a SSD:

* `--numjobs=1` reports bw 23418KB/s or iops=5854
* `--numjobs=2` reports bw=43697KB/s or iops=10924
* `--numjobs=3` reports bw=63592KB/s or iops=15898
* `--numjobs=4` reports bw=68500KB/s or iops=17124. **My SSD is maxing out here**


<br />

# III. Interpret the result

Coming soon...

<br />

# Bonus

If for whatever reasons `fio` is not available, here is the `dd` way:

```bash
$ sudo dd if=/dev/urandom of=randfile bs=1M count=1024 && sync
$ sudo dd if=randfile of=/dev/sda bs=4k count=100000 oflag=direct,dsync
```
<br />

> What matters the most here is to find how the SSD is performing while using D_SYNC. At some point [users reported](http://lists.ceph.com/pipermail/ceph-users-ceph.com/2013-November/025515.html) some SSD misbehaving with DSYNC. Then you better always test your SSD prior to go in production.

<br />
<br />

## Data aggregation tables

Gathering all the comments in two tables, on one side enterprise drives, on the other consumer drives:

<br />

| Enterprise SSD MODEL                                                                                                                                           | Firmware   | 1 JOB     | 5 JOBS    | 10 JOBS
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|-----------|-----------|-------------
| [Netlist EV3 16GB](http://www.netlist.com/products/vault-memory-storage/expressvault-pcIe-ev3/default.aspx)                                                    | ???        | 345 MB/s  | 1439 MB/s  | 1766 MB/s
| [Intel P3700 400GB](http://ark.intel.com/products/79625/Intel-SSD-DC-P3700-Series-400GB-2_5in-PCIe-3_0-20nm-MLC)                                               | SSDPEDMD40 | 406 MB/s  | 926 MB/s  | 920 MB/s
| [Intel P3700 1.6TB](http://ark.intel.com/products/79618/Intel-SSD-DC-P3700-Series-1_6TB-12-Height-PCIe-3_0-20nm-MLC)                                           | SSDPEDMD01 | 360 MB/s  | 985 MB/s  | 1095 MB/s
| [Intel P3600 800GB](http://ark.intel.com/products/80998/Intel-SSD-DC-P3600-Series-800GB-12-Height-PCIe-3_0-20nm-MLC)                                           | 5cd2e4     | 328 MB/s  | 800 MB/s  | 801 MB/s
| [SanDisk Fusion ioMemory SX300-1300, 1.3TB](http://www.sandirect.com/fusion-iomemory-sx300-1250gb-mlc-solid-state-server-accelerator-mlc-nand-flash-pcie-card) | ???        | 174 MB/s  | 793 MB/s  | 1101.9 MB/s
| [Samsung PM863 1.92TB](http://www.samsung.com/us/business/computing/solid-state-drives?filter=pm863-series)                                                    | GXT3003Q   | 163 MB/s  | 344 MB/s  | 345 MB/s
| Dell Express Flash NVMe XS1715 SSD 400GB                                                                                                                       | ???        | 110 MB/s  | 495 MB/s  | 628 MB/s
| [Samsung PM863](http://www.samsung.com/us/business/computing/solid-state-drives?filter=pm863-series)                                                           | GXT3003Q   | 127 MB/s  | 324 MB/s  | 336 MB/s
| [Intel DC S3610 1.6TB](http://www.intel.com/content/www/us/en/solid-state-drives/solid-state-drives-dc-s3610-series.html)                                      | ???        | 96 MB/s   | 208 MB/s  | 241 MB/s
| [FusionIO IOdrive2 410GB](http://www.fusionio.com/products/iodrive2)                                                                                           | ???        | 85.1 MB/s | ??? MB/s  | ??? MB/s
| [Samsung SM863 240GB](http://www.samsung.com/global/business/semiconductor/minisite/SSD/global/html/ssdsm863/overview.html)                                   | GXM1003Q   | 64.7 MB/s | 125 MB/s  | 125 MB/s
| [400GB SanDisk Lightning II 12Gb SAS SSD](http://www.sandisk.com/assets/docs/lightning-genII-sas-ssd-product-family-datasheet.pdf)                             | ???        | 48.9 MB/s | 194 MB/s  | 255 MB/s
| [HGST Ultrastar SSD1600MM 800 GB](https://www.hgst.com/products/solid-state-solutions/ultrastar-ssd1600mm)                                                     | ???        | 43.9 MB/s | 96  MB/s  | 177 MB/s
| [Intel DC S3500](http://www.intel.com/content/www/us/en/solid-state-drives/solid-state-drives-dc-s3500-series.html)                                            | ???        | 39.1 MB/s | ??? MB/s  | ??? MB/s
| [Intel DC S3700 100GB](http://www.intel.com/content/www/us/en/solid-state-drives/solid-state-drives-dc-s3700-series.html)                                      | ???        | 35.2 MB/s | ??? MB/s  | ??? MB/s
| [SanDisk Cloudspeed II Eco, 960GB](https://www.sandisk.com/business/datacenter/products/flash-devices/ssds/sata-ssd/cloudspeed-gen2)                           | ???        | 34.9 MB/s | 176 MB/s  | 185 MB/s
| [Micron M500DC 480 GB](http://www.micron.com/products/solid-state-storage/enterprise-sata-ssd/m500dc-enterprise-sata-ssd)                                      | ???        | 33.6 MB/s | ??? MB/s  | ??? MB/s
| [Intel DC S3700 400GB](http://www.intel.com/content/www/us/en/solid-state-drives/solid-state-drives-dc-s3700-series.html)                                      | 5DV10270   | 26 MB/s   | 44.7 MB/s | 68 MB/s
| [Intel DC S3700 200GB](http://www.intel.com/content/www/us/en/solid-state-drives/solid-state-drives-dc-s3700-series.html)                                      | ???        | 22.5 MB/s | ??? MB/s  | ??? MB/s
| [Intel DC S3710 200GB](http://www.intel.com/content/www/us/en/solid-state-drives/solid-state-drives-dc-s3710-series.html)                                      | G2010140   | 23,6 MB/s | ??? MB/s  | ??? MB/s
| [Micron p400e 400GB](http://www.micron.com/products/solid-state-storage/enterprise-sata-ssd/p400e-enterprise-sata-ssd)                                         | ???        | 3.0 MB/s  | ??? MB/s  | ??? MB/s

<br />
<br />

| Consumer SSD MODEL                                                                                                                                                          | Firmware | 1 JOB     | 5 JOBS    | 10 JOBS
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------|-----------|-------------
| [Intel 750 NVMe 400GB](http://www.intel.com/content/www/us/en/solid-state-drives/solid-state-drives-750-series.html)                                                        | ???      | 261 MB/s  | 884 MB/s  | ??? MB/s
| [Samsung SSD 950 PRO 512GB NVMe](http://www.samsung.com/uk/consumer/memory-storage/ssd/950-pro/MZ-V5P512BW)                                                    | ???        | 245 MB/s  | 329 MB/s  | 388 MB/s
| [Kingston v300 120GB](http://www.kingston.com/en/ssd/)                                                                                                                      | 603ABBF0 | 98 MB/s   | 181 MB/s  | 200 MB/s
| [LITEON ECE-200 200GB](http://www.liteonssd.com/index.php?option=com_zoo&view=item&category_id=0&item_id=2470&Itemid=177)                                                   | ???      | 15.2 MB/s | ??? MB/s  | ??? MB/s
| [Adata SP900 120GB](http://www.myce.com/review/adata-sp900-128gb-ssd-review-62160/)                                                                                         | ???      | 11.3 MB/s | ??? MB/s  | ??? MB/s
| [Kingston v300 60GB](http://www.kingston.com/en/ssd/)                                                                                                                       | 505ABBF0 | 9.2 MB/s  | 22 MB/s   | 39 MB/s
| [Intel 520 60GB](http://ark.intel.com/products/66247/Intel-SSD-520-Series-60GB-2_5in-SATA-6Gbs-25nm-MLC)                                                                    | 400i     | 9 MB/s    | 22.3 MB/s | 40 MB/s
| [Intel 520 180GB (FW - 400i) connected to (Dell C2100 Onboard SATA ICH10 - 3Gbps)](http://ark.intel.com/products/66249/Intel-SSD-520-Series-180GB-2_5in-SATA-6Gbs-25nm-MLC) | ???      | 8.7 MB/s  | 22 MB/s   | 40 MB/s
| [SanDisk Ultra II 120G](https://www.sandisk.com/home/ssd/ultra-ii-ssd)                                                                                                      | X31200RL | 7.6 MB/s  | 28.7 MB/s | 40 MB/s
| [SanDisk Ultra Plus 256GB ](https://www.sandisk.com/home)                                                                                                                   | X2306RL  | 6 MB/s    | 19 MB/s   | 33 MB/s
| [Intel 510](http://ark.intel.com/products/56577/Intel-SSD-510-Series-250GB-2_5in-SATA-6Gbs-34nm-MLC)                                                                        | ???      | 4.2 MB/s  | ??? MB/s  | ??? MB/s
| [Crucial MX200](http://www.crucial.com/usa/en/storage-ssd-mx200)                                                                                                            | ???      | 3.7 MB/s  | ??? MB/s  | ??? MB/s
| [Plextor M6e 120GB](http://www.plextor-digital.com/index.php/fr/M6e/m6e.html)                                                                                               | ???      | 2.7 MB/s  | ??? MB/s  | ??? MB/s
| [PLEXTOR PX-128M5](http://www.goplextor.com/)                                                                                                                               | ???      | 2.6 MB/s  | ??? MB/s  | ??? MB/s
| [Samsung XP941 256GB](http://www.samsung.com/us/hpworkstation/media/XP941_ProdOverview_2014_F.pdf)                                                                          | ???      | 2.5 MB/s  | 5 MB/s    | ??? MB/s
| [Adata SP920](http://www.adata.com/us/ssd/feature/286)                                                                                                                      | ???      | 2.2 MB/s  | ??? MB/s  | ??? MB/s
| [Samsung 850 evo 250GB](http://www.samsung.com/global/business/semiconductor/minisite/SSD/global/html/ssd850evo/overview.html)                                              | ???      | 1.9 MB/s  | ??? MB/s  | ??? MB/s
| [Samsung 840 evo 250GB](http://www.samsung.com/global/business/semiconductor/minisite/SSD/global/html/ssd840evo/overview.html)                                              | ???      | 1.9 MB/s  | ??? MB/s  | ??? MB/s
| [Samsung 850 Pro 256GB](http://www.samsung.com/global/business/semiconductor/minisite/SSD/global/html/ssd850pro/overview.html)                                              | ???      | 1.5 MB/s  | 4 MB/s    | 6.7 MB/s
| [Samsung 850 Pro 128GB](http://www.samsung.com/global/business/semiconductor/minisite/SSD/global/html/ssd850pro/overview.html)                                              | ???      | 1.2 MB/s  | ??? MB/s  | ??? MB/s
| [Toshiba OCZ VT180 960GB](https://ocz.com/eu/ssd/vt180-ssd)                                                                                                                 | ???      | 1.0 MB/s  | 1.7 MB/s  | 3.3 MB/s
| [Adata SP900](http://www.adata.com/en/ssd/feature/171)                                                                                                                      | ???      | 0.8 MB/s  | ??? MB/s  | ??? MB/s
| [Crucial m550](http://www.crucial.com/usa/en/storage-ssd-m550)                                                                                                              | ???      | 0.8 MB/s  | ??? MB/s  | ??? MB/s
| [INTEL 535 SSDSC2BW240H6 240GB](http://ark.intel.com/products/86734/Intel-SSD-535-Series-240GB-2_5in-SATA-6Gbs-16nm-MLC)                                                    | ???      | 401 kB/s  | ??? MB/s  | ??? MB/s
