---
title: 'Improve Your Linux Skills - All You Need to Know About Tmux in 5 Minutes'
date: 2020-12-18T08:12:16-05:00
image: 'Improve-Your-Linux-Skills-All-You-Need-to-Know-About-Tmux-in-5-Minutes'
tags:
  - linux
  - tmux
  - bash
categories:
  - Linux
authors:
  - Andrei Maksimov
---

This article will help you learn the most popular and powerful terminal multiplexer - Tmux in just 5 minutes! We covered the installation process, working with Tmux sessions and windows, and provided a link to the excellent Tmux customization repository!

Tmux is also known as a "terminal multiplexer," a powerful productivity tool that helps you perform multitasking in an easier way to increase productivity. It is very similar to the Windows Manager or GNU screen, which means you can start a Tmux session and open multiple windows inside that session. Tmux allows you to switch between various programs in one terminal and keep programs running persistently on servers. So you can easily connect and disconnect your session without interrupting your running tasks.

Tmux is very useful when you are working on the remote server over the SSH connection. Just imagine what happened if you lost your SSH connection while working on the remote server. The Tmux session will be detached but will keep running on the server in the background. You can reconnect to the server again with SSH and attach it to the running session.

In this tutorial, we will show you how to install and use Tmux with examples.

## Install Tmux.

{{< my-picture name="Improve-Your-Linux-Skills-All-You-Need-to-Know-About-Tmux-in-5-Minutes-Tmux-install" >}}

By default, the Tmux package is available in the default repository of all major operating systems.

On Ubuntu and Debian based distribution, you can install it with the following command:

```sh
apt-get install tmux -y
```

On CentOS, RHEL, and Fedora, you can install it with the following command:

```sh
yum install tmux -y
```

macOS users may use the brew installation process:

```sh
brew install tmux
```

After installing Tmux, verify the installed version of Tmux with the following command:

```sh
tmux -V
```

You should see the following output:

```txt
tmux 3.1b
```

## Tmux Commands.

{{< my-picture name="Improve-Your-Linux-Skills-All-You-Need-to-Know-About-Tmux-in-5-Minutes-Tmux-CheatSheet" >}}

You can list all options available with Tmux using the following command:

```sh
tmux --help
```

You should get the following output:

```sh
usage: tmux [-2CluvV] [-c shell-command] [-f file] [-L socket-name]
            [-S socket-path] [command [flags]]
```

A brief explanation of each command is shown below:

* **-V :** Used to print installed Tmux version.
* **-v :** Used to enable verbose logging.
* **-u :** Used to informs Tmux that UTF-8 is supported.
* **-S :** Used to specify an alternative path of the server socket.
* **-q :** Used to prevent the server from sending various informational messages.
* **-L :** Allows you to select a different socket name.
* **-f :** Used to specify an alternative configuration file.
* **-C :** Allows you to start in control mode.

If you want to read more about Tmux, run the following command:

```sh
man tmux
```

## Tmux Sessions.

{{< my-picture name="Improve-Your-Linux-Skills-All-You-Need-to-Know-About-Tmux-in-5-Minutes-Tmux-Session" >}}

Tmux sessions are used to define the general task. Tmux sessions are persistent and allow you to open multiple windows inside that session. In this section, we will show you how to use Tmux sessions by examples.

### Start a New Tmux Session.

To start a new session, just open your terminal and run the following command:

```sh
tmux
```

This command will start a new Tmux session, create a new window, and start a shell in that window, as shown below:

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-command" >}}

You can see a status line at the bottom of the above screen.

You can now run any command inside the Tmux session.

To get a list of all commands, just press the **CTRL + b** and type **?**. You should see the following screen:

{{< my-picture name="Improve-Your-Linux-Skills-All-You-Need-to-Know-About-Tmux-in-5-Minutes-Tmux-Help" >}}

Press **CTRL+b** followed by **d** to exit from the Tmux session.

### Create a New Named Tmux Session.

When you start a new Tmux session without any option, it will assign a name numerically. Named sessions are beneficial when you run multiple sessions.

To create a new named Tmux session with name session1, run the following command:

```sh
tmux new -s session1
```

The above command will create a new session name **session1**.

### Tmux List Sessions.

If you want to get a list of all running Tmux sessions, run the following command:

```sh
tmux ls
```

You should get a list of all active Tmux sessions in the following output:

```txt
0: 1 windows (created Wed Dec 16 13:01:44 2020) [143x38] (attached)
session1: 1 windows (created Wed Dec 16 13:01:53 2020) [143x38] (attached)
```

## Attach and Detach from a Tmux Session.

Tmux allows you to attach and detach from any active sessions. You can disconnect from your current Tmux session with the following command:

```sh
tmux detach
```

The command above will bring you out from the active Tmux session. You can attach any Tmux sessions any time using the Tmux attach command.

If multiple Tmux sessions are active in your system, you will need to list all active Tmux sessions. Then you can attach to the desired Tmux session.

First, list all active Tmux sessions with the following command:

```sh
tmux ls
```

You should get a list of all active Tmux sessions in the following output:

```txt
0: 1 windows (created Wed Dec 16 13:01:44 2020) [143x38] (attached)
session1: 1 windows (created Wed Dec 16 13:01:53 2020) [143x38] (attached)
```

In the above output, there are two Tmux sessions are running named **0** and **session1**. You can now attach any session by defining a session name.

For example, attach to the session1 by running the following command:

```sh
tmux attach -t session1
```

To kill specific Tmux sessions, run the following command:

```sh
tmux kill-session -t session1
```

## Tmux Window.

{{< my-picture name="Improve-Your-Linux-Skills-All-You-Need-to-Know-About-Tmux-in-5-Minutes-Tmux-Windows" >}}

Tmux Window allows you to perform multiple tasks within a single window. This can be very useful when you want to run multiple jobs in parallel.

To create a new window, you will need to be attached to any Tmux session.

For example, attach to session1 with the following command:

```sh
tmux attach -t 0
```

Next, press **CTRL+b** followed by **c** to create a new window. You should see a list of all windows on the bottom of the following screen’s status line.

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-command" >}}

As you can see, the range from the range 0 to 9 will be assigned to a new window.

To display an interactive list of all windows press **CTRL+b** followed by **w**. You should see the following screen:

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-list-windows" >}}

You can now press **up/down arrow** keys to choose your desired windows.

Press **CTRL+b** followed by **n** to switch to the next window.

Press **CTRL+b** followed by **p** to switch to the next window.

Press **CTRL+b** followed by **&** to close a Tmux window. You should see the following screen:

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-kill-window" >}}

## Tmux Panes.

Tmux Panes allows you to divide each Tmux window into multiple panes. This will helps you to manage various tasks within a single window.

Press **CTRL+b** followed by **%** to split all windows vertically. You should see the following screen:

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-vertical-split" >}}

Press **CTRL+b** followed by **"** to split all windows horizontally. You should see the following screen:

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-horizontal-split" >}}

Press **CTRL+b** followed by **o** to go to the next pane.

Press **CTRL+b** followed by **z** to zoom on any active panes.

Press **CTRL+b** followed by **;** to toggle between the current and previous pane.

Press **CTRL+b** followed by **}** to swap with the next pane.

Press **CTRL+b** followed by **{** to swap with the previous pane.

Press **CTRL+b** followed by **x** to kill the current pane.

And finally, you may have as many different panes splits as needed:

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-complex-split" >}}

## Customize Tmux.

By default, Tmux does not have any configuration file. If you want to customize Tmux, then you will need to create a tmux.conf configuration file inside /etc/ directory for system-wide changes. If you want to customize Tmux for a single user, then you will need to create the file in the user's home directory ~/.tmux.conf.

By default, Tmux uses the **CTRL+b** key combination. This section will show you how to change the Tmux default key combination from **CTRL+b** to **CTRL+m**.

To do so, create a Tmux configuration file with the following command:

```sh
nano ~/.tmux.conf
```

Add the following lines:

```txt
unbind C-b
set -g prefix C-m
```

Save and close the file when you are finished. Now, you can use **CTRL+a** key combination to activate functions.

Here’s an excellent [GitHub repository](https://github.com/gpakosz/.tmux), which shows how you may customize Tmux.

{{< my-picture name="All-you-need-to-know-about-Tmux-In-5-Minutes-tmux-customization" >}}

## Conclusion.

In this article, we covered the most critical Tmux features to become productive from the first steps! Besides, we covered the installation process, working with Tmux sessions and windows, and provided a link to the great Tmux customization repository!

If you found this article useful, please, help us to spread it to the world!
