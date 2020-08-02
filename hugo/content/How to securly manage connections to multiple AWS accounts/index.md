---
title: 'How to securely manage credentials to multiple AWS accounts'
date: '2020-04-11'
image: 'How-to-securely-manage-credentials-to-multiple-AWS-accounts'
tags:
  - awscli
  - security
  - iam
  - sts
  - aws-vault
categories:
  - AWS
authors:
  - Andrei Maksimov
---
# How to securely manage credentials to multiple AWS accounts

{{< my-picture name="How-to-securely-manage-credentials-to-multiple-AWS-accounts" >}}

## Problem space

As soon as you start working with more than one project or organization at AWS cloud, the first question you may have is how to manage [awscli](https://aws.amazon.com/cli/) credentials and have to use them easily and securely to get access to all your AWS accounts and environments.

I always was not a big fan of `~/.aws/credentials` file, because every single time I was coming to a new customer, I needed to open this file for the edit to add new credentials. As a result, I constantly had a feeling, that I displayed all my existing credentials to all security cameras in the office. God, bless the inventor of the privacy screens!

The second problem with credentials is that they need to be renewed from time to time. The more accounts you have, the more efforts you spend on credentials rotation.

And the third problem - is assuming roles in terminal sessions and working in several different environments at the same time.

## Solution

As a solution for the first two problems, not too far ago I started using:

* [aws-vault](https://github.com/99designs/aws-vault/) - AWS credentials manager

As a solution for the last two problems, I found that the following tooling stack suits most of my needs:

* [zsh and oh-my-zsh](https://gist.github.com/ZenLulz/c812f70fc86ebdbb189d9fb82f98197e) - terminal
* [zsh-aws-vault](https://github.com/blimmer/zsh-aws-vault) - AWS environment highlighting for the terminal session

## Managing AWS credentials

Here’s a quick getting started guide.

### Installation

I'm assuming here, that you already have `zsh` and `oh-my-zsh` installed. 😎

Let's install `aws-vault`. Here's the complete list of [installation steps](https://github.com/99designs/aws-vault#installing) for most available platforms. 

We'll be doing everything for OS X:

```sh
brew cask install aws-vault
```

### Choosing aws-vault backend

`aws-vault` supports several backends to store your credentials. My preference is to use an encrypted file. So, you need to add the following variable to your `~/.zshrc`:

```sh
export AWS_VAULT_BACKEND="file"
```

### Moving credentials

Now open your `~/.aws/credentials` file. For every existing profile add credentials to `aws-vault`

```sh
cat ~/.aws/credentials

aws-vault add <profile_1>
aws-vault add <profile_2>
```

Now, `aws-vault` has `AWS_VAULT_FILE_PASSPHRASE` variable, which can be used to stop `aws-vault` from asking your vault password over and over again. There're two ways to use it:

#### Not secure

Add the following variable to your `~/.zshrc` or `~/.bashrc` file, to prevent `aws-vault` for asking for your password every single time:

```sh
export AWS_VAULT_FILE_PASSPHRASE="my_strong_password"
```

#### Secure

Instead of storing `AWS_VAULT_FILE_PASSPHRASE` variable in `.*rc` files, you may create [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) `SecureString` parameter, which contains your `aws-vault` password:

```sh
aws ssm put-parameter \
  --name '/laptop/aws-vault/password' \
  --description 'aws-vault password on my laptop' \
  --value 'my_super_secret_password' \
  --type SecureString
```

{{< my-picture name="AWS Systems Manager -  Parameter Store - New SecretString key" >}}

Let's create wrapper script, which will call aws-vault call `aws-vault` and set up `AWS_VAULT_FILE_PASSPHRASE` with necessary value from AWS Systems Manager Parameter Store:

```sh
mkdir -p $HOME/bin
cat > $HOME/bin/call-aws-vault.sh <<- EOF
#!/usr/bin/env bash

export PROFILE=\$1
export AWS_VAULT_FILE_PASSPHRASE=\$(aws ssm get-parameters --profile default --names '/laptop/aws-vault/password' --with-decryption --query 'Parameters[0].Value' --output text)

aws-vault exec -j \$PROFILE
EOF

chmod +x $HOME/bin/call-aws-vault.sh
```

Now you may use this wrapper at `~/.aws/config` like that:

```ini
[profile my_new_profile]
credential_process = /<full_path_to_your_home_folder>/bin/call-aws-vault.sh my_new_profile
```

You may rename `~/.aws/credentials` and later on completely delete it as soon as you test everything.

### Switching AWS profiles

To list all your AWS profiles, just type:

```sh
aws-vault list
```

Great, now you can easily switch your environment and see, where you're working:

```sh
aws-vault exec <profile_name>
```

Here's how it finally looks like:

{{< my-picture name="zsh-and-aws-vault-integration" >}}

## Role-based approach

Well, ok, we just moved all our AWS credentials to a secure vault and configured our terminal to display our current `aws-vault` session. Now it's time to discuss, how we can improve the solution even more.

### Multi-account organization

One of best practices for organizing AWS users' access to different AWS accounts - is managing all IAM users in one AWS account and providing access to another AWS accounts by allowing them to consume roles (`sts:AssumeRole` call) from that accounts.

Here's the typical AWS Organization example:

{{< my-picture name="AWS-Organizations-structure-example" >}}

AWS provided a great explanation of [How to Use a Single IAM User to Easily Access All Your Accounts by Using the AWS CLI](https://aws.amazon.com/blogs/security/how-to-use-a-single-iam-user-to-easily-access-all-your-accounts-by-using-the-aws-cli/) in their blog post, where they describing role consuming process and `awscli` configuration. I'll not copy-paste them. Instead, we'll concentrate on `aws-vault` configuration to do a similar thing, but without `~/.aws/credentials` file.

Assuming you already have all the necessary grants and permissions between your accounts... If not, here's the great article on that topic - [Tutorial: Delegate Access Across AWS Accounts Using IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html).

### Default profile setup

You should already have your `default` profile setup in place at `~/.aws/config` file. Probably, it looks something like that:

```ini
[profile default]
region = us-east-1
```

Let's configure `aws-vault` as a credential source for our `default` profile:

```ini
[profile default]
region = us-east-1
credential_process = /usr/local/bin/aws-vault exec -j default
```

Now, if you grant permissions to your user or role from `default` profile to assume AWS role from another account, you'll be able to specify new profiles configuration like that:

```ini
[profile default]
region = us-east-1
credential_process = /usr/local/bin/aws-vault exec -j default
mfa_serial = arn:aws:iam::<account_id>:mfa/admin

[profile account_1_role_admin]
region = us-east-1
role_arn = arn:aws:iam::<account_id>:role/admin
source_profile = default

[profile account_2_role_qa]
region = us-east-1
role_arn = arn:aws:iam::<account_id>:role/qa
source_profile = default
```

`source_profile` configuration option will tell `awscli`, which account to use to grab role for any given profile.

{{< my-picture name="AWS-STS-Assume-Role" >}}

### Testing

The fastest way to test, that you're able to assume the role, is to call:

```sh
aws sts get-caller-identify
```

You should see something similar for your `default` profile:

```json
{
    "UserId": "AIDDRCTFVGBHNJMGF3WI7R",
    "Account": "01234567890",
    "Arn": "arn:aws:iam::01234567890:user/admin"
}
```

To test any other profile call:

```sh
aws sts get-caller-identity --profile account_1_role_admin
```

You should see output similar to the following:

```json
{
    "UserId": "AROALKJHGFGDFV3IR2VSI:botocore-session-1584897134",
    "Account": "012345678901",
    "Arn": "arn:aws:sts::012345678901:assumed-role/admin/botocore-session-1584897134"
}
```

### Bonus: Passwordless AWS Web console login

As a small bonus to those of you, who came to the end, here's how to login to AWS web console for every given profile:

```sh
aws-vault login <profile name>
```

## Summary

Using `zsh`, `aws-vault`, and AWS `sts:AssumeRole` feature together can significantly simplify and make more secure management of multiple AWS accounts and their credentials.

If you like the article, please, feel free to spread it to the world.

And of cause, if you have any questions, suggestions or comments, feel free to use Disqus below.
