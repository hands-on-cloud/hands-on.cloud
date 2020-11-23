---
title: 'How To Remove Git Remote Repository'
date: '2020-11-22'
image: 'How-To-Remove-Git-Remote-Repository'
tags:
  - git
  - ubuntu
categories:
  - Linux
authors:
  - Andrei Maksimov
---

In this article, we'll guide you on how to remove a Git remote repository. We'll cover the difference between local and remote repositories and two possible workflows for Git remote repository. Take a look at our infographics to learn everything in less than one minute!

## What is Git?

Git is a free and open-source distributed version control system. Linus Torvalds designed it in 2005, and now Git is one of the most popular code version control systems in the world. Git helps you to maintain the history of changes that you made during your software development process.

## What is Git Local?

Git is a decentralized distributed version control system. That means that you can store your software code changes on your local PC or remote server. Software changes that you keep locally forming the local repository.

{{< my-picture name="How-To-Remove-Git-Remote-Repository-local-repo" >}}

To create (or initiate) a local repository, you’re using the following command:

```sh
git init
```

To add and commit your changes to your local Git repository, use:

```sh
git add

git commit
```

## What is Git Remote?

To simplify a software development process for distributed teams, people started to use a dedicated server as a central place for code exchange. Git repository at such server is called a remote repository. Nowadays, we have several Git hosting services, such as Bitbucket, Github, or GitLab.

Here’s the most straightforward workflow with one remote repository:

{{< my-picture name="How-To-Remove-Git-Remote-Repository-one-remote-repo" >}}

We can add information about the remote Git repository to our local repository using the following command:

```sh
git remote add origin git-remote-url
```

Where:

* **origin** - is the logical name or remote repository; the **origin** is the default name for the remote repository
* **git-remote-url** - is the URL of the remote repository; usually, you’re getting it at your repository page at GitHub

Cloning a Git repository from a remote server creates the **origin** automatically at your local repository.

For the case of a distributed team using the same remote repository, here’s another diagram:

{{< my-picture name="How-To-Remove-Git-Remote-Repository-one-remote-repo-many-devs" >}}

In the open-source world, team workflow is a bit different. A distributed team is not pushing code changes directly to a single repository, but they send pull-requests. Using pull-requests instead of committing directly to a single repository is a more efficient way to control changes coming to it.

To not overcomplicate the diagram, we’ll show only one developer workflow, working with his remote **origin** and sending pull requests to the **upstream** repository.

{{< my-picture name="How-To-Remove-Git-Remote-Repository-two-remote-repos" >}}

## Removing a Git Remote URL?

Before deleting any records of remote Git repositories, it makes sense to list them first:

```sh
git remote -v
```

{{< my-picture name="git-remote-command" >}}

To remove one of the listed remote repositories, use the following command:

```sh
git remote rm origin
```

This command will remove an **origin** from the remote list:

{{< my-picture name="git-remote-command-2" >}}

The `git remote rm` command removes the specific remote from the `.git/config` file located in your project folder.

Another way to remove the remote repository is to edit the `.git/config` file, but this method is not the most widely-used.

If you’re trying to remove a remote repository that does not exist, Git throws an error.

```sh
git remote rm origin
```

The output is `fatal: No such remote: 'origin'`:

{{< my-picture name="git-remote-rm-command-failed" >}}

Usually, the above error can also be caused by mistyping the remote repository name.

The `git remote rm` command has an alias `git remote remove`, which works in the same way:

```sh
git remote remove git-repository-logical-name
```

## Conclusion.

In this article, you’ve learned how to remove information about the remote Git repository from our local repository.

If you have any questions, please, feel free to reach out in the comments section below.
