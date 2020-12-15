---
title: 'Bash For-Loops - The Most Practical Guide'
date: 2020-12-15T07:44:27-05:00
image: 'Bash-For-Loops-The-Most-Practical-Guide'
tags:
  - linux
  - bash
categories:
  - Linux
authors:
  - Andrei Maksimov
---

Bash loops are handy for any system administrator and programmer. Looping constructs in any scripting language allow you to run multiple commands and keep re-running until a specific situation is reached. In simple terms, loops are useful for automating repetitive tasks. There are three loop constructs in a shell scripting language:

* **While**-loop.
* **For**-loop.
* **Until**-loop.

A **for**-loop is an iteration statement in Bash language used to perform a set of actions. You can use it on a shell prompt or within a shell script itself. It operates on lists of items and repeats a set of commands for every item in the list.

In this tutorial, we will show you how to use **for**-loop in Bash with examples.

## Basic Syntax.

{{< my-picture name="Bash-for-loops-The-most-practical-guide-Basic-syntax" >}}

The basic syntax of **for**-loop is shown below:

```sh
for item in [LIST]
do
  COMMANDS
done
```

Where:

* **LIST** is a series of strings or numbers separated by spaces.
* **COMMANDS** is a set of commands that executes over a list of items.
* **for**, **in**, **do,** and **done** are loop syntax keywords.
* **item** is a Bash variable name used to get access to the item from the list.

## Iterating over numbers.

{{< my-picture name="Bash-for-loops-The-most-practical-guide-Loop-syntax-iterating-numbers" >}}

You can use **for**-loops to iterate through a series of numbers or numeric list until the list is exhausted.

In the following example, **for**-loop iterates through numbers **1 2 3 4 5**.

```sh
#!/bin/bash
for var in 1 2 3 4 5
do
 echo "Number is $var"
done
```

You should get the following output:

```txt
Number is 1
Number is 2
Number is 3
Number is 4
Number is 5
```

In the above example, **for**-loop takes each item from the list, stores them in the variable **var**, and executes the commands between **do** and **done**.

You can also specify a range of numbers by defining the range of values.

{{< my-picture name="Bash-for-loops-The-most-practical-guide-Iterating-over-range" >}}

In the following example, for loops iterates through all numbers from **10** to **15**.

```sh
#!/bin/bash
for var in {10..15}
do
 echo "Number is $var"
done
```

You should get the following output:

```txt
Number is 10
Number is 11
Number is 12
Number is 13
Number is 14
Number is 15
```

When you use a specific range within **for**-loop, you can also specify an increment to increment each number.

{{< my-picture name="Bash-for-loops-The-most-practical-guide-Iterating-with-Increment" >}}

In the following example, **for**-loop iterates through a range of numbers from **0** to **10**  and increment each number by **2**:

```sh
#!/bin/bash
for var in {0..10..2}
do
 echo "Number is $var"
done
```

You should get the following output:

```txt
Number is 0
Number is 2
Number is 4
Number is 6
Number is 8
Number is 10
```

## Iterating over strings.

{{< my-picture name="Bash-for-loops-The-most-practical-guide-Loop-iterating-over-strings" >}}

You can also use **for**-loop to iterate over a list of strings.

In the following example, for loops iterates through a list of strings one by one:

```sh
#!/bin/bash
for month in Jan Feb Mar Apr May Jun
do
 echo "Month is $month"
done
```

You should get the following output:

```txt
Month is Jan
Month is Feb
Month is Mar
Month is Apr
Month is May
Month is Jun
```

## Iterating over an array.

{{< my-picture name="Bash-for-loops-The-most-practical-guide-Iterating-over-array" >}}

You can loop through the array elements using the **for**-loop.

In the following example, for loops iterates all elements in the CARS array:

```sh
#!/bin/bash
CARS=('Maruti' 'Toyota' 'BMW' 'Tata' 'Datsun')
for car in "${CARS[@]}"; do
  echo "Car: $car"
done
```

You should get the following output:

```txt
Car: Maruti
Car: Toyota
Car: BMW
Car: Tata
Car: Datsun
```

{{< my-picture name="Bash-for-loops-The-most-practical-guide-Iterating-over-string-words" >}}

In the following example, for-loops iterates all elements in a weekday array.

```sh
#!/bin/bash
i=1
weekdays="Mon Tue Wed Thu Fri"
for day in $weekdays
do
 echo "Weekday $((i++)): $day"
done
```

You should get the following output:

```txt
Weekday 1: Mon
Weekday 2: Tue
Weekday 3: Wed
Weekday 4: Thu
Weekday 5: Fri
```

## Infinite for-loops.

You can create an infinite for loop using the empty expressions.

```sh
#!/bin/bash
for (( ; ; ))
do
   echo "Infinite Loops [ press CTRL+C to stop]"
done
```

You should get the following output:

```txt
Infinite Loops [ press CTRL+C to stop]
Infinite Loops [ press CTRL+C to stop]
Infinite Loops [ press CTRL+C to stop]
Infinite Loops [ press CTRL+C to stop]
Infinite Loops [ press CTRL+C to stop]
Infinite Loops [ press CTRL+C to stop]
Infinite Loops [ press CTRL+C to stop]
```

You can press **CRTL+C** to stop the infinite loop.

## Break statement in for-loop.

You can use the **break** statement inside the **for**-loop to exit from the loop earlier.

In the following example, **for**-loop iterates through numbers between **20** to **30**. We will use **if**-statement to exit from the **for**-loop once the current iterated item is equal to **27**.

```sh
#!/bin/bash
for var in {20..30}
do
  if [[ "$var" == '27' ]]; then
    break
  fi
  echo "Number is: $var"
done
```

You should get the following output:

```txt
Number is: 20
Number is: 21
Number is: 22
Number is: 23
Number is: 24
Number is: 25
Number is: 26
```

## **Continue statement in for-loops**.

The continue statement is used inside loops. When a continue statement is encountered inside a loop, the control flow jumps to the beginning of the loop for the next iteration, skipping the execution of statements inside the body of the loop for the current iteration.

In the following example, for loops iterates through numbers between **10** to **15**. When the current iterated item is equal to **13**, the continue statement will stop the execution, return to the beginning of the loop and continue with the next iteration:

```sh
#!/bin/bash
for var in {10..15}
do
  if [[ "$var" == '13' ]]; then
    continue
  fi
  echo "Number is: $var"
done
```

You should get the following output:

```sh
Number is: 10
Number is: 11
Number is: 12
Number is: 14
Number is: 15
```

## Bash for-loop advance examples.

### Rename File Extension.

This section will show you how to change the extension of all files using the Bash **for**-loop.

The following example will change the extension of all files in the current directory from **.php** to **.html**.

```sh
#!/bin/bash
for file in *.php; do
  mv "$file" "${file%.php}.html"
  echo $file is renamed to "${file%.php}.html"
done
```

You should get the following output:

```txt
admin.php is converted to admin.html
ajax.php is converted to ajax.html
composer.php is converted to composer.html
index.php is converted to index.html
login.php is converted to login.html
```

### Display Number of Times in a Row.

In this example, we will display the current system time every 2 seconds.

```sh
#!/bin/bash
for now in {1..5}
do
  date
  sleep 2
done
```

You should get the following output:

```txt
Fri Dec  4 12:19:10 IST 2020
Fri Dec  4 12:19:12 IST 2020
Fri Dec  4 12:19:14 IST 2020
Fri Dec  4 12:19:16 IST 2020
Fri Dec  4 12:19:18 IST 2020
```

### Untar Multiple Tar Files.

You can untar multiple tar files using the bash for loops easily.

The following example will extract all tar files located inside the current directory:

```sh
#!/bin/bash
for var in *.tar
do
  echo "Processing $var..."
  tar -xf "$var"
done
```

### Ping Multiple Server.

You can use Bash **for**-loop to ping several servers from the list.

First, create a file named domain.txt and add all servers to this file, as shown below:

```sh
cat domain.txt
```

Add the following lines:

```txt
google.com
facebook.com
yahoo.com
wordpress.com
```

Now, use for loops to ping all servers listed in the domain.txt file as shown below:

```sh
#!/bin/bash
for var in $(cat domain.txt)
do
  ping -c 1 "$var"
done
```

You should get the following output:

```txt
PING google.com (216.58.203.14) 56(84) bytes of data.
64 bytes from hkg12s09-in-f14.1e100.net (216.58.203.14): icmp_seq=1 ttl=117 time=119 ms
 
--- google.com ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 119.469/119.469/119.469/0.000 ms
PING facebook.com (69.171.250.35) 56(84) bytes of data.
64 bytes from edge-star-mini-shv-01-any2.facebook.com (69.171.250.35): icmp_seq=1 ttl=56 time=43.9 ms
 
--- facebook.com ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 43.994/43.994/43.994/0.000 ms
PING yahoo.com (74.6.231.21) 56(84) bytes of data.
64 bytes from media-router-fp74.prod.media.vip.ne1.yahoo.com (74.6.231.21): icmp_seq=1 ttl=51 time=371 ms
 
--- yahoo.com ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 371.135/371.135/371.135/0.000 ms
PING wordpress.com (192.0.78.9) 56(84) bytes of data.
64 bytes from 192.0.78.9: icmp_seq=1 ttl=56 time=40.1 ms
 
--- wordpress.com ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 40.162/40.162/40.162/0.000 ms
```

### List Files with Conditions.

You can also use bash for loops to list all files inside a specific directory matching specific conditions.

For example, list all **.conf** files inside **/etc** directory that begins with either **a**, **b**, **c** or **d** letters:

```sh
#!/bin/bash
i=1
for file in /etc/[abcd]*.conf
do
  echo "File $((i++)) : $file"
done
```

You should get the list of all files in the following output:

```txt
File 1 : /etc/adduser.conf
File 2 : /etc/apg.conf
File 3 : /etc/blkid.conf
File 4 : /etc/brltty.conf
File 5 : /etc/ca-certificates.conf
File 6 : /etc/colord.conf
File 7 : /etc/debconf.conf
File 8 : /etc/deluser.conf
```

## Conclusion.

In the above guide, you learned Bash **for**-loops with different examples. We hope you can now easily use bash for-loops to automate your day to day tasks.
