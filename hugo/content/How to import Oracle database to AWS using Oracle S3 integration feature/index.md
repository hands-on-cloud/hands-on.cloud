---
title: 'How to import Oracle database to AWS using Oracle S3 integration feature'
date: '2020-03-07'
image: 'How-to-import-Oracle-database-to-AWS-using-Oracle-S3-integration-feature'
tags:
  - rds
  - oracle
  - sql
  - s3
categories:
  - AWS
authors:
  - Andrei Maksimov
---

{{< my-picture name="How-to-import-Oracle-database-to-AWS-using-Oracle-S3-integration-feature" >}}

Migration of Oracle database to AWS is a common task many different Enterprises nowadays. And there're many different ways of doing that. In this article I'll summarize manual steps and commands, of cause, which are helping to work with Oracle Data Pump in Amazon RDS Oracle.

## Enable S3 integration

First of all, you need to enable Oracle S3 integration. Whole process is compleetely described at [official documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/oracle-s3-integration.html). As a suort summary it provides your Oracle RDS instance with an ability to get access to S3 bucket. For those of you, who're using CloudFormation to do that, here's some snipets:

```yaml
DbOptionGroup:
  Type: "AWS::RDS::OptionGroup"
  Properties: 
    EngineName: oracle-ee
    MajorEngineVersion: "12.2"
    OptionConfigurations: 
      -
        OptionName: S3_INTEGRATION
    OptionGroupDescription: "Oracle DB Instance Option Group for S3 Integration"

DbInstanceS3IntegrationRole:
  Type: "AWS::IAM::Role"
  Properties:
    AssumeRolePolicyDocument:
      Version: "2012-10-17"
      Statement:
        - Effect: Allow
          Principal:
            Service: rds.amazonaws.com
          Action: "sts:AssumeRole"
    Path: "/"
    Policies:
    - PolicyName: S3Access
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Action:
            - s3:GetObject
            - s3:ListBucket
            - s3:PutObject
          Resource:
            - !Sub "arn:aws:s3:::${DbDumpBucketName}"
            - !Sub "arn:aws:s3:::${DbDumpBucketName}/*"
```

Now, if you're planning continuosly create and delete RDS Oracle instance using CloudFormation, it is better not to attach `DbOptionGroup` to your Oracle instance. CloudFormation will not be able to delete your stack because:
* Automatic RDS instance snapshot is created during RDS provisioning time
* RDS instance snapshot depends on Option Group

As a result Option Group is at your stack will be locked by automatically created DB snapshot and you will not be able to deleted it.

## Importing Oracle Data Pump file

Create all nesessary tablespaces if needed. Each can be created by:

```sql
CREATE TABLESPACE MY_TABLESPACE DATAFILE SIZE 5G
AUTOEXTEND ON NEXT 1G;
```

Create necessary schema(user) and grant it the following permissions:

```sql
CREATE USER MY_USER IDENTIFIED BY "MY_PASSWORD";
GRANT UNLIMITED TABLESPACE TO MY_USER;
GRANT CREATE SESSION, RESOURCE, DBA to MY_USER;
ALTER USER MY_USER QUOTA 100M on users;
```

Also, for every tablespace you created:
```sql
ALTER USER MY_USER QUOTA 100M ON MY_TABLESPACE;
```

To initiate dump file copy from S3 bucket, execute the following query:

```sql
SELECT rdsadmin.rdsadmin_s3_tasks.download_from_s3(
    p_bucket_name => 'your_s3_bucket_name',
    p_s3_prefix => '',
    p_directory_name => 'DATA_PUMP_DIR')
AS TASK_ID FROM DUAL
```

This query returns **task-id**, which can be used to track transfer status:

```sql
SELECT text FROM table(rdsadmin.rds_file_util.read_text_file('BDUMP','dbtask-<task_id>.log'))
```

Replace **<task_id>** with the value returned from the previous query.

You may list all uploaded files using the following query:

```sql
select * from table(RDSADMIN.RDS_FILE_UTIL.LISTDIR('DATA_PUMP_DIR')) order by filename
```

**Note**: sometimes it's required to delete imported file. You may do it with the following command:

```sql
exec utl_file.fremove('DATA_PUMP_DIR','your_file_name');
```

As soon as the file transfeted from S3 bucket to Oracle instance, you may start import job:

```sql
DECLARE
hdnl NUMBER;
BEGIN
hdnl := DBMS_DATAPUMP.OPEN( operation => 'IMPORT', job_mode => 'SCHEMA', job_name=>null);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'your_file_name', directory => 'DATA_PUMP_DIR', filetype => dbms_datapump.ku$_file_type_dump_file);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'imp.log', directory => 'DATA_PUMP_DIR', filetype => dbms_datapump.ku$_file_type_log_file);
DBMS_DATAPUMP.METADATA_FILTER(hdnl,'SCHEMA_EXPR','IN (''your_schema_name'')');
DBMS_DATAPUMP.START_JOB(hdnl);
END;
```

Replace `your_file_name` and `your_schema_name` with your values.

To check status of your job execute the following query:

```sql
SELECT owner_name, job_name, operation, job_mode,DEGREE, state FROM dba_datapump_jobs where state='EXECUTING'
```

Read import log file to get more information about errors or unexpected results:

```sql
SELECT text FROM table(rdsadmin.rds_file_util.read_text_file('DATA_PUMP_DIR','imp.log'))
```

## Exporting Oracle Data Pump file

**Note**: The following dump query may not export ALL your tables, if some [tables may not be extent allocated](https://stackoverflow.com/a/18925415). So, you need to generate a script to alter those tables:

```sql
SELECT 'ALTER TABLE '||table_name||' ALLOCATE EXTENT;' FROM user_tables WHERE segment_created = 'NO';
```

Run generated queries before executing dump query to get a full dump.

To export Oracle Data Pump file you need to export your DB first:

```sql
DECLARE
hdnl NUMBER;
BEGIN
hdnl := DBMS_DATAPUMP.OPEN( operation => 'EXPORT', job_mode => 'SCHEMA', job_name=>null);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'your_file_name', directory => 'DATA_PUMP_DIR', filetype => dbms_datapump.ku$_file_type_dump_file);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'exp.log', directory => 'DATA_PUMP_DIR', filetype => dbms_datapump.ku$_file_type_log_file);
DBMS_DATAPUMP.METADATA_FILTER(hdnl,'SCHEMA_EXPR','IN (''your_schema_name'')');
DBMS_DATAPUMP.START_JOB(hdnl);
END;
```

Replace `your_file_name` and `your_schema_name` with your desired values.

To check status of your job execute the following query:

```sql
SELECT owner_name, job_name, operation, job_mode,DEGREE, state FROM dba_datapump_jobs where state='EXECUTING'
```

Also, you may read `exp.log` during export operation:

```sql
SELECT text FROM table(rdsadmin.rds_file_util.read_text_file('DATA_PUMP_DIR','exp.log'))
```

As soon as export finishes, you may copy your exported file to S3 bucket:

```sql
SELECT rdsadmin.rdsadmin_s3_tasks.upload_to_s3(
      p_bucket_name    =>  'your_s3_bucket_name', 
      p_prefix         =>  '', 
      p_s3_prefix      =>  '', 
      p_directory_name =>  'DATA_PUMP_DIR') 
AS TASK_ID FROM DUAL;
```

And again, to check upload status, execute the following query:

```sql
SELECT text FROM table(rdsadmin.rds_file_util.read_text_file('BDUMP','dbtask-<task_id>.log'))
```

## Importing regular exported file

Sometimes you may be dealing with dumps, which been exported by Oracle Export utility. Their import is not that much efficient, but as we have no any other option..

Create nesessary tablespace if needed:

```sql
CREATE TABLESPACE MY_TABLESPACE DATAFILE SIZE 5G
AUTOEXTEND ON NEXT 1G;
```

Create schema (user) for imported database:

```sql
create user MY_USER identified by <password>;
grant create session, resource, DBA to MY_USER;
alter user MY_USER quota 100M on users;
```

Grant your user all necessary permissions, allowing to import DB:

```sql
grant read, write on directory data_pump_dir to MY_USER;
grant select_catalog_role to MY_USER;
grant execute on dbms_datapump to MY_USER;
grant execute on dbms_file_transfer to MY_USER;
```

Next, you need to install [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html) to Amazon Linux EC2 instance.

Download the following RPMs:

* Base
* Tools

And install them:

```sh
sudo yum -y install oracle-instantclient19.6-basic-19.6.0.0.0-1.x86_64.rpm
sudo yum -y install oracle-instantclient19.6-tools-19.6.0.0.0-1.x86_64.rpm
```

Now you may import your dump file using Oracle Import utility:

```sh
/usr/lib/oracle/19.6/client64/bin/imp MY_USER@rds-instance-connection-endpoint-url/ORCL FILE=/opt/my_exported_db.dmp FULL=y GRANTS=y
```

As soon as process finishes I definitely recommend to export your DB using Oracle Data Pump to have an ability to import it much faster next time.

## Common errors

Oracle S3 integration not configured:

```
ORA-00904: "RDSADMIN"."RDSADMIN_S3_TASKS"."UPLOAD_TO_S3": invalid identifier
00904. 00000 -  "%s: invalid identifier"
*Cause:    
*Action:
Error at Line: 52 Column: 8
```

You need to apply correct Option Group or check S3 integration role.
