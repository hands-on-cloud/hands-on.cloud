---
title: "CloudFormation. How to access CodeCommit repo from EC2 instance"
date: "2018-02-05"
thumbnail: "./CloudFormation-How-to-access-CodeCommit-repo-from-EC2-instance.png"
tags:
-   aws cloud
-   cloudformation
-   codecommit
-   devops
-   mongodb
-   packer
category: "aws"
authors:
-   Andrei Maksimov
---

![CloudFormation. How to access CodeCommit repo from EC2 instance](CloudFormation-How-to-access-CodeCommit-repo-from-EC2-instance.png)

It is a very common task to pull your application code to EC2 instances from the Git repository. If you’re using CodeCommit as your main Git repository and CloudFormation for infrastructure management, it is very easy to launch an instance and allow it to access to that repository without storing any credentials or keys inside of it. In this article I’ll show you how to implement this in real life.

## Task

Our task is to automate initial data import from CodeCommit repository to dev MongoDB server during CloudFormation stack deployment.

## Solution

To solve this task we need to do several things:

*   Create MongoDB AMI
*   Update your existing CloudFormation template

Easy.

## MongoDB AMI

Let’s build our MongoDB AMI on top of Ubuntu 16.04 using [Packer](https://www.packer.io/) in N. Virginia Region. Here’s the template (`mongodb.json`):

```json
{
    "variables": {
        "aws_profile":    "default"
    },
    "builders": [
        {
            "type": "amazon-ebs",
            "profile": "{{ user `aws_profile`}}",
            "ami_name": "mongodb_server-{{timestamp}}",
            "instance_type": "t2.small",
            "source_ami": "ami-66506c1c",
            "ssh_username": "ubuntu"
        }
    ],
    "provisioners": [
        {
            "type": "shell",
            "inline":[
                "sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927",
                "sudo echo \"deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse\" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list",
                "sudo apt-get update",
                "sudo apt-get install -y mongodb-org python-pip",
                "sudo systemctl enable mongod",
                "sudo pip install awscli boto3"
            ]
        },
        {
            "type": "file",
            "source": "./configs/mongod.conf",
            "destination": "/tmp/"
        },
        {
            "type": "shell",
            "inline":[
                "sudo mv /tmp/mongod.conf /etc/"
            ]
        }
    ]
}
```

I’m also installing aws cli inside to be able to automate the things which are not covered by this article.

To build this template use the following command:

```sh
packer build mongodb.json
```

## CloudFormation template

First all you need to add an Instance declaration:

```json
"MongoDB": {
    "Type": "AWS::EC2::Instance",
    "Metadata" : {
        "Comment1" : "Restores MongoDB backup from CodeCommit repository",
        "AWS::CloudFormation::Init" : {
            "configSets" : {
                "InstallCFN": [ "config-cfn-hup" ]
            },
            "config-cfn-hup": {
              "/etc/cfn/cfn-hup.conf" : {
                  "content": {
                    "Fn::Join": [
                      "",
                      [
                        "[main]\n",
                        "stack=", { "Ref" : "AWS::StackId" }, "\n",
                        "region=", { "Ref" : "AWS::Region" }, "\n"
                      ]
                    ]
                  },
                  "mode"    : "000400",
                  "owner"   : "root",
                  "group"   : "root"
                },

                "/etc/cfn/hooks.d/cfn-auto-reloader.conf": {
                    "content": {
                        "Fn::Join" : [
                            "", [
                              "[cfn-auto-reloader-hook]\n",
                              "triggers=post.update\n",
                              "path=Resources.MongoDB.Metadata.AWS::CloudFormation::Init\n",
                              "action=/opt/aws/bin/cfn-init -v ",
                              "         --stack ", { "Ref" : "AWS::StackName" },
                              "         --resource MongoDB ",
                              "         --configsets InstallCFN ",
                              "         --region ", { "Ref" : "AWS::Region" }, "\n",
                              "runas=root\n"
                            ]
                        ]
                    }
                },
                "/etc/systemd/system/cfn-hup.service": {
                    "content": {
                        "Fn::Join" : [
                            "", [
                              "[Unit]\n",
                              "Description=Cloud formation helper daemon\n",
                              "\n",
                              "[Service]\n",
                              "ExecStart=/usr/local/bin/cfn-hup\n",
                              "Restart=always\n",
                              "RestartSec=10s\n",
                              "Type=notify\n",
                              "NotifyAccess=all\n",
                              "TimeoutStartSec=120\n",
                              "TimeoutStopSec=15\n",
                              "\n",
                              "[Install]\n",
                              "WantedBy=multi-user.target\n"
                            ]
                        ]
                    }
                },
                "commands" : {
                    "enable-cfn-hup" : {
                        "command": "systemctl enable cfn-hup.service"
                    },
                    "start-cfn-hup": {
                        "command": "systemctl start cfn-hup.service"
                    }
                }
            }
        }
    },
    "Properties": {
        "SubnetId": {
            "Ref": "PublicSubnet0"
        },
        "ImageId": {
            "Ref": "MongoDBImage"
        },
        "InstanceType": "t2.small",
        "KeyName": {
            "Ref": "SSHKeyName"
        },
        "SecurityGroupIds": [
            {
                "Ref": "SecurityGroupMongoDB"
            }
        ],
        "IamInstanceProfile": {
            "Ref": "MongoDBServerInstanceProfile"
        },
        "UserData": {
            "Fn::Base64": {
                  "Fn::Join" : [
                    "",
                    [
                       "#!/bin/bash -xe\n",
                       "export HOME=/root\n",
                       "pip install https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-latest.tar.gz\n",
                       "cp /usr/local/init/ubuntu/cfn-hup /etc/init.d/cfn-hup \n",
                       "chmod +x /etc/init.d/cfn-hup \n",
                       "update-rc.d cfn-hup defaults \n",
                       "service cfn-hup start \n",

                       "if [ ! -d '${HOME}/mongodb-backup' ]; then \n",
                       "  cd ${HOME}\n",
                       "  git config --global credential.helper '!aws codecommit credential-helper $@'\n",
                       "  git config --global credential.UseHttpPath true\n",
                       "  git clone https://git-codecommit.us-east-1.amazonaws.com/v1/repos/mongodb-backup; \n",
                       "  cd mongodb-backup ; ls -1 *.json | sed 's/.json$//' | while read col; do mongoimport -d progkids -c $col < $col.json; done\n",
                       "fi\n",

                       "/usr/local/bin/cfn-init -v ",
                       "         --stack ", { "Ref" : "AWS::StackName" },
                       "         --resource MongoDB ",
                       "         --configsets InstallCFN ",
                       "         --region ", { "Ref" : "AWS::Region" }, "\n",

                       "/usr/local/bin/cfn-signal -e $? ",
                       "         --stack ", { "Ref" : "AWS::StackName" },
                       "         --resource MongoDB ",
                       "         --region ", { "Ref" : "AWS::Region" }, "\n"
                      ]
                ]
            }
        },
        "Tags": [
            {
                "Key": "Name",
                "Value": "MongoDB"
            },
            {
                "Key": "Application",
                "Value": {
                    "Ref": "AWS::StackId"
                }
            }
        ]
    }
}
```

Such MongoDB instance declaration will install [cfn-init](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-init.html), and put some additional automation logic to `user-data`. The most important of instance parameters is `IamInstanceProfile`, which will apply appropriate IAM Role to our server (we will add it later).

We’re passing all automation logic through instance `user-data`. It consists of 3 parts:

*   Install cfn-init
*   Clone repository with MongoDB backups and restore them only once during instance first boot.
*   Launch cfn-init automation, if you’d like to add something.

I moved out MongoDB backup import to `user-data` because `cfn-init` did not allow me to launch and configure git properly.

All `git` the magic happens here:

```sh
# Using AWS cli to get temporary credentials to CodeCommit
git config --global credential.helper '!aws codecommit credential-helper $@'

# Configuring git to use HTTP proto
git config --global credential.UseHttpPath true

# Cloning our repo
git clone https://git-codecommit.us-east-1.amazonaws.com/v1/repos/mongodb-backup
```

## IAM instance profile
In order to allow everything to work properly you need to create IAM instance profile with the right permissions. Here it is:

```json
"MongoDBServerRole": {
    "Type": "AWS::IAM::Role",
    "Properties": {
        "AssumeRolePolicyDocument": {
            "Version" : "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": [
                            "ec2.amazonaws.com"
                        ]
                    },
                    "Action": [
                        "sts:AssumeRole"
                    ]
                }
            ]
        },
        "Path": "/",
        "RoleName": {
            "Fn::Join": [
                "-", [
                    "MongoDBServerRole",
                    {
                      "Ref": "AWS::StackName"
                    }
                ]
            ]
        }
    }
},

"MongoDBServerPolicy": {
    "Type" : "AWS::IAM::Policy",
    "Properties" : {
        "PolicyName" : {
            "Fn::Join": [
                "-", [
                  "MongoDBServerPolicy",
                  {
                    "Ref": "AWS::StackName"
                  }
                ]
            ]
        },
        "PolicyDocument" : {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "codecommit:ListRepositories",
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": "codecommit:*",
                    "Resource": "arn:aws:codecommit:us-east-1:468439730987:mongodb-backup"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "kms:Encrypt",
                        "kms:Decrypt",
                        "kms:ReEncrypt",
                        "kms:GenerateDataKey",
                        "kms:GenerateDataKeyWithoutPlaintext",
                        "kms:DescribeKey"
                    ],
                    "Resource": "*"
                }
            ]
        },
        "Roles": [
            {
                "Ref": "MongoDBServerRole"
            }
        ]
    }
},

"MongoDBServerInstanceProfile": {
    "Type": "AWS::IAM::InstanceProfile",
    "Properties": {
        "Path": "/",
        "Roles": [
            {
                "Ref": "MongoDBServerRole"
            }
        ],
        "InstanceProfileName": {
            "Fn::Join": [
                "-", [
                  "MongoDBServerInstanceProfile",
                  {
                    "Ref": "AWS::StackName"
                  }
                ]
            ]
        }
     }
}
```

## Final words

In this article we saw how easily we could build our own AMI using Packer and organize it’s access to CodeCommit repository without storing any credentials inside the instance or it’s environment. IAM roles and instance configurations are provided as CloudFormation template. Hope, this will help you to save some time for a cup of coffee.
