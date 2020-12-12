---
title: 'The World of Hypervisors - What Should I Know About Them?'
date: 2020-12-09T10:53:50-05:00
image: 'The-World-of-Hypervisors-What-Should-I-Know-About-Them'
tags:
  - linux
  - hypervisor
categories:
  - Linux
  - AWS
authors:
  - Andrei Maksimov
---

In this article, we covered what hypervisors are and what are their types. We observed the most popular hypervisor solutions for desktop and server virtualization and answered the question of what hypervisors are used by major cloud providers. Learn the most important facts about hypervisors in just 5 minutes!

The hypervisor or virtual machine monitor (VMM) is a solution, which creates and manages virtual machines (VMs).

All VMs on the same physical computer share CPU, memory, storage, and network resources. Each of them, in this case, acts as a dedicated server with smaller compute resources.

The primary use case of hypervisor is the virtualization of servers and applications.

There are many different hypervisors available on the market:

* Qemu KVM.
* Oracle VirtualBox.
* Parallels Desktop.
* Microsoft Hyper-V.
* VMware ESXi.
* Citrix Xen.

Each of the hypervisors has its purpose. For example, ESXi, Hyper-V, KVM, and Xen are used for server virtualization. In comparison, VirtualBox and Parallels Desktop occupied the Desktop market.

The hypervisor's general role is to provision, spin up, and retire the virtual machines as needed. Another critical feature of hypervisor is that it isolates virtual machines from each other and the host computer.

{{< my-picture name="The-World-of-Hypervisors-What-Should-I-Know-About-Them-Hypervisor-Functions" >}}

Some of the functions of hypervisor include:

* **Partitioning** – hypervisor splits the host computer's underlying hardware between different virtual machines.
* **Resources distribution** – hypervisor distributes CPU, memory, and network resources between other VMs.
* **VMs management** – hypervisor starts, stops, and controls VM lifecycle.
* **VM isolation** – all VMs under hypervisor control are entirely isolated; each VM has its own emulated hardware and OS.
* **VM communication** – hypervisor controls how VMs connect to other VMs or hosts in the network.

## Hypervisor Types.

{{< my-picture name="The-World-of-Hypervisors-What-Should-I-Know-About-Them-Hypervisor-Types" >}}

There are two types of hypervisors available – hypervisors of **Type 1** and **Type 2**.

### The hypervisors of Type 1.

Hypervisors of **Type 1** are running on top of the physical hardware of the host. The hypervisor of **Type 1** is an optimized special-purpose OS with direct access to the hardware.

Their nature leads to the primary benefits of hypervisors of **Type 1**:

* Performance of the hypervisor and the VMs.
* Stability of hypervisor and VMs.

The examples of **Type 1** hypervisors are:

* VMware ESX/ESXi.
* Microsoft Hyper-V.
* KVM.
* Citrix Hypervisor.

Type 1 hypervisors share resources efficiently. They also show low latency and dynamic resource usage, and they enhance the communication between the host and the virtual machines and sometimes the communication between virtual machines.

The Type 1 hypervisors help virtualize not only servers but the embedded systems such as robotic factory controllers. Many vendors use this technology to virtualize the network equipment such as switches and routers too.

The primary use-cases for hypervisors or **Type 1**:

* **Systems consolidation** – you do not have to buy new servers because you can increase available hardware utilization by creating multiple virtual machines. The main goal of virtualization is to consolidate servers within data centers.
* **Optimize usage of the physical resources**  – this naturally flows from the previous use-case; a hypervisor helps increase server utilization and accommodate additional applications. Save your money, time, data center space, and energy consumption.
* **Better resource allocation**  – You can manually and automatically manage resource allocation for your virtual servers or applications, which is the primary feature of any cloud.
* **Faster software development and testing** – As a developer, you can deploy repeatable virtual environments for rapid feature development and testing.

### The hypervisors of Type 2.

The Hypervisors of **Type 2** are running on top of the operating system. They are easier to install and run than Type 1, as soon as it has a more complicated deployment and management process.

The hypervisor of **Type 2** has limited access to the host computer's hardware resources because the host OS manages access to the memory, network, and storage. That means VMs launched using hypervisor of **Type 2** always have a bit worse performance.

Besides, if the OS crashes, that hit the hypervisor too, and possible data loss might occur.

The examples of **Type 2** hypervisors are:

* Oracle Virtual Box.
* VMware Workstation.
* Parallels Desktop.

## Compare Hypervisors Types.

One of the main advantages of **Type 2** hypervisors is that they are easy to install. You can install them the same way you would any other software. **Type 1** hypervisors, on the other hand, requires expertise, time, and money to deploy.

**Type 2** requires extra overhead to run, and this makes them less efficient than **Type 1**. All applications running within the same OS as the hypervisor will compete for the same resources, which means that the VMs might run slow.

## Hypervisors for Desktop.

There is plenty of choices of hypervisors to virtualize your desktop. Here’s the list of major players.

### VirtualBox.

[VirtualBox](https://www.virtualbox.org/) is a free and open-source solution, and you can use it in Windows, Linux, or macOS. It is an excellent choice in most cases when you need to run two or more separate OS at the same time on your Laptop.

You can use it to run any desktop Windows version starting from Windows XP, any Windows server starting from Windows NT, Linux based on kernel 2.4 or higher, Solaris, OpenSolaris, and OpenBSD Unix.

Oracle supports VirtualBox. It is also well integrated with [Vagrant](https://www.vagrantup.com/), so you can download and use a wide selection of developer virtual machines.

{{< my-picture name="VirtualBox-UI" >}}

### Qemu KVM.

[Qemu KVM](https://www.qemu.org/) is a virtual hardware emulator that is also free to use. However, it runs on Linux only. This hypervisor runs on top of x86 architecture and can emulate MIPS64, PowerPC, ARM, MicroBlaze, SPArc 32 and 64, SH4, ETRAX CRIS, and RISC-V.

Qemu can emulate VMs without the need for administrator privileges on the host OS. VMs running within this hypervisor perform as well as native installations. However, Qemu doesn’t have sophisticated interface tools, and you will have to rely on CLI tools or APIs to deploy and configure virtual machines.

That is the primary hypervisor for open-source cloud computing platforms such as [OpenStack](https://www.openstack.org/) and [CloudStack](https://cloudstack.apache.org/).

{{< my-picture name="QEMU-Fedora-Boot" >}}

Image source: [commons.wikimedia.org](https://commons.wikimedia.org/wiki/File:QEMU_ARM_Fedora_boot.png).

### VMware.

The [VMware Workstation Player](https://www.VMware.com/products/workstation-player.html) is a hypervisor that runs on Linux and x64 versions of Windows only. You can use it to set up VMs on a single host computer and then use them simultaneously. Each VM will have its OS, such as Linux, Microsoft Windows, and MS-DOS.

VMware Workstation Player is a free VMware product that you can use for non-commercial purposes. At the same time, if you’re interested in the features like Snapshots, enhanced network configuration, VM encryption, or running multiple VMs at once, I’d consider you to try VMware Workstation Pro.

{{< my-picture name="VMware-Workstation" >}}

Image source: [commons.wikimedia.org](https://commons.wikimedia.org/wiki/File:Creaci%C3%B3n_de_una_nueva_simulaci%C3%B3n_en_Cooja.png).

### Virtual PC.

[Microsoft Virtual PC](https://www.microsoft.com/en-us/download/details.aspx?id=3702) is virtualization software that runs on Windows. It does not need hardware virtualization support, and it is free of charge for given editions of Windows. It comes pre-installed by OEMs, or you can download it at the Microsoft Website.

The new version of this solution offers seamless application publishing and launching, USB support and redirection, support for multithreading, smart card redirection, and swift integration with Windows Explorer. It has an intuitive file sharing interface where you can drag and drop files from one VM to another.

### Parallels Desktop.

[Parallels Desktop](https://www.parallels.com/products/desktop/) is well integrated with macOS. It is not a free solution but is affordable, which makes it an ideal choice for personal use and small enterprises. One of the primary use cases for Parallels Desktop is to run Windows alongside macOS.

One of the unique features of this solution is that it can integrate Windows alerts to appear on the Mac Notification panel, allowing you to operate a unified platform.

While Parallels Desktop is synonymous with Windows for Mac, you can still use it to host other operating systems such as Linux distros and Chrome OS. You can run the basic or the Pro Edition, depending on your budget. The Pro Edition is ideal when you need to address more memory and support development environments such as Microsoft Visual Studio. You can also pick the Business Edition that adds centralized license management tools.

With the solution, you have access to usage stats and licensing activities in real-time. You can enroll users with ease through emails generated automatically through a few clicks. Switching process between Mac and guest virtual machine as easy as one click.

{{< my-picture name="Parallels-Desktop" >}}

## What is the best hypervisor for my Desktop?

As a Mac user, I do not see any other options other than to use Parallels Desktop. For any different use-case, I strongly recommend you to proceed with Virtualbox.

Moreover, it is [the most popular Desktop hypervisor in the Wold](https://trends.google.com/trends/explore?date=today%205-y&q=Parallels%20Desktop,VirtualBox,Qemu%20KVM,%2Fm%2F03bxkqb,%2Fm%2F01t9j9), according to Google Trends.

{{< my-picture name="The-best-hypervisor-for-desktop" >}}

## What Hypervisors Are Used By Cloud Providers?

{{< my-picture name="The-World-of-Hypervisors-What-Should-I-Know-About-Them-Cloud-Providers" >}}

### Amazon Web Services.

[Amazon Web Services](https://aws.amazon.com/) is the biggest cloud provider in the world. It allows you to run your work online on a large scale. Today, AWS is a market leader in cloud computing, providing many services like no one else. Over the years, the AWS cloud has grown exponentially. And one of the most common questions is which hypervisor do they use? [AWS uses Xen](https://docs.aws.amazon.com/whitepapers/latest/aws-overview-security-processes/hypervisor.html) (a highly customized version of Xen hypervisor). Starting from C5 instance types, AWS began to use [Nitro hypervisor](https://aws.amazon.com/ec2/nitro/), which primarily provides CPU and memory isolation for the EC2 instances.

### Microsoft Azure.

[Microsoft Azure](https://azure.microsoft.com/en-us/) opened its services in 2008. Today Azure is one of the dominant cloud market leaders, and it competes with AWS and GCP for the cloud computing market share. Recently, Microsoft launched Azure Stack, which allows you to deploy some cloud services within your data center. Microsoft Hyper-V is powering Azure and Azure stack solutions.

### Google Cloud Platform, GCP.

[Google Cloud Platform](https://cloud.google.com/gcp/) started providing cloud computing services in 2008, and they are competing for market share with AWS and Azure. GCP has an impressive list of features allowing them to be in a very competitive state in certain areas.

GCP chosen KVM as a primary hypervisor for their cloud platform. Google runs its cloud computing with the conviction that everything and anything can and will run on the public cloud one day. So, they do not offer an on-premise solution.

## Conclusion.

There are many free and commercial hypervisor solutions available for servers and desktop virtualization on the market right now. All of them allow you to run virtual machines or operating systems without purchasing new equipment.

We hope this article was helpful to you. If yes, please, help us to spread it to the world.
