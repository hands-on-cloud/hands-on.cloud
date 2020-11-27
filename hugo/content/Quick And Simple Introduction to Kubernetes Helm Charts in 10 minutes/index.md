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

## What is Helm.

Helm is the application manager, which helps to manage Kubernetes applications. Helm allows you to define, install, and upgrade even the most complex Kubernetes applications. Helm for Kubernetes is like `yum` for CentOS or `apt` for Ubuntu.

Here’s Helm workflow visualization:

{{< my-picture name="Quick And Simple Introduction to Kubernetes Helm Charts in 10 minutes-Helm Workflow" >}}

## Why Helm.

Helm provides three significant benefits to the process of service deployments to the Kubernetes platform:

* **Deployment speed** - you can deploy any application available at Helm chart repository within a single command.
* **Prebuilt application configurations** - Helm allows you to install community-supported applications with ease.
* **Easy rollbacks** - Helm allows you to easily rollback your application deployment to the previous version if something went wrong.

At the same time, [Helm maybe not the best choice](https://winderresearch.com/7-reasons-why-you-shouldnt-use-helm-in-production/) for application deployments with specific requirements.

## Installing Helm.

Installing Helm on your system is an easy task.

### Install Helm On Ubuntu, CentOS, And macOS.

Here are the commands to install Helm for non-Windows users:

```sh
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

### Install Helm On Windows.

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

## Deploying Helm Charts.

Let’s take a look at how to install applications using the Helm. But before that, it is worth to take a look at the chart structure to understand what’s happening behind the scenes.

### Helm Chart Structure.

Every application in the Helm world is ready for distribution in the form of a package. This package is called the Helm chart.

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

### Add Repository To Helm.

Helm helps you to construct your application using its charts as building blocks.

But before searching or downloading Helm charts for your application, you have to update the repositories list.

Helm repository is the place where the charts are stored. It is like a DockerHub for Docker containers.

There can be two types of repositories:

* Public repository.
* Private repository.

By default, there are no repositories present in your local helm configuration. To add the repository, execute the following command:

```sh
helm repo add stable https://charts.helm.sh/stable
```

Here:

* **stable** is the repository name.
* **https://charts.helm.sh/stable** is the location of the charts.

To list all available repositories, run the below command:

```sh
helm repo list
```

{{< my-picture name="helm repo list - command" >}}

Now, for the demo, let’s add [bitnami/charts](https://github.com/bitnami/charts) too. Bitnami maintains a very decent amount of open source packages.

{{< my-picture name="Bitnami Helm Charts" >}}

To add the Bitnami charts repo run the below command:

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
```

### Searching Applications In Helm Repository.

To search charts for the application you need, type the following command:

```sh
helm search repo <application>
```

### Download Helm Chart.

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

### Install Helm Chart.

Now, let's install WordPress by typing the following command:

```sh
helm install wordpress bitnami/wordpress --set service.type=NodePort
```

I'm using **--set service.type=NodePort** in the command to change Kubernetes service type, as I'm executing my examples at minikube and not at the real cluster.

{{< my-picture name="helm install wordpress - command" >}}

To verify that WordPress has been successfully deployed, let’s run:

```sh
helm ls
```

Here’s the expected output:

{{< my-picture name="helm ls - command" >}}

As you can see, the WordPress application has been successfully deployed.

### Get Information About Helm Deployment.

To see the resources created by the helm chart, use the following command:

```sh
kubectl get all
```

Here’s the expected output:

{{< my-picture name="kubectl get all - command" >}}

In addition to CLI tools, especially for beginners, it is worth to use [Lens](https://github.com/lensapp/lens) to manage your Kubernetes clusters:

{{< my-picture name="Kubernetes Lens" >}}

Click on **wordpress** container and the link to port 80 to get access to the WordPress service:

{{< my-picture name="Kubernetes Lens - WordPress" >}}

Open the URL in the browser of your choice to access the application

{{< my-picture name="Kubernetes - Default WordPress page" >}}

Now, you can see that Helm helped us to deploy WordPress in less than 5 minutes.

### Delete Helm Deployment.

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

## Creating Helm chart.

In the previous section, we deployed an already existing Helm chart. It was a very simple example to give you a taste of technology.

Now, let’s try to make it more real-life and create our custom chart. In our article "[How to build Anaconda Python Data Science Docker container](https://hands-on.cloud/how-to-build-python-data-science-docker-container-based-on-anaconda/)" we created Docker containers for Machine Learning tasks.

Let’s build a Helm chart to deploy this container to Kubernetes. All the sources available at out [GitHub repository](https://github.com/hands-on-cloud/hands-on.cloud/tree/master/hugo/content/Quick%20And%20Simple%20Introduction%20to%20Kubernetes%20Helm%20Charts%20in%2010%20minutes/src/).

### Helm Chart Template Structure.

Helm allows us to create a templated structure for our future chart by running:

```sh
helm create python_data_science
```

Here’s the created folder structure:

```sh
tree python_data_science
```

{{< my-picture name="helm chart python_for_data_science structure" >}}

* **charts** - in this folder, we specify the separately managed dependencies for the application. For example, if the application uses the database, we can declare as a separate chart in this folder.
* **Charts.yaml**: here, we need to specify our chart’s details like name, version, or description.
* **templates** - under this folder, we create templated Kubernetes deployment manifests that are going to be used for your application. You can parameterize those templates. During the deployment, Helm will take parameters values from the **values.yaml** file, populate the templates and produce the final manifests for deployment to the cluster.
* **tests** - under this folder, we can create the tests for our charts, for example, to test the integration between our charts.
* **values.yaml** - in this file, we can specify the default values for variable we’re using in the charts.

### Porting Docker Container To Helm.

Delete the following files from the **templates** folder:

* **hpa.yaml**.
* **ingress.yaml**.
* **NOTES.txt**.
* **serviceaccount.yaml**.

Here’s what you should stay with:

{{< my-picture name="helm chart template - step 1" >}}

We’ll go with a simple service for this demo, which consists of Kubernetes Service and Kubernetes Deployment.

Here’s the content for Kubernetes Service (**templates/service.yaml**):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: python-data-science-notebook
  labels:
    app: python-data-science-notebook
spec:
  type: {{ .Values.service.type }}
  selector:
    app: python-data-science-notebook
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8888
      nodePort: 30036
```

Now, we can make a Kubernetes Deployment declaration (**templates/deploymnet.yaml**):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-data-science-notebook
  labels:
    app: python-data-science-notebook
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: python-data-science-notebook
  template:
    metadata:
      labels:
        app: python-data-science-notebook
    spec:
      containers:
        - name: python-data-science-container
          image: {{ .Values.image.name }}  
          ports:
            - containerPort: 8888
```

Finally, we need to declare the default values for our template parameters (**values.yaml**):

```yaml
replicaCount: 1

image:
  name: amaksimov/python_data_science
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: NodePort
  port: 80
```

The values from the **values.yaml** will be rendered into the templates in the templates folder during Helm installation.

Now type the below command in the terminal to install the chart:

```sh
helm install python-data-science-notebook python_data_science/
```

To see the resources created by the chart, execute the following command, or use Lens 😎:

{{< my-picture name="helm install python-data-science-notebook - command" >}}

```sh
kubectl get all
```

Here’s an expected output:

{{< my-picture name="kubectl get all - after python-data-science-notebook deployment command" >}}

Type the command below to get Kubernetes Service IP and port to connect to the application:

```sh
export NODE_IP=$(kubectl get nodes --namespace default -o jsonpath="{.items[0].status.addresses[0].address}") && echo " URL: http://$NODE_IP:30036"
```

Here’s our Machine Learning Jupyter Notebook up and running at Kubernetes:

{{< my-picture name="Machine Learning Jupyter Notebook launched in Kubernetes using Helm" >}}

### Upgrading Helm Chart.

Now, what you should do to change something in your application? Let's say you want to increase the number of pods in the nodes by changing the replica set.

You can do it using a single command too.

Make the required changes in your Helm chart and run the following command to upgrade it:

```sh
helm upgrade python-data-science-notebook python_data_science/
```

Helm will immediately tell you that the revision of your deployed application increased:

{{< my-picture name="helm upgrade python-data-science-notebook - command" >}}

Now you can see that the revision of the app is now **2**.

### Rollback Helm upgrade.

Sometimes you may find that new rolled out changes breaking the application. In this case, you can rollback to the old version and revert the application changes.

To do that, type the following command:

```sh
helm rollback python-data-science-notebook 1
```

Where:

* **python-data-science-notebook** is the application name.
* **1** is the previous version number.

Yes, so simple!

{{< my-picture name="helm rollback python-data-science-notebook - command" >}}

### Delete Helm Application.

To clean up the deployment and delete the application, run the following command:

```sh
helm uninstall python-data-science-notebook
```

## Summary.

This article covered the beginner’s introduction to the Helm, covered its installation process, and its most commonly used commands. You also learned how to create the Helm chart for your application. If yes, please, help us spread it to the world.

I hope you found this article useful. If you still have any questions, please, feel free to ask them in the comments section below.
