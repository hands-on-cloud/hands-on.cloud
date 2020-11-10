---
title: 'Quick And Simple Introduction to [Kubernetes] [Helm] Charts in 10 minutes'
date: '2020-11-09'
image: 'Quick And Simple Introduction to Kubernetes Helm Charts in 10 minutes'
tags:
  - kubernetes
  - k8s
  - helm
  - docker
categories:
  - AWS
authors:
  - Andrei Maksimov
---

This article will walk you through the Helm installation process and basic usage scenarios. We’ll briefly walk you through the process of packaging the Kubernetes application to a Helm chart.

Kubernetes is an excellent platform for running your container applications, but it lacks application state descriptions using manifest files. Luckily for us, the Kubernetes community developed a fantastic tool, which allows us to stop struggling with writing manifests and concentrate on the application deployment process.

The perfect tool name is [Helm](https://helm.sh/). Helm for Kubernetes is the same thing as Docker for containers. It gives you the ability to deploy a complete application with a single command.

The workflow is simple. You type the command to deploy an application (the chart), and Helm does the rest:

* It goes to the chart repository.
* It downloads the chart (zip archive with application deployment manifests).
* It deploys downloaded manifests to Kubernetes.  

What applications can I deploy using Helm? There are thousands of them available for you for free at the public Helm repository. Go to [Artifact.io](https://artifacthub.io/) to check them out!

## What is Helm

Helm is the application manager, which helps to manage Kubernetes applications. Helm allows you to define, install, and upgrade even the most complex Kubernetes applications. Helm for Kubernetes is like `yum` for CentOS or `apt` for Ubuntu.

## Why Helm

Helm provides three significant benefits to the process of service deployments to the Kubernetes platform:

* **Deployment speed** - you can deploy any application available at Helm chart repository within a single command.
* **Prebuilt application configurations** - Helm allows you to install community-supported applications with ease.
* **Easy rollbacks** - Helm allows you to easily rollback your application deployment to the previous version if something went wrong.

At the same time, [Helm maybe not the best choice](https://winderresearch.com/7-reasons-why-you-shouldnt-use-helm-in-production/) for application deployments with specific requirements.

## Installing Helm

Installing Helm on your system is an easy task.

### Install Helm On Ubuntu, CentOS, And macOS

Here are the commands to install Helm for non-Windows users:

```sh
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

### Install Helm On Windows

To install Helm on your Windows operating system, you need to use [Chocolatey](https://chocolatey.org/):

```sh
choco install kubernetes-helm
```

For other installation methods, please check out [Helm installation instructions](https://helm.sh/docs/intro/install/) from the official documentation.

To verify the helm installation execute the following command:

```sh
helm version
```

Here’s the correct output:

{{< my-picture name="helm version - command" >}}

## Deploying Helm Charts

Let’s take a look at how to install applications using the Helm. But before that, it is worth to take a look at the chart structure to understand what’s happening in the background.

### Helm Chart Structure

Every application in the Helm world is ready for distribution in a form of package. This package is called the Helm chart.

This chart is a bundle of **YAML** files. Let’s take a look at Helm [charts-repo-actions-demo](https://github.com/helm/charts-repo-actions-demo/tree/master/charts/example-v2) repository example:

```sh
git clone https://github.com/helm/charts-repo-actions-demo
cd charts-repo-actions-demo/charts/example-v2
tree
```

{{< my-picture name="Helm chart structure" >}}

Here are the most important elements:

* The `templates/` directory is for Kubernetes app deployment template files.
* The `values.yaml` file is storage of default values for your template variables to templates.
* The `Chart.yaml` file contains a description of the chart.

### Add Repository To Helm

Helm helps you to construct your application using its charts as building blocks.

But before searching or downloading Helm charts for your application, you have to update the list of repositories.

Helm repository is the place where the charts are stored. It is like a DockerHub for Docker containers.

There can be two types of repositories:

* Public repository
* Private repository

By default, there are no repositories present in your local helm configuration. To add the repository execute the following command:

```sh
helm repo add stable https://charts.helm.sh/stable
```

In this command:

* `stable` is the repository name
* `https://charts.helm.sh/stable` is the location of the charts

To list all available repositories, run the below command:

```sh
helm repo list
```

{{< my-picture name="helm repo list - command" >}}

Now, for the purpose of the demo, let’s add [bitnami/charts](https://github.com/bitnami/charts) too. Bitnami maintains a very decent amount of open source packages.

{{< my-picture name="Bitnami Helm Charts" >}}

To add the Bitnami charts repo run the below command:

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
```

### Searching Applications In Helm Repository

To search charts for the application you need, type the following command:

```sh
helm search repo <application>
```

### Download Helm Chart

To download the chart for the particular application, execute another command:

```sh
helm pull <chart-name>
```

In our example, we are going to install WordPress using the Helm chart, which is available in the Bitnami repo:

```sh
helm pull bitnami/wordpress
```

To get the chart README, execute the following command:

```sh
helm inspect readme bitnami/wordpress
```

{{< my-picture name="helm inspect readme - command" >}}

To view the complete content of the chart, run the command:

```sh
helm inspect all bitnami/wordpress | less
```

### Install Helm Chart

Now, let's install WordPress by typing the following command:

```sh
helm install wordpress bitnami/wordpress --set service.type=NodePort
```

I'm using `--set service.type=NodePort` in the command to change Kubernetes service type, as I'm executing my examples at minikube and not at the real cluster.

{{< my-picture name="helm install wordpress - command" >}}

To verify that WordPress has been successfully deployed, let’s run:

```sh
helm ls
```

Here’s the expected output:

{{< my-picture name="helm ls - command" >}}

As you can see, the WordPress application has been successfully deployed.

### Get Information About Helm Deployment

To see the resources created by the helm chart, use the following command:

```sh
kubectl get all
```

Here’s the expected output:

{{< my-picture name="kubectl get all - command" >}}

In addition to CLI tools especially for beginners it is worth to use [Lens](https://github.com/lensapp/lens) to manage your Kubernetes clusters:  

{{< my-picture name="Kubernetes Lens" >}}

Click on `wordpress` container and the link to port 80 to get access to the WordPress service:

{{< my-picture name="Kubernetes Lens - WordPress" >}}

Open the URL in the browser of your choice to access the application

{{< my-picture name="Kubernetes - Default WordPress page" >}}

Now, you can see that Helm helped us to deploy WordPress in less than 5 minutes.

### Delete Helm Deployment

To stop and delete the deployed WordPress, run the following command:

```sh
helm delete wordpress
```

To verify that the chart has been deleted, execute:

```sh
helm ls
```

Here’s an expected outcome:

{{< my-picture name="helm ls - command after cleanup" >}}

## Summary

I hope, you found this article useful. If yes, please, help us spread it to the world. If you still have any questions, please, feel free to ask them in the comments section below.
