---
title: 'How to use CloudFormation to launch EC2 instance and automate its provisioning'
date: '2020-03-09'
image: 'How-to-use-CloudFormation-to-launch-EC2-instance-and-automate-its-provisioning'
tags:
  - instance
  - cloudformation
  - ec2
  - docker
  - vpc
  - cfn-init
categories:
  - AWS
authors:
  - Andrei Maksimov
---
# How to use CloudFormation to launch EC2 instance and automate its provisioning

{{< my-picture name="How-to-use-CloudFormation-to-launch-EC2-instance-and-automate-its-provisioning" >}}

This article is a contains a simple CloudFormation template for correct launch automation of AWS EC2 instance.

## Solution description

Here we'll setup a basic VPC infrastructure, with 4 subnets (2 public, 2 private) and launch Amazon Linux EC2 instance in one of the public subnets. Also we'll use CloudFormation Metadata ([AWS::CloudFormation::Init](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-init.html)) to provide automation instructions for `cfn-init` scripts.
For our JumpHost also create create and attach instance profile with full Administrative permissions for yuor AWS the account. Plase, feel free to restrict permissions for your use-case.

This is a basic infrastructure building block, which may be used as a base for any automation, so prity much any CloudFormation template starts from it.

## Solution implementation

So, here's our template:

```yaml
AWSTemplateFormatVersion: 2010-09-09

Description: >
	This stack creates basic VPC infrastructure and provisions Amazon Linux EC2
	instance inside a public subnet with Docker installed on it.

Parameters:

    SshKeyName:
        Description: >
            Public SSH key name, which will be used to get access to jumphost instance
        Type: String

    VpcCidrBlock:
      Description: >
        VPC CIDR block
      Type: String
      AllowedPattern: '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$'
      Default: 192.168.0.0/24

Resources:

    Vpc:
        Type: AWS::EC2::VPC
        Properties: 
            CidrBlock: !Ref VpcCidrBlock
            EnableDnsHostnames: true
            EnableDnsSupport: true
            InstanceTenancy: default
            Tags: 
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-vpc'
    
    PrivateSubnetOne:
        Type: AWS::EC2::Subnet
        Properties:
            AvailabilityZone:
                Fn::Select:
                    - 0
                    - Fn::GetAZs: {Ref: 'AWS::Region'}
            VpcId: !Ref 'Vpc'
            CidrBlock: !Select [ 0, !Cidr [ !GetAtt Vpc.CidrBlock, 4, 6 ]]
            Tags:
                - 
                    Key: Name
                    Value: !Sub '${AWS::StackName}-private-subnet-one'
    
    PrivateRouteTable:
        Type: AWS::EC2::RouteTable
        Properties:
            VpcId: !Ref Vpc
            Tags: 
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-private-rt'
    
    PrivateRouteTableSubnetAssociationOne:
        Type: AWS::EC2::SubnetRouteTableAssociation
        Properties:
            RouteTableId: !Ref PrivateRouteTable
            SubnetId: !Ref PrivateSubnetOne

    PrivateRouteTableSubnetAssociationTwo:
        Type: AWS::EC2::SubnetRouteTableAssociation
        Properties:
            RouteTableId: !Ref PrivateRouteTable
            SubnetId: !Ref PrivateSubnetTwo
    
    PrivateSubnetTwo:
        Type: AWS::EC2::Subnet
        Properties:
            AvailabilityZone:
                Fn::Select:
                    - 1
                    - Fn::GetAZs: {Ref: 'AWS::Region'}
            VpcId: !Ref 'Vpc'
            CidrBlock: !Select [ 1, !Cidr [ !GetAtt Vpc.CidrBlock, 4, 6 ]]
            Tags:
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-private-subnet-two'
    
    PublicSubnetOne:
        Type: AWS::EC2::Subnet
        Properties:
            AvailabilityZone:
                Fn::Select:
                    - 0
                    - Fn::GetAZs: {Ref: 'AWS::Region'}
            VpcId: !Ref 'Vpc'
            CidrBlock: !Select [ 2, !Cidr [ !GetAtt Vpc.CidrBlock, 4, 6 ]]
            Tags:
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-public-subnet-one'

    PublicSubnetTwo:
        Type: AWS::EC2::Subnet
        Properties:
            AvailabilityZone:
                Fn::Select:
                    - 1
                    - Fn::GetAZs: {Ref: 'AWS::Region'}
            VpcId: !Ref 'Vpc'
            CidrBlock: !Select [ 3, !Cidr [ !GetAtt Vpc.CidrBlock, 4, 6 ]]
            Tags:
                - 
                    Key: Name
                    Value: !Sub '${AWS::StackName}-public-subnet-two'

    InternetGW:
        Type: AWS::EC2::InternetGateway
        Properties:
            Tags:
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-igw'
      
    GatewayAttachement:
        Type: AWS::EC2::VPCGatewayAttachment
        Properties:
          VpcId: !Ref Vpc
          InternetGatewayId: !Ref InternetGW
    
    PublicRouteTable:
        Type: AWS::EC2::RouteTable
        Properties:
            VpcId: !Ref Vpc
            Tags:
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-public-rt'
    
    PublicRoute:
        Type: AWS::EC2::Route
        DependsOn: GatewayAttachement
        Properties:
            RouteTableId: !Ref PublicRouteTable
            DestinationCidrBlock: 0.0.0.0/0
            GatewayId: !Ref InternetGW
    
    PublicRouteTableSubnetAssociationOne:
        Type: AWS::EC2::SubnetRouteTableAssociation
        Properties:
            RouteTableId: !Ref PublicRouteTable
            SubnetId: !Ref PublicSubnetOne

    PublicRouteTableSubnetAssociationTwo:
        Type: AWS::EC2::SubnetRouteTableAssociation
        Properties:
            RouteTableId: !Ref PublicRouteTable
            SubnetId: !Ref PublicSubnetTwo
    
    PublicAccessSecurityGroup:
        Type: AWS::EC2::SecurityGroup
        Properties:
            VpcId: !Ref Vpc
            GroupDescription: Allows SSH access to JumpHost instance
            GroupName: !Sub '${AWS::StackName}-jumphost-ssh-access'
            SecurityGroupIngress:
                -
                    CidrIp: '0.0.0.0/0'
                    Description: 'Replace this rule on more strict one'
                    FromPort: 22
                    ToPort: 22
                    IpProtocol: tcp
            Tags:
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-jumphost-ssh-access'

    JumpHostInstanceRole:
        Type: 'AWS::IAM::Role'
        Properties:
            AssumeRolePolicyDocument:
                Version: 2012-10-17
                Statement:
                    -
                        Effect: Allow
                        Principal:
                            Service:
                                - ec2.amazonaws.com
                        Action:
                            - 'sts:AssumeRole'
            ManagedPolicyArns:
                - 'arn:aws:iam::aws:policy/AdministratorAccess'

    JumpHostInstanceProfile:
        Type: AWS::IAM::InstanceProfile
        Properties:
            Path: /
            Roles:
                - !Ref JumpHostInstanceRole

    JumpHost:
        Type: AWS::EC2::Instance
        Metadata:
            AWS::CloudFormation::Init:
                configSets:
                    ec2_bootstrap:
                        - install_docker
                install_docker:
                    packages:
                        yum:
                            docker: []
                    services:
                        sysvinit:
                            docker:
                                enabled: "true"
                                ensureRunning: "true"
                    commands:
                        docker_for_ec2_user:
                            command: usermod -G docker ec2-user
        CreationPolicy:
            ResourceSignal:
                Timeout: PT5M
        Properties:
            # Amazon Linux 2 AMI us-east-1
            IamInstanceProfile: !Ref JumpHostInstanceProfile
            ImageId: ami-0a887e401f7654935
            KeyName: !Sub '${SshKeyName}'
            InstanceType: t2.small
            UserData:
                Fn::Base64:
                    !Sub |
                        #!/bin/bash -xe

                        function cfn_fail
                        {
                            cfn-signal -e 1 --stack ${AWS::StackName} --resource JumpHost --region ${AWS::Region}
                            exit 1
                        }

                        function cfn_success
                        {
                            cfn-signal -e 0 --stack ${AWS::StackName} --resource JumpHost --region ${AWS::Region}
                            exit 0
                        }

                        yum -y install git python3-pip

                        until git clone https://github.com/aws-quickstart/quickstart-linux-utilities; do echo "Retrying..."; done
                        cd quickstart-linux-utilities;
                        source quickstart-cfn-tools.source;
                        qs_update-os || qs_err;
                        qs_bootstrap_pip || qs_err "pip bootstrap failed ";
                        qs_aws-cfn-bootstrap || qs_err "CFN bootstrap failed ";
                        echo "Executing config-sets";
                        cfn-init -v --stack ${AWS::StackName} \
                            --resource JumpHost \
                            --configsets ec2_bootstrap \
                            --region ${AWS::Region} || cfn_fail
                        [ $(qs_status) == 0 ] && cfn_success || cfn_fail

            NetworkInterfaces:
                -
                    AssociatePublicIpAddress: true
                    DeviceIndex: "0"
                    GroupSet:
                        - !Ref PublicAccessSecurityGroup
                    SubnetId: !Ref PublicSubnetOne
            Tags:
                -
                    Key: Name
                    Value: !Sub '${AWS::StackName}-jumphost'

Outputs:

    JumpHostPublicHostname:
        Description: JumpHost public hostname
        Value: !GetAtt JumpHost.PublicDnsName
        Export:
            Name: !Sub '${AWS::StackName}-ec2-jumphost-public-ip'

```

There're several important metadata blocks, which are used for `JumpHost` instance.

```yaml
CreationPolicy:
    ResourceSignal:
    	Timeout: PT5M
```

This block is telling CloudFormation to rollback stack changes, if it does not receive successfull resource creation signal. This signal is sent by either `cfn_success`, either `cfn_fail` function depending on a condition.

Project [quickstart-linux-utilities](https://github.com/aws-quickstart/quickstart-linux-utilities) significantly simplifies cfn-init installation for the instances, where it has not been installed.

```sh
cfn-init -v --stack ${AWS::StackName} \
    --resource JumpHost \
    --configsets ec2_bootstrap \
    --region ${AWS::Region} || cfn_fail
```

This block tells cfn-init scripts to install everything, what described in `Metadata` block.

```yaml
Metadata:
    AWS::CloudFormation::Init:
        configSets:
            ec2_bootstrap:
                - install_docker
        install_docker:
            packages:
                yum:
                    docker: []
            services:
                sysvinit:
                    docker:
                        enabled: "true"
                        ensureRunning: "true"
            commands:
                docker_for_ec2_user:
                    command: usermod -G docker ec2-user
```

## Conclusion

In short, it installs Docker package using yum, enables and runs it. Finally it adds `ec2-user` to docker group, so we can launch Docker containers without sudo.
