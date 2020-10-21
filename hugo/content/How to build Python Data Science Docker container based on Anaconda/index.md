---
title: 'How to build Anaconda Python Data Science Docker container'
date: '2020-08-13'
image: 'How-to-build-Python-Data-Science-Docker-container-based-on-Anaconda'
tags:
  - anaconda
  - docker
  - jupyter
  - keras
  - matplotlib
  - opencv
  - pandas
  - python
  - sklearn
  - tensorflow
categories:
  - AWS
authors:
  - Andrei Maksimov
---

**Update for 2020:**

* Upgraded to Python 3.6.
* Fixed a lots of build issues

Last time we’ve created [Docker container with Jupiter, Keras, Tensorflow, Pandas, Sklearn and Matplotlib](/how-to-run-jupiter-keras-tensorflow-pandas-sklearn-and-matplotlib-in-docker-container). Suddenly, I understood, that I’ve missed OpenCV for Docker image and video manipulations. Well, I spent whole day preparing new image build. And in this article I’ll show you how to do it much faster using [Anaconda](https://anaconda.org/) official [Docker Image](https://hub.docker.com/r/continuumio/anaconda3/).

There’re two ways to do that.

## Simple way

[This process](/how-to-run-jupiter-keras-tensorflow-pandas-sklearn-and-matplotlib-in-docker-container) takes ~7 minutes to build the container of 3.11 Gb in size.

## Anaconda way

When I started playing with ML in 2018 Anaconda was a super fast and easiest way to create Docker container for ML experiments. It was much faster, then to compile OpenCV 3 for Ubuntu 16.04. Today it's vice versa.

I'm using the same [sources](https://github.com/andreivmaksimov/python_data_science/), but changing `Dockerfile`.

Here how it looks like:

```docker
FROM continuumio/anaconda3
MAINTAINER "Andrei Maksimov"

RUN apt-get update && apt-get install -y libgtk2.0-dev && \
    rm -rf /var/lib/apt/lists/*

RUN /opt/conda/bin/conda update -n base -c defaults conda && \
    /opt/conda/bin/conda install python=3.6 && \
    /opt/conda/bin/conda install anaconda-client && \
    /opt/conda/bin/conda install jupyter -y && \
    /opt/conda/bin/conda install --channel https://conda.anaconda.org/menpo opencv3 -y && \
    /opt/conda/bin/conda install numpy pandas scikit-learn matplotlib seaborn pyyaml h5py keras -y && \
    /opt/conda/bin/conda upgrade dask && \
    pip install tensorflow imutils

RUN ["mkdir", "notebooks"]
COPY conf/.jupyter /root/.jupyter
COPY run_jupyter.sh /

# Jupyter and Tensorboard ports
EXPOSE 8888 6006

# Store notebooks in this mounted directory
VOLUME /notebooks

CMD ["/run_jupyter.sh"]
```

As you can see, we’re installing just only libgtk2.0 for OpenCV support and all the other components like Terraform, Pandas, Scikit-learn, Matplotlib, Keras and others using conda package manager.

## Running container

Now you have a working container and it’s time to start it. Create a folder inside your project’s folder where we’ll store all our Jupyter Noteboos with source code of our projects:

```sh
mkdir notebooks
```

And start the container with the following command:

```sh
docker run -it -p 8888:8888 -p 6006:6006 -d -v $(pwd)/notebooks:/notebooks python_data_science_container:anaconda
```

It will start the container and expose Jupyter on port `8888` and Tensorflow Dashboard on port `6006` on your local computer or your server depending on where you’re executed this command.

If you don’t want to create and maintain your own container, please feel free to use my personal container:

```sh
docker run -it -p 8888:8888 -p 6006:6006 -d -v $(pwd)/notebooks:/notebooks amaksimov/python_data_science:anaconda
```

## Installing additional packages

As soon as you’ve launched Jupyter, some packages may be missing for you and it’s OK. Feel free to to run the following command in a cell of your Jupyter notebook:

```sh
!pip install requests
```

Or for conda:

```sh
!conda install scipy
```

Hope, this article was helpful for you. If so, please like or repost it. See you soon!

## Results

Using Anaconda as a base image makes your Docker image heavy. I mean REALLY heavy.

For example:

```sh
docker images

REPOSITORY                          TAG                 IMAGE ID            CREATED             SIZE
amaksimov/python_data_science       anaconda            7021f28dfba1        29 minutes ago      6.36GB
amaksimov/python_data_science       latest              3330c8eaec1c        2 hours ago         3.11GB
```

Installing all the components inside the Ubuntu 20.04 LTS container image including OpenCV 3 takes ~7 minutes, and final image ~3.11 Gb.

At the same time Anaconda3 container creation process takes x2 times longer and it gives you x2 times bigger image (~6.36 Gb). The building process is much more complicated, then it was in 2018, and it took me a while to update configuration to a working state.
