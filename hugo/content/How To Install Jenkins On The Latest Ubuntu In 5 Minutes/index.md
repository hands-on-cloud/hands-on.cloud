---
title: 'How to Install Jenkins on the Latest Ubuntu in 5 Minutes'
date: 2020-11-26T09:27:45-05:00
image: 'How-to-Install-Jenkins-on-the-Latest-Ubuntu-in-5-Minutes'
tags:
  - linux
  - ubuntu
categories:
  - Linux
authors:
  - Andrei Maksimov
---

This article covers various ways of deploying Jenkins on your server. Use our up-to-date guide for manual installation or launching Jenkins in Docker containers. As a bonus, we'll show how to deploy Jenkins using CloudFormation. Deploy Jenkins on your server in 5 minutes using our guidance.

## What is Jenkins.

{{< my-picture name="Jenkins-What-is-Jenkins" >}}

[Jenkins](https://www.jenkins.io/) is the most popular free automation server. You can use Jenkins to automate almost any processes in your company. But the traditional market for Jenkins is the automation of the software development processes.

Jenkins helps developers to integrate code changes and always produce stable software build.

Jenkins is written in Java, and thus you can run it on all platforms. Jenkins has lots of plugins too, which can help you solve almost any problem you can imagine.

## Jenkins Manual Installation.

{{< my-picture name="Jenkins-Manual-Installation" >}}

Jenkins installation process is simple and straightforward. It consists of several easy steps:

* Java installation.
* Adding official Jenkins repositories to your package manager.
* Package installation.
* Firewall configuration.
* Initial Jenkins configuration.

Let’s do them one by one.

### Java installation.

To be able to run Jenkins, you need to install Java first.

First, update the apt package index using this:

```sh
sudo apt update
```

Next, install the default Java OpenJDK package using this:

```sh
sudo apt install openjdk-8-jre
```

Verify the installation using this command:

```sh
java -version
```

Here’s the output after successful installation:

{{< my-picture name="Jenkins-Ubuntu-java-installation" >}}

**Important**: you should see that Java has version 1.8.

By the time of this article writing, Jenkins is using the Java 8 version. If you see another version, switch to the correct one:

```sh
sudo update-alternatives --config java
```

### Add Jenkins repository.

By default, Jenkins is not included in the Ubuntu repositories, and you need to add it.

First, we need to import the repository key:

```sh
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
```

Next step is to append the repository address to the server’s repositories list:

```sh
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > \
    /etc/apt/sources.list.d/jenkins.list'
```

Once that is done, we need to update the information about the software, which we can use from the new repository:

```sh
sudo apt-get update
```

{{< my-picture name="Jenkins-Ubuntu-repository" >}}

### Jenkins Package Installation.

Since we have the repository up to date, let's run the following command to install Jenkins:

```sh
sudo apt-get -y install jenkins
```

Running this command will prompt you to confirm the download and installation.

By default, Jenkins runs after installing it, but you can also start it using this command:

```sh
sudo systemctl start jenkins
```

Let check if Jenkins was installed successfully using this command:

```sh
sudo systemctl status jenkins
```

On successful execution of the above command, you should get such an output:

{{< my-picture name="Jenkins-Ubuntu-systemctl-status" >}}

## Firewall Configuration.

{{< my-picture name="Jenkins-Firewall-Configuration" >}}

By default, Jenkins runs on port **8080**, so let's open it to allow Jenkins to communicate.

Run the following command if you are running on the default UFW firewall:

```sh
sudo ufw allow 8080
```

Use the following command to check that traffic is now allowed:

```sh
sudo ufw status
```

The output of the above command should look like this:

{{< my-picture name="Jenkins-Ubuntu-ufw-status" >}}

If ufw is inactive and you want to enable it, here are the commands:

```sh
sudo systemctl enable ufw
sudo systemctl start ufw
sudo ufw enable
```

Now, you can access Jenkins at [http://localhost:8080](http://localhost:8080).

Initial password is available here:

```sh
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

## Launch Jenkins In Docker Container.

{{< my-picture name="Jenkins-Launch-Jenkins-In-Docker-Container" >}}

To launch Jenkins in a Docker container, you need to have Docker installed. The complete installation process is described in the [Docker official documentation](https://docs.docker.com/engine/install/ubuntu/), so we’ll provide the necessary commands here:

```sh
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

Once Docker is successfully installed, you can run the Jenkins Docker container.

### Pull Jenkins Docker Image.

Pull the Jenkins from the public repo using the following command:

```sh
sudo docker pull jenkins/jenkins
```

{{< my-picture name="Jenkins-Ubuntu-Docker-image-pull" >}}

To launch the Jenkins Docker container, run the following command:

```sh
sudo docker run -p 8080:8080 -d --name=jenkins-master jenkins/jenkins
```

If you’re getting the following error message:

```sh
docker: Error response from daemon: driver failed programming external connectivity on endpoint jenkins-master
(627574f0c75a8e4598abf0acfc2700caf53775a9dc34073fdbfb69cd408a9a36):
Error starting userland proxy: listen tcp 0.0.0.0:8080: bind: address already in use.
ERRO[0000] error waiting for container: context canceled
```

That means you’re trying to launch Jenkins in the Docker container on the same port as the system-wide Jenkins installed.

Just launch it on port **8082**:

```sh
sudo docker rm jenkins-master

sudo docker run -p 8082:8080 -d --name=jenkins-master jenkins/jenkins
```

This command results to opening the Jenkins docker container on port **8082**:

{{< my-picture name="Jenkins-Ubuntu-Configuration-Step-1" >}}

## Initial Jenkins Configuration.

To configure Jenkins, open a browser and navigate to the actual IP address or domain name you are running Jenkins:

```sh
http://ip_address_or_domain:8080
```

### Initial Jenkins Password.

You will see the page showing the location of the initial Jenkins password:

{{< my-picture name="Jenkins-Ubuntu-Configuration-Step-2" >}}

Here it is:

```sh
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Initial Jenkins Plugins.

At the next screen, you will be required to choose plugins for initial installation. If you do not know which plugins to set up yet, use the “**Install suggested plugins**” option.

{{< my-picture name="Jenkins-Ubuntu-Configuration-Step-3" >}}

### Initial Jenkins Admin User.

Once the installation is completed, you will be asked to create the first Jenkins admin user.

{{< my-picture name="Jenkins-Ubuntu-Configuration-Step-4" >}}

After successfully entering the user details, you will be directed to the instance configuration page to confirm the URL for the Jenkins instance.

To access the Jenkins main dashboard, click the “**Start using Jenkins**” button. This action will bring you to the main Jenkins interface:

{{< my-picture name="Jenkins-Ubuntu-Configuration-Step-5" >}}

## Install Jenkins using CloudFormation.

{{< my-picture name="Jenkins-Install-using-CloudFormation" >}}

The article “[CloudFormation Tutorial - How To Automate EC2 Instance In 5 Mins](https://hands-on.cloud/cloudformation-tutorial-how-to-automate-ec2-instance-in-5-mins/)” described how to use CloudFormation and cloud-init metadata to automate software installation in EC2 instances.

Here we’ll provide a template, which will install the Jenkins server behind the Nginx proxy server.

**Attention**: the following CloudFormation template will create a publicly accessible Jenkins server, which has unlimited access to your AWS Account. If you’d like to restrict Jenkins access, please, modify JenkinsPolicy or remote instance profile from the Jenkins server.

Here’s the CloudFormation template ([GitHub sources](https://github.com/hands-on-cloud/hands-on.cloud/tree/master/hugo/content/How%20To%20Install%20Jenkins%20On%20The%20Latest%20Ubuntu%20In%205%20Minutes/src)):

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: >-
    This CloudFormation stack will deploy Jenkins on Ubuntu 20.04
    in us-east-1 region.
Parameters:
    JenkinsInstanceType:
        Description: EC2 instance type for Jenkins EC2 instance
        Type: String
        Default: t2.small
        ConstraintDescription: must be a valid Jenkins EC2 instance type.
    KeyName:
        Description: >-
            The EC2 Key Pair to allow SSH access to Jenkins EC2 instance
        Type: 'AWS::EC2::KeyPair::KeyName'
        ConstraintDescription: must be the name of an existing EC2 KeyPair.
    VpcId:
        Description: The VPC Id where the Jenkins EC2 instance will be launched.
        Type: 'AWS::EC2::VPC::Id'
        ConstraintDescription: must be the ID of an existing VPC.
    YourIPRange:
        Description: >-
            CIDR block of the network from where you will connect to the Jenkins
            server using HTTP, HTTPS and SSH
        Type: String
        MinLength: '9'
        MaxLength: '18'
        AllowedPattern: '(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/(\d{1,2})'
        Default: 0.0.0.0/0
        ConstraintDescription: must be a valid IP CIDR range of the form x.x.x.x/x.
    PublicSubnet1:
        Description: >-
            The public subnet where the Jenkins Jenkins EC2 instance will be launched.
        Type: 'AWS::EC2::Subnet::Id'
        ConstraintDescription: Must be a valid Public VPC Subnet.
    JenkinsInstanceAMI:
        Description: Ubuntu 20.04 EC2 instance AMI
        Type: String
        Default: ami-0885b1f6bd170450c

Resources:
    JenkinsAddress:
        Type: AWS::EC2::EIP
        Properties:
            Domain: vpc
    JenkinsAddressAssociaation:
        Type: AWS::EC2::EIPAssociation
        Properties:
            AllocationId: !GetAtt JenkinsAddress.AllocationId
            NetworkInterfaceId: !Ref JenkinsInterface
    JenkinsInterface:
        Type: AWS::EC2::NetworkInterface
        Properties:
            SubnetId: !Ref PublicSubnet1
            Description: Interface for controlling traffic such as Web
            GroupSet: 
                - !Ref JenkinsSecurityGroup
            SourceDestCheck: true
            Tags:
                -
                    Key: Network
                    Value: Web
    JenkinsServer:
        Type: 'AWS::EC2::Instance'
        CreationPolicy:
           ResourceSignal:
               Timeout: PT15M
        Metadata:
            Comment: 'Install Jenkins, nginx and the Jenkins CodeDeploy plugin'
            'AWS::CloudFormation::Init':
                configSets:
                    install_all:
                        - install_base
                        - install_nginx
                        - install_jenkins_repo
                        - install_jenkins
                        - jenkins_post_install
                install_base:
                    packages:
                        apt:
                            git: []
                            python3-pip: []
                            awscli: []
                    files:
                        /etc/cfn/cfn-hup.conf:
                            content:
                                !Sub |
                                    [main]
                                    stack=${AWS::StackName}
                                    region=${AWS::Region}
                            mode: "000400"
                            owner: "root"
                            group: "root"
                        /etc/cfn/hooks.d/cfn-auto-reloader.conf:
                            content:
                                !Sub |
                                    [cfn-auto-reloader-hook]
                                    triggers=post.update
                                    path=Resources.LaunchConfig.Metadata.AWS::CloudFormation::Init
                                    action=/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource JenkinsServer --configsets install_all --region ${AWS::Region}
                                    runas=root
                            mode: "000400"
                            owner: "root"
                            group: "root"
                        /lib/systemd/system/cfn-hup.service:
                            content:
                                !Sub |
                                    [Unit]
                                    Description=cfn-hup daemon

                                    [Service]
                                    Type=simple
                                    ExecStart=/opt/aws/bin/cfn-hup
                                    Restart=always

                                    [Install]
                                    WantedBy=multi-user.target
                            mode: "000400"
                            owner: "root"
                            group: "root"
                    commands:
                        01_enable_cfn_hup:
                            command: systemctl enable cfn-hup.service > /dev/null 2>&1
                        02_start_cfn_hup:
                            command: systemctl start cfn-hup.service > /dev/null 2>&1

                install_nginx:
                    packages:
                        apt:
                            nginx: []
                            certbot: []
                            python3-certbot-nginx: []
                    files:
                        /etc/nginx/nginx.conf:
                            content:
                                !Sub |
                                    user  www-data;
                                    worker_processes  1;

                                    error_log  /var/log/nginx/error.log;
                                    pid        /var/run/nginx.pid;

                                    events {
                                        worker_connections  1024;
                                    }

                                    http {
                                        include       /etc/nginx/mime.types;
                                        default_type  application/octet-stream;
                                        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                                                            '$status $body_bytes_sent "$http_referer" '
                                                            '"$http_user_agent" "$http_x_forwarded_for"';

                                        access_log  /var/log/nginx/access.log  main;
                                        sendfile        on;
                                        keepalive_timeout  65;
                                        include /etc/nginx/conf.d/*.conf;
                                        index   index.html index.htm;

                                        server {
                                            listen       80;
                                            server_name  _;
                                            location / {
                                                proxy_pass              http://127.0.0.1:8080;
                                                proxy_set_header        Host $host;
                                                proxy_set_header        X-Real-IP $remote_addr;
                                                proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
                                                proxy_connect_timeout   150;
                                                proxy_send_timeout      100;
                                                proxy_read_timeout      100;
                                                proxy_buffers           4 32k;
                                                client_max_body_size    8m;
                                                client_body_buffer_size 128k;
                                            }
                                            location /password.txt {
                                                alias              /web/initalpass.html;
                                            }
                                        }
                                    }
                            mode: '000644'
                            owner: root
                            group: root

                    services:
                        sysvinit:
                            nginx:
                                enabled: 'true'
                                ensureRunning: 'true'
                                files:
                                    - /etc/nginx/nginx.conf

                install_jenkins_repo:
                    commands:
                        01_download_repo_file:
                            command: echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list
                        02_import_repo_file:
                            command: wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | apt-key add - > /dev/null 2>&1
                        03_update_pkg_mngr:
                            command: apt-get update -y > /dev/null 2>&1

                install_jenkins:
                    packages:
                        apt:
                            jenkins: []
                    services:
                        sysvinit:
                            jenkins:
                                enabled: 'true'
                                ensureRunning: 'true'

                jenkins_post_install:
                    commands:
                        01_web_folder:
                            command: mkdir -p /web
                        02_import_repo_file:
                            command: while [ ! -f /var/lib/jenkins/secrets/initialAdminPassword ]; do sleep 10; done
                        03_copy_jenkins_password:
                            command: cp -Rf /var/lib/jenkins/secrets/initialAdminPassword /web/initalpass.html && chown www-data:www-data /web/initalpass.html
        Properties:
            KeyName: !Ref KeyName
            ImageId: !Ref JenkinsInstanceAMI
            NetworkInterfaces:
                -
                    NetworkInterfaceId: !Ref JenkinsInterface
                    DeviceIndex: '0'
            InstanceType: !Ref JenkinsInstanceType
            IamInstanceProfile: !Ref JenkinsInstanceProfile
            UserData:
                Fn::Base64:
                    !Sub |
                        #!/bin/bash -xe

                        apt-get update -y
                        apt-get install -y python-setuptools openjdk-8-jre
                        mkdir -p /opt/aws/bin
                        wget https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-latest.tar.gz
                        python2 -m easy_install --script-dir /opt/aws/bin aws-cfn-bootstrap-latest.tar.gz

                        echo "Executing config-sets"

                        /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} \
                            --resource JenkinsServer \
                            --configsets install_all \
                            --region ${AWS::Region}

                        /opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} \
                            --resource JenkinsServer \
                            --region ${AWS::Region}
            Tags:
                -
                    Key: Name
                    Value: Jenkins Server

    JenkinsSecurityGroup:
        Type: 'AWS::EC2::SecurityGroup'
        Properties:
            GroupDescription: Enable SSH and HTTP access from specific CIDR block
            VpcId: !Ref VpcId
            SecurityGroupIngress:
                    -
                        IpProtocol: tcp
                        FromPort: 22
                        ToPort: 22
                        CidrIp: !Ref YourIPRange
                    -
                        IpProtocol: tcp
                        FromPort: 80
                        ToPort: 80
                        CidrIp: !Ref YourIPRange
                    -
                        IpProtocol: tcp
                        FromPort: 443
                        ToPort: 443
                        CidrIp: !Ref YourIPRange
            SecurityGroupEgress:
                    -
                        IpProtocol: tcp
                        FromPort: 0
                        ToPort: 65535
                        CidrIp: 0.0.0.0/0

    JenkinsRole:
        Type: 'AWS::IAM::Role'
        Properties:
            Path: /
            AssumeRolePolicyDocument:
                Statement:
                    -
                        Effect: Allow
                        Principal:
                            Service:
                                - ec2.amazonaws.com
                        Action:
                            - 'sts:AssumeRole'

    JenkinsInstanceProfile:
        Type: 'AWS::IAM::InstanceProfile'
        Properties:
            Path: /
            Roles:
                - !Ref JenkinsRole

    JenkinsPolicy:
        Type: 'AWS::IAM::Policy'
        Properties:
            PolicyName: JenkinsPolicy
            PolicyDocument:
                Version: 2012-10-17
                Statement:
                    -
                        Effect: Allow
                        Action:
                            - '*'
                        Resource: '*'
            Roles:
                - !Ref JenkinsRole

Outputs:
    JenkinsServerDNSName:
        Description: DNS Name of Jenkins Server
        Value: !GetAtt
            - JenkinsServer
            - PublicDnsName
```

This CloudFormation template is to deploy Jenkins behind Nginx proxy in your AWS infrastructure.

This template has the following features:

* You curl to get Jenkins initial password: `curl http://ec2-host/password.txt`.
* You can use LetsEncrypt to create SSL certificates: `sudo certbot --nginx -d jenkins.example.com`.

## Summary.

In this article, we covered various ways of deploying Jenkins on your server. Now you’re ready for Jenkins manual installation, launching Jenkins in Docker container, or deploying Jenkins using CloudFormation template.

Please, let us know in the comments section below if you have any questions. We hope you find this article useful! If yes, please, help us to spread it to the world!
