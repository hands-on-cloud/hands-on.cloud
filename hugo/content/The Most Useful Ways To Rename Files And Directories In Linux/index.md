---
title: 'The Most Useful Ways To Rename Files And Directories In Linux'
date: 2020-12-07T08:09:01-05:00
image: 'The-Most-Useful-Ways-To-Rename-Files-And-Directories-In-Linux'
tags:
  - linux
  - mv
  - find
  - rename
  - bash
categories:
  - Linux
authors:
  - Andrei Maksimov
---

The ability to rename files and directories in Linux is one of the primary skills that every Linux user needs. This article shows how to use various ways like file manager, mv, and rename utilities in combination with finding and bash looping constructs. Improve your Linux stills in 3 minutes by reading this article!

Two ways are available for you to rename the directories or files in Linux:

* File manager.
* Command-line terminal.

## Rename files and directories using the file manager.

{{< my-picture name="The-Most-Useful-Ways-To-Rename-Files-And-Directories-In-Linux-Infographics" >}}

One of the easiest ways of renaming files and directories in Linux for new users is using Midnight Commander.

Midnight Commander - is a console-based file manager cloned from the famous Norton Commander.

{{< my-picture name="midnight-commander" >}}

To install Midnight Commander under Ubuntu, use the following command:

```sh
$ sudo apt-get update

$ sudo apt-get -y install mc
```

To install Midnight Commander under CentOS, use a different package manager:

```sh
$ sudo yum -y install mc
```

To launch Midnight Commander, execute **mc** command.

You need to use keyboard arrows to move the file selector. To switch between left and right screens, you need to use the **Tab** key. You may use your mouse too, but you’re limited to select only files, which are visible on the screen.

To rename the file or directory, move the cursor on top of it and press **F6**. If you forgot the exact key, use your mouse to select Move/Rename from the File menu.

{{< my-picture name="midnight-commander-move-files" >}}

Next, let’s look at how we can rename the files and directories by using **mv** and **rename** commands.

## Rename files and directories using the “mv” command.

The **mv** command helps you **m**o**v**e or rename files and directories from the source to the destination location. The syntax for the command is the following:  

```sh
$ mv [OPTIONS] source destination
```

The **source** and **destination** can be a file or directory.

To rename **file1.txt** to **file2.txt** using **mv,** execute the following command:

```sh
$ mv file1.txt file2.txt
```

To change the name of **folder1** directory to **folder2**, use the following command:

```sh
$ mv folder1 folder2
```

### Rename multiple files at once.

The **mv** utility can rename only one file at a time, but you can use it with other commands to rename more than one file. These commands include **find** and Bash **for** and **while** loops.

For example, let’s imagine you need to change the file extension for a specific file type in a directory. In the following example, we rename all HTML files and change their extension from **html** to **php**.

Here’s the **example** folder structure:

```sh
$ tree example
example
├── index.html
├── page1.html
├── page2.html
└── page3.html

0 directories, 4 files
```

Now, let’s use the following Bash for-loop construct inside the **example** directory:

```sh
$ cd example

$ for f in *.html; do
    mv "$f" "${f%.html}.php"
done
```

Here we stepped into the **example** directory. Next, we executed the **mv** command in Bash for-loop (the command between **for** and **done** keywords).

Here’s what’s happening:

* The for-loop is walking through the files ending on the **.html** and putting every file name to the variable **f**.
* Then **mv** utility changes extension of every file **f** from **.html** file to **.php**. A part of the expression **${f%.html}** is responsible for removing the **.html** from the file name. A complete expression **"${f%.html}.php"** will add **.php** to the file name without **.html** part.

Here’s the expected outcome:

```sh
$ ls -l
total 0
-rw-r--r--  1 amaksimov  wheel  0 Dec  5 17:13 index.php
-rw-r--r--  1 amaksimov  wheel  0 Dec  5 17:13 page1.php
-rw-r--r--  1 amaksimov  wheel  0 Dec  5 17:13 page2.php
-rw-r--r--  1 amaksimov  wheel  0 Dec  5 17:13 page3.php
```

## The “find” command to rename files and directories.

Using **find** utility is one of the most common ways to automate file and directory operations in Linux. 

In the example below, we are using the **find** to achieve the same goal and change file extension.

The **find** utility finds all files ending on **.html** and uses the **-exec** argument to pass every found file name to the sh shell script written in one line.

```sh
$ find . -depth -name "*.html" -exec sh -c 'f="{}"; mv "$f" "${f%.html}.php"' \;
```

In the sh script-line, we set the variable **f** with the value of the file name **f=”{}”**, then we’re executing familiar **mv** command. A semicolon is used to split the variable set command from the **mv** command. 

## Rename files and directories using the “rename” command.

In some cases, it is easier to use the **rename** command instead of **mv**. And you can use it to rename multiple files using regular expressions without combining it with other Linux commands.

Here’s the syntax for the **rename** command:

```sh
$ rename [OPTIONS] regexp files
```

For example, let’s rename all **.php** files back to **.html**:

```sh
$ ls
index.php  page1.php  page2.php  page3.php

$ rename 's/.php/.html/' *.php

$ ls
index.html  page1.html  page2.html  page3.html
```

If you wish to print the names of the files that you have selected for renaming, you can use the following command:

```sh
$ rename -n 's/.html/.php/' *.html
rename(index.html, index.php)
rename(page1.html, page1.php)
rename(page2.html, page2.php)
rename(page3.html, page3.php)

$ ls
index.html  page1.html  page2.html  page3.html
```

## Summary.

In this article, you’ve learned how to rename files and directories in Linux using various ways like file manager, mv, and rename utilities combined with find and bash loop-expressions.
