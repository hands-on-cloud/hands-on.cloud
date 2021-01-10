---
title: 'The Most Useful [Docker] Commands Everybody Should Know About [Examples]'
date: '2020-11-05'
image: 'The-Most-Useful-Docker-Commands-Everybody-Should-Know-About'
tags:
  - docker
  - volume
  - image
categories:
  - AWS
authors:
  - Andrei Maksimov
  - Hitesh Jethva
---

This tutorial covers the most often used Docker commands. We’re starting a brief Docker overview, then jumping to the installation of Docker to your server. Next, we’ll walk you through all required commands for managing Docker containers, images, and volumes. Become a professional Docker user by following this guide in 10 minutes.

## What is Docker.

{{< my-picture name="What is Docker" >}}

_Docker_ is an open platform for developing, shipping, and running applications. It is the standard de facto for packaging and sharing apps - from desktop to the cloud.

To achieve its goal, Docker is using containers.

The container has the following characteristics:

* A container is a package for the software and all required libraries.
* As soon as is launched, a container determines a runtime environment for your application.
* A container is lighter than a virtual machine, so that it can be launched way faster.
* A container is distributed in the form of an image, which consists of multiple layers. Multiple containers can reuse these layers.

The features above allow you to:

* Build isolated environments for deploying.
* Launch your applications in minutes.

Docker helps you to simplify and automate every step of the software development process.

Here are the essential Docker features:

* Docker has a giant community.
* Docker is a simple and lightweight way of distributing software.
* Docker has a giant public repository of containers for all possible purposes.
* Docker lowers dev and ops costs.
* Docker configuration is straightforward and quick.
* Docker provides application isolation.
* Docker image has layers, which has version control.
* Docker automates every step of container management.

You can install Docker on Linux, macOS, and Windows operating systems.

## Install Docker.

This section describes how to install the Docker CE (community edition) package on Linux operating system.

If you’re using the AWS cloud, I suggest an article about [Docker’s automatic installation to the EC2 instance using CloudFormation](https://hands-on.cloud/cloudformation-tutorial-how-to-automate-ec2-instance-in-5-mins/).

### Install Docker on Ubuntu/Debian.

{{< my-picture name="Docker Ubuntu" >}}

By default, Ubuntu or Debian default repository does not contain the latest version of the Docker CE package. So you will need to add the Docker CE official repository in your system.

Before adding the repository, install some required dependencies by running the following command:

```sh
apt-get install apt-transport-https ca-certificates curl software-properties-common curl -y
```

After installing all dependencies, import the Docker GPG key using the following command;

```sh
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
```

Next, add the Docker CE official repsoitory to the APT source file with the following command:

```sh
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu  $(lsb_release -cs)  stable"
```

Once the repository has been added, you will need to update the repository cache. You can update it with the following command:

```sh
apt-get update -y
```

Once your repository is up-to-date, run the following command to install the latest version of Docker CE to your system.

```sh
apt-get install docker-ce -y
```

The above command will install the Docker CE package in your system and start the service automatically.

You can verify the installed version of Docker CE by running the following command:

```sh
docker --version
```

You should see the Docker Version in the following output:

```txt
Docker version 19.03.13, build 4484c46d9d
```

If you want to remove the Docker package from your system, run the following command:

```sh
apt-get remove docker-ce
```

### Install Docker on CentOS/RHEL.

{{< my-picture name="Docker Centos" >}}

For CentOS or RHEL operating system, you will need to install the Docker CE repo in your system. You can use the DNF command to add and enable the Docker CE repository as shown below:

```sh
dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
```

Once the Docker CE repository has been added, you can list all available version of Docker CE by running the following command:

```sh
dnf list docker-ce --showduplicates | sort -r
```

You should get the complete list in the following output:

```sh
docker-ce.x86_64                3:19.03.13-3.el8                docker-ce-stable
Docker CE Stable - x86_64                        54 kB/s | 3.8 kB     00:00
CentOS-8 - Extras                                14 kB/s | 8.1 kB     00:00
CentOS-8 - Base                                 4.6 MB/s | 2.2 MB     00:00
CentOS-8 - AppStream                            4.7 MB/s | 5.8 MB     00:01
Available Packages
```

Next, install the latest version of Docker CE by running the following command:

```sh
dnf install docker-ce --nobest
```

Once the Docker is installed, verify the installed version with the following command:

```sh
docker --version
```

You should get the following output:

```txt
Docker version 19.03.13, build 4484c46d9d
```

To start the Docker service, run the following command:

```sh
systemctl start docker
```

To stop the Docker service, run the following command:

```sh
systemctl stop docker
```

You can also run the following command to display more information of Docker:

```sh
docker info
```

You should see the following output:

{{< my-picture name="docker info - command" >}}

If you want to remove the Docker package from your system, run the following command:

```sh
dnf remove docker-ce
```

## Managing Containers With Docker.

The `docker container` command is used to manage the container lifecycle. If you do not have the image to run the container from, the Docker will go to the registry, download it.

### Run Docker Container.

Use the following syntax to download the image from the Docker registry and create a container.

```sh
docker container run [your-image-name]
```

For example, run the following command to create an Apache webserver container:

```sh
docker container run httpd
```

You should get the following output:

{{< my-picture name="docker container run httpd - command" >}}

You can use the option `--rm` with Docker run command to removes a container after it exits.

```sh
docker container run --rm httpd
```

### Connect To Docker Container Shell.

You can use the option `-it` with Docker run command to create and start the Apache container, and attach to the interactive bash shell.

```sh
docker container run -it httpd /bin/bash
```

You should get the following output:

{{< my-picture name="docker container run bash - command" >}}

### Launch Docker Container In The Background.

You can now run any command inside the container.

You can use the option `-td` with the Docker run command to create and start the Apache container and keep it running.

```sh
docker container run -td httpd
```

You should get the following output:

{{< my-picture name="docker container run background - command" >}}

### Set Up Docker Container Name.

You can use the option `--name` with Docker run command to assign a container name using the following syntax:

```sh
docker container run --name [container-name] -td [image-name]
```

For example, create a new container from the Apache image and assign a name **apacheweb** with the following command:

```sh
docker container run --name apacheweb -td httpd
```

### Bind Docker Container On The Specific Port.

If you want to access the external machine’s container process, you can expose a container port to the external network.

In this case, you can use the option `-p` with the Docker command to expose the specific port as shown below:

```sh
docker container run -p [host-port]:[container-port] --name [container-name] -dit [image-name]
```

For example, create an apache web server container and expose the container port **80** to the port **8080** with the following command:

```sh
docker container run -p 8080:80 --name apacheweb -dt httpd
```

You can now access the apache webserver running inside the container using the URL **http://localhost:8080**.

### List All Docker Containers.

To list all running and stopped container in your system, run the following command:

```sh
docker ps -a
```

You should see all containers in the following output:

{{< my-picture name="docker container run bind port - command" >}}

To list only running container in your system, run the following command:

```sh
docker ps
```

You can also list the container with the following command:

```sh
docker container ls
```

{{< my-picture name="docker container ls - command" >}}

### Display Docker Container Stats.

To display the live statistics of the running container (CPU and memory utilization, network and disk I/O) named **apacheweb**, run the following command:

```sh
docker stats apacheweb
```

You should see the following output:

{{< my-picture name="docker stats - command" >}}

### Display All Docker Container Processes.

To list all running processes inside the running container named **apacheweb**, run the following command:

```sh
docker top apacheweb
```

You should see the following output:

{{< my-picture name="docker top - command" >}}

### Display Docker Container Logs.

To display the logs of the running container named **apacheweb**, run the following command:

```sh
docker logs apacheweb
```

You should see the following output:

{{< my-picture name="docker logs - command" >}}

### Start, Stop, And Pause Docker Container.

To stop the running container named **apacheweb**, run the following command:

```sh
docker container stop apacheweb
```

To start the container named **apacheweb**, run the following command:

```sh
docker container start apacheweb
```

To pause the container named **apacheweb**, run the following command:

```sh
docker container pause apacheweb
```

### Restart Or Kill Docker Container.

To restart the running container named **apacheweb**, run the following command:

```sh
docker container restart apacheweb
```

To kill the running container named **apacheweb**, run the following command:

```sh
docker container kill apacheweb
```

### Attach To Already Running Docker Container.

To connect to the running container, run the following command:

```sh
docker container exec -it apacheweb /bin/bash
```

{{< my-picture name="docker container exec - command" >}}

To run any command inside the running container, run the following command:

```sh
docker container exec -it apacheweb ls
```

{{< my-picture name="docker container exec with output - command" >}}

## Managing Docker Images.

In this section, we will show you some most commonly used commands to manage the Docker image.

### Download Docker Image From The Registry.

To download or pull the image from the Docker registry, use the following syntax:

```sh
docker pull [image-name]
```

For, example, you can pull the Nginx webserver image from the Docker registry with the following command:

```sh
docker pull nginx
```

You should get the following output:

{{< my-picture name="docker pull - command" >}}

### Upload Docker Image To The Registry.

If you want to upload an existing image to the Docker registry, use the following syntax:

```sh
docker push [image-name]
```

**Login to Docker The Registry**.

First, you will need to login into the Docker registry with the following command:

```sh
docker login
```

Once login, run the following command to get the id of the Nginx image and tag the image with the following command:

```sh
docker images
```

Output:

```sh
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx               latest              f35646e83998        3 weeks ago         133MB
httpd               latest              3dd970e6b110        3 weeks ago         138MB
```

**Add Tag To Docker Image**.

Next, tag the image with the following command:

```sh
docker tag f35646e83998 amaksimov/nginx
```

Where:

* `f35646e83998` is the image id, **amaksimov** is the Docker registry name and **nginx** is the name of the image.

Next, push the Nginx image to the Docker registry with the following command:

```sh
docker push amaksimov/nginx
```

You should see the following output:

{{< my-picture name="docker tag push - command" >}}

### Create Docker Image From Running Container.

You can also create an image from an existing container using the following syntax:

```sh
docker commit [container-name] [new-image-name]
```

For example, create an image from the Apache container, run the following command:

```sh
docker commit apacheweb apache-image
```

To save your existing image to the tar archive by running the following command:

```sh
docker save apache-image > apache-image.tar
```

{{< my-picture name="docker save image - command" >}}

### History Of The Docker Image.

You can print the history of any Docker image with the following command:

```sh
docker history apache-image
```

You should get the following output:

{{< my-picture name="docker history - command" >}}

### Delete Docker Image.

You can remove any Docker image using the following syntax:

```sh
docker rmi [image-name]
```

For example, if you want to remove the Apache image, you will need to stop the container that is using the httpd image:

```sh
docker container stop apacheweb
docker rm apacheweb
```

First, we need to delete **apache-image** image:

```sh
docker rmi apache-image
```

Only afterwards, we remove the **httpd** image with the following command:

```sh
docker rmi httpd
```

Through the time, manually created images and containers may bring some mess to your server. Take a look to our [Docker FAQ](#docker-faq) to find out how to cleanup everything.

## Managing Docker Volumes.

When you create a new container, store some data and delete the container then data will be lost. In this case, you can create a volume on the host system and start a container using this volume. After deleting the container, you can retrieve the data from the volume. You can also use Docker volume to share the data between multiple containers.

In this section, we will some most commonly use `docker volume` commands with examples.

### Create Docker Volume.

To create a new volume named **datavolume** with the following command:

```sh
docker volume create datavolume
```

### List all Docker Volumes.

To list your created volume, run the following command:

```sh
docker volume ls
```

You should see the following output:

{{< my-picture name="docker volume ls - command" >}}

### Print Docker Volume Information.

To print more information about volume, run the following command:

```sh
docker inspect datavolume
```

You should see the following output:

{{< my-picture name="docker inspect volume - command" >}}

### Mount Volume To Docker Container.

To create a new container named apacheweb and mount the datavolume on the host system to the /mnt directory to the container, run the following command:

```sh
docker run -it --name apacheweb1  --mount source=datavolume,destination=/mnt -td httpd
```

### Remote Docker Volume.

To remove the volume, run the following command:

```sh
docker volume rm datavolume
```

## Docker FAQ.

### How to delete unused Docker Images.

To delete all unused docker images, you need to run the following command:

```sh
docker rmi $(docker images -a -q)
```

### How to remove all exited Docker containers.

All exited Docker containers could be removed by running the following command:

```sh
docker rm $(docker ps -a -f status=exited -q)
```

### How To Stop And Remove All Docker Containers.

To stop all Docker containers, you need to run:

```sh
docker stop $(docker ps -a -q)
```

To delete all stopped Docker containers, you need to run:

```sh
docker rm $(docker ps -a -q)
```

### How to delete all unused Docker Images, Containers, Volumes, Networks.

To delete all unused Docker resources, you may use the following command:

```sh
docker system prune
```

To delete all Docker resources completely (used and unused), run the following command:

```sh
docker system prune -a
```

## Conclusion.

In the above guide, you learned about the most commonly used Docker commands and its usage with examples. I hope this will help you to perform day-to-day tasks.
