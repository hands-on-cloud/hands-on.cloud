---
title: 'AWS CloudFormation - How to create DMS infrastructure for relational DB migration'
date: '2020-03-16'
image: 'AWS-CloudFormation-How-to-create-DMS-infrastructure-for-relational-DB-migration'
tags:
  - cloudformation
  - dms
categories:
  - AWS
authors:
  - Andrei Maksimov
---

{{< my-picture name="AWS-CloudFormation-How-to-create-DMS-infrastructure-for-relational-DB-migration" >}}

AWS Database Migration Service (AWS DMS) is a cloud service that makes it easy to migrate relational databases, data warehouses, NoSQL databases, and other types of data stores. You can use AWS DMS to migrate your data into the Cloud, between on-premises DB servers, or between any combinations of cloud and on-premises setups. You may get more information about AWS DMS in the official [AWS documentation](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html).

So, my goal for this post is to provide you with a template, which you may use to automate DMS infrastructure setup. Whole template consists of:

* DMS Replication Subnet Group ([AWS::DMS::ReplicationSubnetGroup](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dms-replicationsubnetgroup.html))
* DMS Replication Instance ([AWS::DMS::ReplicationInstance](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dms-replicationinstance.html))
* DMS Source and Target Endpoints ([AWS::DMS::Endpoint](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dms-endpoint.html))
* DMS Replication Task ([AWS::DMS::ReplicationTask](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dms-replicationtask.html))

I'm not using Secrets Manager in this template to make it simplier, but you may easily avoid using plain text passwords in stack parameters by using simple custom resource and Lambda Function. Please, feel free to ask an examples in comments and I'll provide them to you.  

Also, I'm pointing your attention to the way, I'm puttin JSON objects populated with parameters from the stack to the DMS Replication Task using `!Sub` intrinsic function.

So, long story short, here's our template:

```yaml
AWSTemplateFormatVersion: 2010-09-09

Description: >
    This stack template creates DMS pipeline to migrate one DB to another.

Parameters:
    Vpc:
        Description: >
            VPC where to setup DMS instance.
            DMS instance should have connectivity to RDS instance.
        Type: 'AWS::EC2::VPC::Id'
    
    SubnetIds:
        Description: >
            Subnets for DMS subnet group. Must contain at least two
            subnets in two different Availability Zones in the same region.
        Type: 'List<AWS::EC2::Subnet::Id>'

    SecurityGroupIds:
        Description: >
            Security Group IDs for DMS subnet group. Must contain at least two
            subnets in two different Availability Zones in the same region.
        Type: 'List<AWS::EC2::SecurityGroup::Id>'

    ReplicationInstanceAllocatedStorage:
        Description: >
            The amount of storage (in gigabytes) to be initially allocated
            for the replication instance.
        Type: Number
        Default: 100

    ReplicationInstanceClass:
        Description: >
            The compute and memory capacity of the replication instance as specified
            by the replication instance class.
            Valid Values: dms.t2.micro | dms.t2.small | dms.t2.medium | dms.t2.large |
            dms.c4.large | dms.c4.xlarge | dms.c4.2xlarge | dms.c4.4xlarge
        Type: String
        Default: dms.r4.2xlarge

    DbSchemaName:
        Description: >
            DB schema name, which will be migrated
        Type: String

    SrcDbName:
        Description: >
            Source DB name
        Type: String

    SrcDbUsername:
        Description: >
            Source DB username
        Type: String

    SrcDbPassword:
        Description: >
            Source DB password
        Type: String

    SrcDbEngine:
        Description: >
            Source DB engine. Valid values, depending on the EndpointType value, include
            mysql, oracle, postgres, mariadb, aurora, aurora-postgresql, redshift, s3, db2,
            azuredb, sybase, dynamodb, mongodb, and sqlserver.
        Type: String

    SrcDbServerName:
        Description: >
            Source DB hostname
        Type: String

    SrcDbPort:
        Description: >
            Source DB connection port number
        Type: Number

    DstDbName:
        Description: >
            Destination DB name
        Type: String

    DstDbUsername:
        Description: >
            Source DB username
        Type: String

    DstDbPassword:
        Description: >
            Destination DB password
        Type: String

    DstDbEngine:
        Description: >
            Destination DB engine. Valid values, depending on the EndpointType value, include
            mysql, oracle, postgres, mariadb, aurora, aurora-postgresql, redshift, s3, db2,
            azuredb, sybase, dynamodb, mongodb, and sqlserver.
        Type: String

    DstDbServerName:
        Description: >
            Destination DB hostname
        Type: String

    DstDbPort:
        Description: >
            Destination DB connection port number
        Type: Number

    DmsReplicationTaskEnableLogging:
        Description: >
            Boolean flag if you want to enable logging for your DMS task
        Type: String
        Default: true

    DmsReplicationTaskSupportLOBs:
        Description: >
            Enable LOBs support for DMS task
        Type: String
        Default: true

    DmsReplicationTaskMigrationType:
        Description: >
            The migration type. Valid values: full-load | cdc | full-load-and-cdc
        Type: String
        Default: full-load

Metadata: 
    AWS::CloudFormation::Interface: 
        ParameterGroups: 
            -
                Label: 
                    default: "Network Configuration"
                Parameters: 
                    - Vpc
                    - SubnetIds
            -
                Label: 
                    default: "Replication Instance Parameters"
                Parameters:
                    - ReplicationInstanceAllocatedStorage
                    - ReplicationInstanceClass
                    - SecurityGroupIds
            -
                Label: 
                    default: "Source Endpoint Parameters"
                Parameters:
                    - SrcDbName
                    - SrcDbUsername
                    - SrcDbPassword
                    - SrcDbServerName
                    - SrcDbPort
                    - SrcDbEngine
            -
                Label: 
                    default: "Target Endpoint Parameters"
                Parameters:
                    - DstDbName
                    - DstDbUsername
                    - DstDbPassword
                    - DstDbServerName
                    - DstDbPort
                    - DstDbEngine
            -
                Label: 
                    default: "Replication Task Parameters"
                Parameters:
                    - DbSchemaName
                    - DmsReplicationTaskMigrationType
                    - DmsReplicationTaskEnableLogging
                    - DmsReplicationTaskSupportLOBs
                    - DstDbPort
                    - DstDbEngine

Resources:

    ReplicationInstanceSubnetGroup:
        Type: AWS::DMS::ReplicationSubnetGroup
        Properties:
            ReplicationSubnetGroupDescription: !Sub '${AWS::StackName} DMS Subnet Group'
            ReplicationSubnetGroupIdentifier: !Sub '${AWS::StackName}-dms-subnet-group'
            SubnetIds: !Ref SubnetIds
            Tags:
                - Key: Name
                  Value: !Sub '${AWS::StackName}-dms-subnet-group'

    ReplicationInstance:
        Type: AWS::DMS::ReplicationInstance
        Properties:
            AllocatedStorage: !Ref ReplicationInstanceAllocatedStorage
            AllowMajorVersionUpgrade: false
            AutoMinorVersionUpgrade: false
            MultiAZ: false
            PubliclyAccessible: false
            ReplicationInstanceClass: !Sub '${ReplicationInstanceClass}'
            ReplicationInstanceIdentifier: !Sub '${AWS::StackName}-replication-instance'
            ReplicationSubnetGroupIdentifier: !Ref ReplicationInstanceSubnetGroup
            VpcSecurityGroupIds: !Ref SecurityGroupIds

    DmsEndpointSource:
        Type: AWS::DMS::Endpoint
        Properties:
            DatabaseName: !Ref SrcDbName
            EndpointType: 'source'
            EngineName: !Ref SrcDbEngine
            ServerName: !Ref SrcDbServerName
            Port: !Ref SrcDbPort
            Username: !Ref SrcDbUsername
            Password: !Ref SrcDbPassword
            Tags: 
                - 
                  Key: Name
                  Value: !Sub '${AWS::StackName}-dms-source-endpoint'

    DmsEndpointTarget:
        Type: AWS::DMS::Endpoint
        Properties:
            DatabaseName: !Ref DstDbName
            EndpointType: 'target'
            EngineName: !Ref DstDbEngine
            ServerName: !Ref DstDbServerName
            Port: !Ref DstDbPort
            Username: !Ref DstDbUsername
            Password: !Ref DstDbPassword
            Tags: 
                - 
                  Key: Name
                  Value: !Sub '${AWS::StackName}-dms-target-endpoint'

    DmsReplicationTask:
        Type: AWS::DMS::ReplicationTask
        Properties:
            MigrationType: !Ref DmsReplicationTaskMigrationType
            ReplicationInstanceArn: !Ref ReplicationInstance
            ReplicationTaskIdentifier: !Sub '${AWS::StackName}-dms-replication-task'
            ReplicationTaskSettings:
                !Sub
                    - |-
                        {
                            "TargetMetadata": {
                                "TargetSchema": "",
                                "SupportLobs": ${support_lobs},
                                "FullLobMode": false,
                                "LobChunkSize": 64,
                                "LimitedSizeLobMode": true,
                                "LobMaxSize": 32,
                                "InlineLobMaxSize": 0,
                                "LoadMaxFileSize": 0,
                                "ParallelLoadThreads": 0,
                                "ParallelLoadBufferSize": 0,
                                "BatchApplyEnabled": false,
                                "TaskRecoveryTableEnabled": false,
                                "ParallelLoadQueuesPerThread": 0,
                                "ParallelApplyThreads": 0,
                                "ParallelApplyBufferSize": 0,
                                "ParallelApplyQueuesPerThread": 0
                            },
                            "FullLoadSettings": {
                                "TargetTablePrepMode": "DROP_AND_CREATE",
                                "CreatePkAfterFullLoad": false,
                                "StopTaskCachedChangesApplied": false,
                                "StopTaskCachedChangesNotApplied": false,
                                "MaxFullLoadSubTasks": 8,
                                "TransactionConsistencyTimeout": 600,
                                "CommitRate": 10000
                            },
                            "Logging": {
                                "EnableLogging": ${enable_logging},
                                "LogComponents": [
                                    {
                                        "Id": "SOURCE_UNLOAD",
                                        "Severity": "LOGGER_SEVERITY_DEFAULT"
                                    },
                                    {
                                        "Id": "SOURCE_CAPTURE",
                                        "Severity": "LOGGER_SEVERITY_DEFAULT"
                                    },
                                    {
                                        "Id": "TARGET_LOAD",
                                        "Severity": "LOGGER_SEVERITY_DEFAULT"
                                    },
                                    {
                                        "Id": "TARGET_APPLY",
                                        "Severity": "LOGGER_SEVERITY_DEFAULT"
                                    },
                                    {
                                        "Id": "TASK_MANAGER",
                                        "Severity": "LOGGER_SEVERITY_DEFAULT"
                                    }
                                ],
                                "CloudWatchLogGroup": null,
                                "CloudWatchLogStream": null
                            },
                            "ControlTablesSettings": {
                                "historyTimeslotInMinutes": 5,
                                "ControlSchema": "",
                                "HistoryTimeslotInMinutes": 5,
                                "HistoryTableEnabled": false,
                                "SuspendedTablesTableEnabled": false,
                                "StatusTableEnabled": false
                            },
                            "StreamBufferSettings": {
                                "StreamBufferCount": 3,
                                "StreamBufferSizeInMB": 8,
                                "CtrlStreamBufferSizeInMB": 5
                            },
                            "ChangeProcessingDdlHandlingPolicy": {
                                "HandleSourceTableDropped": true,
                                "HandleSourceTableTruncated": true,
                                "HandleSourceTableAltered": true
                            },
                            "ErrorBehavior": {
                                "DataErrorPolicy": "LOG_ERROR",
                                "DataTruncationErrorPolicy": "LOG_ERROR",
                                "DataErrorEscalationPolicy": "SUSPEND_TABLE",
                                "DataErrorEscalationCount": 0,
                                "TableErrorPolicy": "SUSPEND_TABLE",
                                "TableErrorEscalationPolicy": "STOP_TASK",
                                "TableErrorEscalationCount": 0,
                                "RecoverableErrorCount": -1,
                                "RecoverableErrorInterval": 5,
                                "RecoverableErrorThrottling": true,
                                "RecoverableErrorThrottlingMax": 1800,
                                "ApplyErrorDeletePolicy": "IGNORE_RECORD",
                                "ApplyErrorInsertPolicy": "LOG_ERROR",
                                "ApplyErrorUpdatePolicy": "LOG_ERROR",
                                "ApplyErrorEscalationPolicy": "LOG_ERROR",
                                "ApplyErrorEscalationCount": 0,
                                "ApplyErrorFailOnTruncationDdl": false,
                                "FullLoadIgnoreConflicts": true,
                                "FailOnTransactionConsistencyBreached": false,
                                "FailOnNoTablesCaptured": false
                            },
                            "ChangeProcessingTuning": {
                                "BatchApplyPreserveTransaction": true,
                                "BatchApplyTimeoutMin": 1,
                                "BatchApplyTimeoutMax": 30,
                                "BatchApplyMemoryLimit": 500,
                                "BatchSplitSize": 0,
                                "MinTransactionSize": 1000,
                                "CommitTimeout": 1,
                                "MemoryLimitTotal": 1024,
                                "MemoryKeepTime": 60,
                                "StatementCacheSize": 50
                            },
                            "PostProcessingRules": null,
                            "CharacterSetSettings": null,
                            "LoopbackPreventionSettings": null,
                            "BeforeImageSettings": null
                        }
                    -
                        enable_logging: !Ref DmsReplicationTaskEnableLogging
                        support_lobs: !Ref DmsReplicationTaskSupportLOBs
            TableMappings:
                !Sub
                    - |-
                        {
                            "rules": [
                                {
                                    "rule-type": "selection", 
                                    "rule-id": "1", 
                                    "rule-action": "include", 
                                    "object-locator": {
                                        "schema-name": "${db_schema_name}", 
                                        "table-name": "%"
                                    }, 
                                    "rule-name": "1"
                                }
                            ]
                        }
                    -
                        db_schema_name: !Ref DbSchemaName
            SourceEndpointArn: !Ref DmsEndpointSource
            TargetEndpointArn: !Ref DmsEndpointTarget

Outputs:

    DmsEndpointSource:
        Description: DMS source Endpoint
        Value: !Ref DmsEndpointSource
        Export:
            Name: !Sub '${AWS::StackName}-dms-source-endpoint'

    DmsEndpointTarget:
        Description: DMS target Endpoint
        Value: !Ref DmsEndpointTarget
        Export:
            Name: !Sub '${AWS::StackName}-dms-target-endpoint'

    ReplicationInstance:
        Description: DMS Replication Instance
        Value: !Ref ReplicationInstance
        Export:
            Name: !Sub '${AWS::StackName}-dms-replication-instance'

    DmsReplicationTask:
        Description: DMS Replication Task
        Value: !Ref DmsReplicationTask
        Export:
            Name: !Sub '${AWS::StackName}-dms-replication-task'
```

Of cause, this is very simple template and not everything is the parameterized, but I'm still hoping, that it saves you some amount of time.
