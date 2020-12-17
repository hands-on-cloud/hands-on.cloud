---
title: 'Bash If-Else Statements - All You Need to Know About'
date: 2020-12-17T08:00:36-05:00
image: 'Bash-If-Else-Statements-All-You-Need-to-Know-About'
tags:
  - linux
  - bash
categories:
  - Linux
authors:
  - Andrei Maksimov
---

This article covers the fundamentals of Bash shell scripting and describes the most widely used logical constructs including single **if** statement, **if-else** statement, and **elif** statement. In addition to this, we’ll cover the correct way of comparing strings and numbers. Improve your Linux shell experience in 5 minutes!

Whenever you’re an experienced system administrator or beginner Linux user, it is worth to know the fundamentals of shell scripting. This skill gives you the ability to automate repeatable tasks within a single or across multiple servers. Usually, those tasks include software installation and configuration of any system services.

## If statement.

**if** statement serves as a fundamental core for all programming languages. This statement helps to implement decision making logic within your program or a script. That’s why it’s important to understand how to use various **if** statements.

Here’s the basic syntax:

```sh
if [ condition ]
then
  COMMANDS
fi
```

Where:

* **condition** - is the logical operator of the **if**statement.
* **COMMANDS** - commands, that are executed when the condition is **true**.
* **if, then, fi** - are syntax keywords.

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-If-Syntax" >}}

Here’s a list of most often used test condition operators:

| Operator              | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| ! EXPRESSION          | The EXPRESSION is false.                                           |
| -n STRING             | The length of STRING is greater than zero.Text                     |
| -z STRING             | The length of STRING is zero (the STRING it is empty)              |
| STRING1 = STRING2     | STRING1 is equal to STRING2                                        |
| STRING1 != STRING2    | STRING1 is not equal to STRING2                                    |
| INTEGER1 -eq INTEGER2 | INTEGER1 is numerically equal to INTEGER2                          |
| INTEGER1 -gt INTEGER2 | INTEGER1 is numerically greater than INTEGER2                      |
| INTEGER1 -lt INTEGER2 | INTEGER1 is numerically less than INTEGER2                         |
| -e FILE               | FILE exists                                                        |
| -d FILE               | FILE exists and it is a directory                                  |
| -s FILE               | FILE exists and it's size is greater than zero (FILE is not empty. |
| -w FILE               | FILE exists and the write permission is granted.                   |
| -x FILE               | FILE exists and the execute permission is granted.                 |
| -r FILE               | FILE exists and the read permission is granted.                    |

The most interesting thing is that during Bash script execution everything in **[ ]** is passed to the **test** utility, which returns either **true** or **false**. So, if you forget the syntax of the operator, just its man page:

```sh
man test
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-Bash-Condition-Operators-Cheatsheet" >}}

Let’s take a look at the simplest **if** statement example:

```sh
#!/bin/bash
var=2
if [ $var -eq 2 ]
then
  echo "var equals 2"
fi
```

Expected output:

```txt
var equals 2
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-If-Statement-Simplest-Example" >}}

In the example above, we set the variable **var** value to **2**, then we tested if the **var** value equals (**-eq**) **2** and printed the message.

In real life, we’re usually using **if** statements in combination with Bash looping constructs (for-loops, while-loops, until-loops). Here’s an example of using **if** statement with **for**-loop:

```sh
#!/bin/bash
for var in 1 2 3 4 5
do
  if [ $var -eq 3 ]
  then
    echo "Value 3 found"
    break
  fi
  echo var=$var
done
```

Expected output:

```txt
var=1
var=2
Value 3 found
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-If-Statement-In-For-Loop" >}}

In this example we’re walking through the list of numbers from **1** to **5** in the **for**-loop and printing value of the variable, which we just processed. When value 3 is found, we’re breaking the script execution.

In addition to the above examples, you may use result of mathematical calculation in the **if** statement:

```sh
#!/bin/bash
for var in {1..10}
do
  if (( $var % 2 == 0 ))
  then
    echo "$var is even number"
  fi
done
```

In the example above we’re checking even numbers in the range between **1** and **10**.

Expected output:

```txt
2 is even number
4 is even number
6 is even number
8 is even number
10 is even number
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-If-Statement-Mathematical-Calculation" >}}

Now, you may check a Bash command output or execution result. Let’s try to check that the user exists in the **/etc/passwd** file.

```sh
#!/bin/bash
user='root'
check_result=$( grep -ic "^$user" /etc/passwd )
if [ $check_result -eq 1 ]
then
  echo "$user user found"
fi
```

In the example above we’re using **grep** command to search through **/etc/passwd** file:

```sh
grep -ic "^$user" /etc/passwd
```

Where:

* **-i** - case-insensitive search.
* **-c** - return the number of lines found (0 - nothing found; 1 or more when something was found).
* **“^$user”** - search the string which starts (**^**) from the value of **$user** variable.

Everything else within the example should be clear.

Expected output:

```sh
root user found
```

Next, let’s check that **/etc/passwd** file exists:

```sh
#!/bin/bash
file='/etc/passwd'
if [ -s $file ]
then
  echo "$file file found"
fi
```

Expected output:

```txt
/etc/passwd file found
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-File-exists" >}}

## If-else statement.

After getting familiar with the basic **if** statement, let’s take a look how to use Bash **if-else** statement.

Here’s the general syntax:

```sh
if [ condition ]
then
  TRUE_COMMANDS
else
  FALSE_COMMANDS
fi
```

Where:

* **condition** - is the logical operator of the **if** statement.
* **TRUE_COMMANDS** - commands, that are executed if the condition is true.
* **FALSE_COMMANDS** - commands, that are executed if the condition is false.
* **if, then, else, fi** - are syntax keywords.

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-If-Else-Syntax" >}}

To demonstrate how it works, let’s change one example, where we detected even numbers. Now, let’s print which number is even and which is odd:

```sh
#!/bin/bash
for var in {1..10}
do
  if (( $var % 2 == 0 ))
  then
    echo "$var is even number"
  else
    echo "$var is odd number"
  fi
done
```

Here’s an expected output:

```sh
1 is odd number
2 is even number
3 is odd number
4 is even number
5 is odd number
6 is even number
7 is odd number
8 is even number
9 is odd number
10 is even number
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-Even-Odd-Example" >}}

## elif statement.

Now, what if we need to check several different conditions during our script execution? That is also possible using the elif statement, which is a shortcut of “**else if**”.

Here’s how the syntax looks like:

```sh
if [ condition_1 ]
then
  CONDITION_1_COMMANDS
elif [ condition_2 ]
then
  CONDITION_2_COMMANDS
else
  ALL_OTHER_COMMANDS
fi
```

Where:

* **condition_1** - is the logical condition to execute **CONDITION_1_COMMANDS**.
* **CONDITION_1_COMMANDS** - commands, that are executed if the **condition_1** is **true**.
* **CONDITION_2_COMMANDS** - commands, that are executed if the **condition_2** is **true**.
* **ALL_OTHER_COMMANDS** - commands, that are executed when **condition_1** and **condition_2** are **false**.
* **if, then, elif, else, fi** - are syntax keywords.

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-If-Elif-Else-Syntax" >}}

Let’s take a look at the following example:

```sh
#/bin/bash

time=8
if [ $time -lt 10 ]
then
  echo "Good morning"
elif [ $time -lt 20 ]
then
  echo "Good day"
else
  echo "Good evening"
fi
```

In this example we set up a **time** variable to **8** AM and printed a message based on the time value.

Expected output:

```txt
Good morning
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-Good-Morning-Example" >}}

## Nesting if statements.

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-Nesting-IF-Statements" >}}

Now, when we get familiar with the basics, we can finish this topic by learning how to nest if statements.

Here’s an example:

```sh
#/bin/bash

value=5
if [ $value -lt 10 ]
then
  if [ $value -eq 5 ]
  then
    echo "Value equals 5"
  else
    echo "Value not equals 5"
  fi
else
  echo "value is greater than 10"
fi
```

Here’s an expected output:

```txt
Value equals 5
```

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-Nested-If-Example" >}}

## Boolean operators.

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-Boolean-Operators" >}}

It might be useful to check several conditions in a single **if** statement. You may do it by using the following boolean operators:

* **&&** - logical AND.
* **||** - logical OR.

Here’s a quick example:

```sh
#!/bin/bash
username="andrei"
birthday="12/16"
today=$( date +"%m/%d")
if [ $USER = $username ] && [ $today = $birthday ]
then
  echo "Happy birthday\!"
fi
```

In this simple example we’re checking two conditions to be true:

* Username of logged in user should be equal to andrei.
* Today’s date should be 16-th of December.

If both conditions are true, we’re printing “‘Happy birthday!”

## Case statement.

In some situations you may need to have more than 3 elif statements to check in your script. In this case using an elif statement becomes complicated. Bash provides you a better way of handling such situations by using a **case** statement.

Here’s the syntax:

```sh
case VARIABLE in
  VALUE_1)
    COMMANDS_FOR_VALUE_1
    ;;
  VALUE_2)
    COMMANDS_FOR_VALUE_2
    ;;
  *)
    DEFAULT_COMMANDS
    ;;
esac
```

Where:

* **VARIABLE** - the variable which value will be compared with **VALUE_1** or **VALUE_2**.
* **COMMANDS_FOR_VALUE_1** - commands to execute when **VARIABLE** value equals **VALUE_1**.
* **COMMANDS_FOR_VALUE_2** - commands to execute when **VARIABLE** value equals **VALUE_2**.
* **DEFAULT_COMMANDS** - commands to execute when **VARIABLE** value was not equal to one of the upper conditions.
* **case**, **in**, **esac** - syntax keywords.

{{< my-picture name="Bash-if-Else-Statements-All-You-Need-to-Know-About-Case-Statement" >}}

Here’s the very common pattern to process input to the script and start, stop or restart the service based on the user input:

```sh
#!/bin/bash

case $1 in
  start)
    echo "Starting the service"
    ;;
  stop)
    echo "Stopping the service"
    ;;
  restart)
    echo "Restarting the service"
    ;;
  *)
    echo "Unknown action"
    ;;
esac
```

In this example we’re checking the value of the special **$1** Bash variable. It contains the first argument, provided to a script. For example, if you save the above example in a file **service.sh** and execute it like this:

```sh
bash service.sh start
```

**$1** will contain the word “start” as its value.

The rest is handled by the case statement logic.

## Conclusion.

In this article we covered the fundamentals of Bash shell scripting and described the most widely used logical constructs including single **if** statement, **if-else** statement, and **elif** statement.

We hope you found this article useful. If yes, please, please, help us to spread it to the world!
