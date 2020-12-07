---
title: 'The Most Useful Ways to Remove Files and Directories in Linux'
date: 2020-12-03T14:09:01-05:00
image: 'The-Most-Useful-Ways-to-Remove-Files-and-Directories-in-Linux'
tags:
  - linux
  - ubuntu
  - rm
  - find
  - rmdir
  - bash
categories:
  - Linux
authors:
  - Andrei Maksimov
---

This article covered the three most useful ways of deleting files and directories in Linux. We also covered exceptional cases like deleting directories with a massive number of files inside, deleting files or directories with special characters in their names. Improve your Linux skills in just 5 minutes.

## Using the “rmdir” command to remove a Linux directory.

{{< my-picture name="The-Most-Useful-Ways-to-Remove-Files-and-Directories-in-Linux-rmdir-command" >}}

Before you use the **rmdir** command, you must know that you will not recover deleted objects back easily.

Now, open the command line terminal if you’re using Linux or macOS. If you’re using Windows, you may use Windows Subsystem for Linux (WSL).

Before deleting the directory, let’s create it first:

```sh
$ mkdir /tmp/docs
```

Now, let’s delete it by the name **/tmp/docs** using the following command:

```sh
$ rmdir /tmp/docs
```

**rmdir** is a command for removing empty directories. It is quite useful, as you are protected from deleting something important from your file system.

Let’s validate this behavior by putting a file inside a directory, which we’d like to delete:

```sh
$ mkdir -p /tmp/docs

$ touch /tmp/docs/my_file

$ tree /tmp/docs

/tmp/docs
└── my_file

0 directories, 1 file
```

If your directory is not empty, you will receive the following error:

```sh
$ rmdir /tmp/docs
rmdir: /tmp/docs: Directory not empty
```

To delete the directory, which contains files, you need to use the **rm** command:

```sh
$ rm -rf /tmp/docs
```

### Remove several Linux directories using wildcard.

All console commands in Linux can process files and folders using wildcards (*) in the file or folder name. Let’s delete the following folder structure:

```sh
$ tree /tmp/docs
/tmp/docs
├── dir1
├── dir2
└── dir3

3 directories, 0 files
```

To delete all directories, which begins from the **dir** we need to use the following command:

```sh
$ rmdir /tmp/docs/dir*
```

Here’s the expected outcome:

```sh
$ tree /tmp/docs
/tmp/docs

0 directories, 0 files
```

## Using the “rm” command to remove a Linux directory.

{{< my-picture name="The-Most-Useful-Ways-to-Remove-Files-and-Directories-in-Linux-rm-command" >}}

The **rm** command is a general-purpose command which can delete not only directories but files too. But the default behavior of the **rm** command is not allowing you to delete any folders. You can use **-r** or **-R** arguments to delete directories, including the subdirectories.

Let’s imagine we have the following file system structure:

```sh
$ tree /tmp/docs
/tmp/docs
├── dir1
│   └── my_file1
├── dir2
│   └── my_file2
└── dir3
    └── my_file3

3 directories, 3 files
```

If you’d like to delete the **/tmp/docs** directory completely, use the following command:

```sh
$ rm -rf /tmp/docs
```

Where:

* **-r** - an attempt to remove all the subdirectories from a particular directory.
* **-f** - an attempt to remove the files without prior confirmation or permission.

### /bin/rm: Argument list too long.

You may get this error message when you’re trying to delete a directory with many files. This error happens because the number of files provided to the **rm** command is larger than the system limit on the command line argument’s size.

The easiest way to delete such a folder is to use **find** command to delete all the files first, and then delete the directory itself:

```sh
$ find /tmp/docs -type f -delete

$ rm -r /tmp/docs
```

Here:

* **/tmp/docs** - directory for search.
* **-type f** - tells find utility to search files only.
* **-delete** - tells find utility to delete found results.

You may also create an empty folder and use **rsync** utility:

```sh
mkdir empty_dir

rsync -a --delete empty_dir/ /tmp/docs/
```

This is CPU consuming, but the fastest way to cleanup **/tmp/docs** directory.

## Using the “find” command to delete Linux directories.

{{< my-picture name="The-Most-Useful-Ways-to-Remove-Files-and-Directories-in-Linux-find-command" >}}

The find command is a multi-purpose search command-line utility, which requires a separate article on its own, but in our case, we’ll use it to delete the folders.

### Delete all directories by the name pattern.

Let’s delete all directories by the pattern **dir\*** in nested directories names:

```sh
$ tree /tmp/docs
/tmp/docs
├── dir1
│   └── my_file1
├── dir2
│   └── my_file2
└── dir3
    └── my_file3

3 directories, 3 files
```

Use the following command to do that:

```sh
$ find /tmp/docs -type d -name 'dir*' -exec rm -rf {} +

$ tree /tmp/docs
/tmp/docs

0 directories, 0 files
```

Here, the **find** command will return all nested directories which name starts from the **dir**:

```sh
$ find /tmp/docs -type d -name 'dir*'
/tmp/docs/dir2
/tmp/docs/dir3
/tmp/docs/dir1
```

And then it executes the already familiar **rm -rf** command for every finding (that’s why we’re using **{} +** sequence).

### Delete all empty directories in the folder structure.

In many cases, you may want to delete only empty folders within the folder structure. Let’s delete **dir1** and **other_dir** from the following example:

```sh
$ tree /tmp/docs
/tmp/docs
├── dir1
├── dir2
│   └── my_file2
├── dir3
│   └── my_file3
└── other_dir

4 directories, 2 files
```

Here’s how to do that:

```sh
$ find /tmp/docs -type d -empty -delete

$ tree /tmp/docs
/tmp/docs
├── dir2
│   └── my_file2
└── dir3
    └── my_file3

2 directories, 2 files
```

### Delete directory by its inode.

If your directory name contains special character or consists of non-english words, then usual **rm** or **rmdir** command may not work for you. In that case, you can delete that directory by using its inode.

Inode - is an index node number which represents a file or directory on the file system.

You may find file or directory inode number using the following command:

```sh
$ ls -il /tmp/docs
total 0
8669007889 drwxr-xr-x  3 amaksimov  wheel  96 Dec  1 18:48 dir2
8669007891 drwxr-xr-x  3 amaksimov  wheel  96 Dec  1 18:46 dir3
```

In this example, **dir2** folder has inode **8669007889** number.

Now, we can use this information to delete it:

```sh
$ find /tmp/docs -inum 8669007889 -exec rm -rf {} +
```

Here:

* **-inum** - tells find utility to search for the file system object with inode number **8669007889**.
* **-exec rm -rf** - tells find utility to call rm with **-rm** arguments for every finding (**{} +**).

## Summary.

In this article we described three ways of deleting directories in Linux. We also covered special cases like deleting huge folders or directories with special characters in their names.

We hope, you find this article useful. If yes, please, help us to spread it ro the world.

If you know any other interesting use-cases, which may be covered by the article, please, reach us our in the comments section below.
