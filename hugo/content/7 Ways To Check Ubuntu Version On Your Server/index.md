---
title: '7 Ways to Check Ubuntu Version on Your Server'
date: 2020-11-26T09:24:15-05:00
image: '7-Ways-to-Check-Ubuntu-Version-on-Your-Server'
tags:
  - linux
  - ubuntu
  - bash
categories:
  - Linux
authors:
  - Andrei Maksimov
---

In this article, we will provide you seven ways to check the Ubuntu version on your server. We will cover `motd`, `/etc/lsb-release`, and `/etc/os-release` files, `lsb_release`, `hostnamectl`, and `neofetch` utilities. Choose your personal most suitable way to check the Ubuntu version on your server in 2 minutes!

The Ubuntu server (Ubuntu Linux) is a free and open-source operating system. Ubuntu is the most popular and widely used Linux distribution nowadays used as a desktop and a server operating system.

One of the most common questions arises when you administer many Ubuntu servers is which OS version does the server has.

This article will cover the most common ways to figure out the answer to the question above.

## lsb_release.

LSB stands for Linux Standard Base. LSB gives you specific information, including the release codename, version number, and distribution ID of your Linux Distribution.

You may install this utility using the following command:

```sh
apt-get update

apt-get install -y lsb-release
```

Now, use the following command to get the OS version:

```sh
lsb_release -a
```

Here’s an expected output:

{{< my-picture name="lsb_release-utility" >}}

## /etc/lsb-release.

`/etc/lsb-release` is another source of your Ubuntu server OS version. Execute the following command to get an Ubuntu version:

```sh
cat /etc/lsb-release
```

The output:

{{< my-picture name="lsb_release-file" >}}

## /etc/issue.

Like from `/etc/lsb-release`, you can get your Ubuntu version from `/etc/issue` file:

```sh
cat /etc/issue
```

Here’s an expected output:

{{< my-picture name="issue-file" >}}

## /etc/os-release.

Another file you may get Ubuntu OS version from is `/etc/os-release`:

```sh
cat /etc/os-release
```

This file contains more detailed information about your Ubuntu system.

{{< my-picture name="os_release-file" >}}

## motd.

`motd` is an abbreviation of **M**essage **O**f **T**he **D**ay. The purpose of this tool is to provide you information about the system when you’re logging into the server using SSH, for example.

{{< my-picture name="motd" >}}

## hostnemctl.

This command sets up the hostname in Ubuntu, but it is also another easy way to view the Ubuntu version. Type the following command in your terminal:

```sh
hostnamectl
```

The output of this command will contain the Ubuntu OS version.

{{< my-picture name="hostnamectl-utility" >}}

## neofetch.

Neofetch yet another Ubuntu app, which provides a beautiful system info output to the users. You can use this tool to get the version and other details of your Ubuntu server.

To install `neofetch`, use the following commands:

```sh
apt-get update

apt-get -y install neofetch
```

Next, you can call it directly in your terminal:

```sh
neofetch
```

The output will provide you with the Ubuntu release number, the Linux kernel version, and other essential details of your server.

{{< my-picture name="neofetch-utility" >}}

## Conclusion.

Anyone can follow our guidance and get the Ubuntu OS version on the server quickly and easily. We hope you find this article useful. If so, please, help us to spread it to the world!

If you still have any questions, comment, or you can share another useful method of getting the Ubuntu version using CLI, please, feel free to share your thought in the comments section below.
