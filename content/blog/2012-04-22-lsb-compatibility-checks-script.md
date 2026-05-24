---
title: LSB Compatibility Checks script
date: 2012-04-22 14:01:00
slug: lsb-compatibility-checks-script
draft: false
categories: ["pacemaker"]
tags: ["pacemaker"]
---

Sometimes you want to provide high availability on a service. Unfortunately there is no resource agent available by the provider. Thus you have to use the LSB script, which is also fine. Before that you just have to be sure that your LSB script is compatible. I wrote a simple bash script to figure this out :).

<!--more-->
```
#!/bin/bash

## Main

echo "Please select a service to check:"
read TMP_DAEMON
DAEMON="/etc/init.d/$TMP_DAEMON"
if [ -f $DAEMON ]; then
	if [[ `$DAEMON status > /dev/null; echo $?` -eq 3 ]]; then
	    $DAEMON start /dev/null
	    CODE=$(echo $?)
	    if [ $CODE -eq 0 ]; then
	        echo -e "START facility in STOPPED state \033[32m[OK]\033[0m"
	    else
	        echo -e "START facility in STOPPED state \033[31m[FAILED]\033[0m, returned $CODE and should return 0"
	    fi
	    $DAEMON status > /dev/null
	    CODE=$(echo $?)
            if [ $CODE -eq 0 ]; then
            	echo -e "STATUS facility in RUNNING state \033[32m[OK]\033[0m"
            else
                echo -e "STATUS facility in RUNNING state \033[31m[FAILED]\033[0m, returned $CODE and should return 0"
            fi
            $DAEMON start > /dev/null
            CODE=$(echo $?)
            if [ $CODE -eq 0 ]; then
            	echo -e "START facility in RUNNING state \033[32m[OK]\033[0m"
            else
                echo -e "START facility in RUNNING state \033[31m[FAILED]\033[0m, returned $CODE and should return 0"
            fi
            $DAEMON stop > /dev/null
            CODE=$(echo $?)
            if [ $CODE -eq 0 ]; then
            	echo -e "STOP facility in RUNNING state \033[32m[OK]\033[0m"
            else
                echo -e "STOP facility in RUNNING state \033[31m[FAILED]\033[0m, returned $CODE and should return 0"
            fi
            $DAEMON status > /dev/null
            CODE=$(echo $?)
            if [ $CODE -eq 3 ]; then
            	echo -e "STATUS facility in STOPPED state \033[32m[OK]\033[0m"
            else
                echo -e "STATUS facility in STOPPED state \033[31m[FAILED]\033[0m, returned $CODE and should return 3"
            fi
            $DAEMON stop > /dev/null
            CODE=$(echo $?)
            if [ $CODE -eq 0 ]; then
            	echo -e "STOP facility in STOPPED state \033[32m[OK]\033[0m"
            else
                echo -e "STOP facility in STOPPED state \033[31m[FAILED]\033[0m, returned $CODE and should return 0"
            fi
            $DAEMON status > /dev/null
            CODE=$(echo $?)
            if [ $CODE -eq 3 ]; then
                echo -e "STATUS facility in FAILED state \033[31m[FAILED]\033[0m, returned $CODE and should return an other code than 3"
            else
            	echo -e "STATUS facility in FAILED state \033[32m[OK]\033[0m"
            fi
	else
		echo "The daemon must be stop, please stop it first and relaunch the script..."
		exit 1 
	fi
else
	echo "The daemon does not exist, please provide a valid daemon name and relaunch the script."
	exit 1
fi

echo
echo "For more information, visit the official page: http://www.linux-ha.org/wiki/LSB_Resource_Agents"

```
