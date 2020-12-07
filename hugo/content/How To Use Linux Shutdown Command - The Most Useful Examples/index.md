---
title: 'How to Use Linux Shutdown Command - The Most Useful Examples'
date: 2020-11-26T19:30:05-05:00
image: 'How-to-Use-Linux-Shutdown-Command-The-Most-Useful-Examples'
tags:
  - linux
  - ubuntu
  - bash
  - reboot
  - shutdown
categories:
  - Linux
authors:
  - Andrei Maksimov
---

There’re many different ways you can turn off and reboot your local or remote computer. In this article, we’ll show the most useful examples of a planned and instantaneous system shutdown or reboot operations. Extend your Linux skills in just one minute!

Powering off or rebooting your system using a safe and correct way is still very important, even you’re working in the cloud. It is also important to notify other users who may be working on a remote server in some cases.

Only the root user can shut down the system using the terminal; the other users can’t.

## Shutdown command.

{{< my-picture name="Linux-Shutdown-Command" >}}

When you execute the **shutdown** command, all the connected users get notified that the system is powering off. All new logins are blocked. Only the root user can invoke a shutdown command and cancel this operation.

The basic syntax of a shutdown command in Linux is:

```sh
shutdown [options] [-t seconds] time [message]
```

Let’s break down every argument:

* **[options]**: You can use several parameters when calling this command. There are many options you can use to satisfy your needs. For example, you can use **-r** argument to reboot the system and **-c** to cancel a pending shutdown.
* **[-t seconds]**: During a shutdown, the **init** process changes the run-level to 0 to halt the system. **-t** will instruct the **init** process to wait for a given number of seconds. For example, **-t 10**, will wait for ten seconds.
* **time**: You may use this argument to specify the exact time to shut down the system. There are two ways to do that. The first way is to use **hh:mm** format, where **hh** hours and **mm** are the minutes. The second way is **+m**, where m is the number of minutes to wait.
* **[message]**: You can specify an optional message to all users to notify them about the scheduled shutdown.

### Planned shutdown.

It is straightforward to schedule a planned system shutdown.

To wait for 60 **_seconds_** before the shutdown:

```sh
sudo shutdown 60
```

{{< my-picture name="planned-linux-shutdown-seconds-command" >}}

Here and in all further examples, we’ll use the **sudo** command to elevate our privileges (become root user during the subsequent command execution).

If you’d like to wait for ten minutes before the shutdown, you may use the following command:

```sh
sudo shutdown +10
```

{{< my-picture name="planned-linux-shutdown-minutes-command" >}}

The terminal will notify you and other connected users that the system will shut down at a specific time.

### Cancel shutdown.

If you changed your mind after scheduling a shutdown, you could always cancel this operation by executing the following command:

```sh
sudo shutdown -c
```

Keep in mind that this command will cancel only a pending or scheduled shutdown.

### Instant system shutdown.

If you’d like to stop the server immediately, you can execute the following command:

```sh
sudo shutdown now
```

You can’t stop this operation with a **shutdown -c** command.

### Instant server reboot.

This command is probably the most widely used in the industry. It will reboot your server immediately:

```sh
sudo shutdown -r now
```

### Planned server reboot.

To schedule a planned reboot at a specific time, execute the following command:

```sh
sudo shutdown -r 00:00
```

{{< my-picture name="planned-linux-reboot-specific-time-command" >}}

This command will schedule a planned system reboot at midnight.

### Shutdown at a specified time.

You may plan not only reboot but a complete system shutdown in the same way:

```sh
sudo shutdown 09:30
```

{{< my-picture name="planned-linux-shutdown-specific-time-command" >}}

Using this command, you can schedule a shutdown at any given time using a **24-hour format**. Here is the example of a planned system shut down at **9:30 AM**.

### Shutdown with a custom message.

For example, if you’d like to be polite during the planning system reboot in a short time, you can use a custom message:

```sh
sudo shutdown -r +20 "Please, save any on-going work ASAP; the system will power off in 20 minutes."
```

{{< my-picture name="planned-linux-reboot-specific-time-custom-message-command" >}}

The command above will reboot your system in 20 minutes and notify connected users with a custom message.

### Halt the system.

There’s almost no difference between halting the system and sending it a shutdown signal. After a halt, the thin difference is that you have to push the power button to shut down the system completely.

For example, to halt the system immediately, execute the following command:

```sh
sudo shutdown -H now
```

Simultaneously, a regular shutdown command with **-P** (power off) argument will instruct the Advanced Configuration Power Interface (ACPI) to send a signal to the power unit to turn off the system completely.

To instruct the system to power off:

```sh
sudo shutdown -P +5
```

Invoking the above command will shut down the system and then power it down.

### Prevent any logins before the shutdown.

It might be useful to prevent users from logging into the system before the reboot happens. You can achieve this by using **-k** argument:

```sh
sudo shutdown -k
```

This command will send a real shut down message but will not shut down the system. It will block all new logins to the system.

## Other commands.

**shutdown** command is not only a single way to stop or reboot your server. You may use other commands, which do the same job.

### Halt command.

We already discussed the halting process. If you forget the argument of the **shutdown** command, you may use the **halt** command directly.

```sh
sudo halt
```

Invoking the above command will instruct the hardware to stop all CPU functions, but the system will remain powered.

### Poweroff command.

The **poweroff** command will send an ACPI signal, which instructs a system to power off immediately:

```sh
sudo poweroff
```

### init command.

**init** is a unique process in Linux, which brings the operating system to a specific runlevel. Every service in the Linux operating system is starting on its runlevel. There are several runlevels are there in the system:

* 0 - halt.
* 1 - single-user mode.
* 2 - multi-user mode.
* 3 - multi-user mode with networking.
* 4 - reserved for a user.
* 5 - Start Graphical User Interface.
* 6 - Reboot.

**init** command can change the runlevel to a specified one. For example, here’s another way to halt the system:

```sh
sudo init 0
```

This command will stop the system immediately without any user notifications.

### systemctl command.

**systemd** is a system and service manager for Linux operating systems. **systemctl** is a command to introspect and control the state of systemd. That means you can use **systemctl** as another way to shut down the system:  

```sh
sudo systemctl poweroff
```

This command will send a notification to all users before powering off the machine.

## Conclusion.

We hope you’ve found your personal and the most convenient way to shut down your Linux server. If you have any questions or share another useful way of doing this, please, leave a message in the comments section below.

Of course, if you found this article useful, please, help us spread it to the world.
