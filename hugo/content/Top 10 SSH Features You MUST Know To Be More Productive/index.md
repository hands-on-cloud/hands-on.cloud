---
title: 'Top 10 SSH Features You MUST Know To Be More Productive'
date: '2020-11-02'
image: 'Top 10 SSH Features You MUST Know To Be More Productive'
tags:
  - ssh
categories:
  - Linux
authors:
  - Andrei Maksimov
---

In this article, you’ll find many useful SSH features and tricks to improve your daily productivity. Our visuals will help you to understand SSH setup, configuration file management, authentication, working with multiple SSH keys, and of course, SSH local and remote port forwarding. Become an SSH master in 10 minutes!

## What Is SSH.

Secure Shell, or SSH, is a network protocol that allows you securely connect to a remote server and use a console interface to manage it.

When you establish an SSH connection, the server starts a shell session for you. After that, you can type the commands in your SSH client, and they will be executed on a remote server.

{{< my-picture name="SSH - Session" >}}

System administrators use this protocol to connect and manage remote Linux servers securely.

## How Does SSH Work.

As any network application, SSH uses two components:

* **SSH client** is an application you install on the computer you will use to connect to the network’s Linux-based computer. SSH client establishes an encrypted connection between your computer and the remote server.
* **SSH server** is a server application listening on TCP/IP port 22 for the client connections. If the client provided the correct credentials, the SSH server creates a new user session and allows you to execute remote commands.

{{< my-picture name="How does SSH Work" >}}

## SSH Authentication.

SSH allows you to use multiple different authentication methods. The most widely used are:

* **Password Authentication** - you’re asked for the username and password to get access to the remote host.
* **SSH Key-Based Authentication** - you’re using SSH Public and Private keys for user authentication.

### SSH Key-Based Authentication.

This authentication method is considered to be more secure than using passwords. Here’s how it works:

{{< my-picture name="SSH Key-Based Authentication" >}}

SSH Key-Based Authentication algorithm:

* The client initiates SSH connection.
* The server sends a random message back.
* The client encrypts the received message using a **_private SSH key_** and sends it back to the server.
* The server decrypts the client’s message using a **_public SSH key_**. If the message is the same, the server grants access.

Using password authentication in SSH is not secure. If you’re still using password authentication, you need to change it to SSH Key-Based Authentication ASAP.

## How To Install An SSH Client.

In most Linux systems and macOS, the SSH server is already installed available for you by default. But if you’re playing with Linux in your virtual machine, you may require to install it.

### Ubuntu.

For deb-based Linux distributions, you can install SSH client using the following commands:

```sh
sudo apt-get update
sudo apt-get -y install openssh-client
```

### CentOS, Fedora, RedHat.

For yum-based Linux distributions, you can install SSH client using the following commands:

```sh
sudo yum -y install openssh-clients
sudo systemctl enable sshd
sudo systemctl start sshd
```

### Windows.

For the Windows operation system, [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) became a standard de-facto SSH client. To install it, download the MSI installer from the link above and follow the instructions from [How to Install PuTTY on Windows](https://www.ssh.com/ssh/putty/windows/install).  

Here’s the automated way using Chocolatey. Open PowerShell console in “Run as Administrator” mode) and execute the following commands:

```ps
Set-ExecutionPolicy RemoteSigned

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

choco install putty -y
```

{{< my-picture name="Windows 10 - PuTTY" >}}

## How To Install An SSH Server.

In most Linux systems and macOS, SSH client is already installed available for you by default. But if you’re playing with Linux in your virtual machine, you may require to install it.

### SSH Server - Ubuntu.

For deb-based Linux distributions, you can install SSH client using the following commands:

```sh
sudo apt-get update
sudo apt-get -y install openssh-server
sudo systemctl enable sshd
sudo systemctl start sshd
```

### SSH Server - CentOS, Fedora, RedHat.

For yum-based Linux distributions, you can install SSH client using the following commands:

```sh
sudo yum -y install openssh
sudo systemctl enable sshd
sudo systemctl start sshd
```

### SSH Server - Windows.

SSH server can not be installed on Windows. In the Windows world, you need to use Remote Desktop and [WinRM](https://www.computerperformance.co.uk/powershell/remote/) to control remote Windows servers.

## Create SSH Key.

As soon as you have the SSH client, you may create private and public SSH keys used for [SSH Key-Based Authentication](#ssh-key-based-authentication). To create an SSH key, run the following command in the terminal:

```sh
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

This command will create a 4 Kb RSA keypair:

* `~/.ssh/id_rsa` - SSH Private Key.
* `~/.ssh/id_rsa.pub` - SSH Public Key.

**Important:** The SSH Private Key file must never be shown or sent to anybody.

## Set Up SSH Key-Based Authentication.

To set up SSH Key-Based Authentication on the server, you need to complete the following steps:

* Login to the server.
* Go to the user home directory.
* Edit file **~/.ssh/authorized_keys** and paste the content of the **public key** file there.
* Save changes.

**~/.ssh/authorized_keys** may contain as many public key file records as you need. So, many different people can connect to the server using the same login name but their private key files.

## How To Connect Using SSH.

You can connect to a remote Linux server using an SSH client by typing the following command:

```sh
ssh remote_username@host_ip_address
```

{{< my-picture name="SSH - Session" >}}

## Use Different SSH Keys For Different Servers.

It is a widespread situation when you may need to use different private SSH key files to access different servers. There are several ways how you can do it.

### Specify SSH Key In Connection Command.

To specify a required private key as a part of SSH connection command use `-i` flag:

```sh
ssh -i ~/.ssh/another_private_key remote_username@host_ip_address
```

### Use An SSH Agent.

If you have not too many private keys, you can use an SSH Agent.

SSH Agent is a program, which loads your private SSH key in memory and uses them to pass SSH authentication.

**Linux**.

Start the ssh-agent in the background:

```sh
eval "$(ssh-agent -s)"
```

To add you SSH keys to the agent, use the following commands:

```sh
ssh-add -K ~/.ssh/id_rsa
ssh-add -K ~/.ssh/another_private_key
```

**Windows**.

The PuTTY distribution contains Pagent, which sits in the system tray and plays the same role. Right-click on Pagent and add your SSH key.

{{< my-picture name="Pagent Tray - Add Key" >}}

Now, the SSH client will use all loaded private keys one by one to pass authentication during the SSH connection.

### SSH Configuration File.

Another useful way to configure SSH client parameters is through the `~/.ssh/config` file.

```ini
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_rsa
Host exceptional.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/another_private_key
```

In the example above, we are using the default `~/.ssh/id_rsa` private key file for all the servers, except the `exceptional.com` server. For the `exceptional.com` server, we’ll use `~/.ssh/another_private_key` file.

## SSH Agent and Key Forwarding.

Another favorite SSH feature I’m using on a daily basis is SSH key forwarding. It allows you to use your local SSH keys to connect to different servers.

You can enable SSH key forwarding during SSH client execution by specifying `-T` flag:

```sh
ssh -T remote_username@host_ip_address
```

Or you can permanently enable this configuration at you `~/.ssh/config` file by specifying `ForwardAgent yes`:

```ini
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_rsa
  ForwardAgent yes
```

{{< my-picture name="How does SSH ForwardAgent Work" >}}

## SSH Port Forwarding.

SSH protocol allows you to forward not only SSH Agent communication through a secure SSH channel but any TCP traffic.

If you need to [forward UDP traffic](https://superuser.com/a/53109), use `nc` in combination with SSH.

There’re two types of port forwarding options.

### Local Port Forwarding.

The best way to explain SSH local port forwarding is by taking a look at the following diagram.

{{< my-picture name="SSH Local Port Forwarding" >}}

In this diagram, the **Jump Host** server has private connectivity to the Amazon RDS PostgreSQL server.

The **client** laptop can connect to the **Jump Host server** using the SSH protocol.

The owner of the **client** laptop is looking for a way to connect to the **Amazon RDS instance**.

SSH local port forwarding feature allows binding a port on the **client** laptop. The traffic from the bound port is forwarded through the **Jump Host** server to an **Amazon RDS instance**.

As a result, you to connect to the RDS instance from the **client** laptop, you need to configure `pgsql` at the laptop to connect to `localhost:15432`.

Here’s how you need to establish an SSH connection to the **Jump Host** from the Linux or macOS **client** laptop:

```sh
ssh -L 127.0.0.1:15432:rds-endpoint-url:5432 ec2-user@jump_host_ip
```

If you’re using PuTTY, you need to make changes in **Connections** - **SSH** - **Tunnels** before connecting to the Jump Host.

{{< my-picture name="PuTTY - SSH Local Port Forwarding" >}}

### Remote Port Forwarding.

SSH remote port forwarding is a bit more exciting feature that solves the opposite problem. It allows you to bind the port on the remote ssh server and forward traffic coming to that port to the networks behind the SSH client host.

Here’s an example.

{{< my-picture name="SSH Remote Port Forwarding" >}}

In our example, we have an **Isolated Server**, which does not have access to the internet, and the **client** laptop, which we’re using to connect to the **Jump Host**.

Traffic between **Jump Host** and **Isolated Server** is not restricted.

We need to allow the **Isolated Server** to connect to the internet. How can we do that?

For example, we can launch a Docker container with Squid proxy on the client laptop on port `8080`. Then we can connect to **Jump Host** using SSH. The remote port forwarding feature is to bind port `8081` on the **Jump Host** to forward traffic to the **client** laptop port `8080`.

As a result, the **Isolated Server** will be able to use `http://jump_host_ip:8081` as a proxy server.

To enable remote port forwarding during SSH connection on the Linux or macOS:

```sh
ssh -R 8081:localhost:8080 ec2-user@jump_host_ip
```

For PuTTY and Windows hosts:

{{< my-picture name="PuTTY - SSH Remote Port Forwarding" >}}

## Summary.

In this article, I covered many useful SSH features, which I’m using in my daily work. I hope you’ll start using them too. If something is not clear, please, reach me out in the comments section below. I’ll be more than happy to assist.

If you found this article useful, feel free to help me spread it to the world!
