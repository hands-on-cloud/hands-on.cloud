---
title: 'How to build Python Data Science Docker container based on Anaconda'
date: '2017-12-13'
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
  - Machine Learning
authors:
  - Andrei Maksimov
---

{{< my-picture name="How-to-build-Python-Data-Science-Docker-container-based-on-Anaconda" >}}

Last time we’ve created [Docker container with Jupiter, Keras, Tensorflow, Pandas, Sklearn and Matplotlib](/how-to-run-jupiter-keras-tensorflow-pandas-sklearn-and-matplotlib-in-docker-container). Suddenly, I understood, that I’ve missed OpenCV for Docker image and video manipulations. Well, I spent whole day preparing new image build. And in this article I’ll show you how to do it much faster using [Anaconda](https://anaconda.org/) official [Docker Image](https://hub.docker.com/r/continuumio/anaconda3/).

There’re two ways to do that.

## Traditional way

Thanks to [Adrian Rosebrock](https://www.pyimagesearch.com/author/adrian/) and his article "[Ubuntu 16.04: How to install OpenCV](https://www.pyimagesearch.com/2016/10/24/ubuntu-16-04-how-to-install-opencv/)" which helped me to update my container image (please, feel free to check updated [Dockerfile](https://github.com/andreivmaksimov/python_data_science/blob/master/Dockerfile)), but… building OpenCV from sources is great challenge.

It takes ~1 hour on usual laptop and can not be build on free [Travis-CI](https://travis-ci.org/) account because of it’s [build timeouts](https://docs.travis-ci.com/user/customizing-the-build#Build-Timeouts). That’s why we’ve migrated to [CircleCI](https://circleci.com/).

## Much faster way

Nobody wants to wait so much time, that’s why we’ve decided to build the same image, but based on Anaconda.

> Anaconda is a freemium open source distribution of the Python and R programming languages for large-scale data processing, predictive analytics, and scientific computing, that aims to simplify package management and deployment. ([Wikipedia](<https://en.wikipedia.org/wiki/Anaconda_(Python_distribution)>))

We’ve used the same [sources](https://github.com/andreivmaksimov/python_data_science/), but completely changed `Dockerfile`. Now it looks like this:

```docker
FROM continuumio/anaconda3
MAINTAINER "Andrei Maksimov"

RUN apt-get update && apt-get install -y libgtk2.0-dev && \
    rm -rf /var/lib/apt/lists/* && \
    /opt/conda/bin/conda install jupyter -y && \
    /opt/conda/bin/conda install -c menpo opencv3 -y && \
    /opt/conda/bin/conda install numpy pandas scikit-learn matplotlib seaborn pyyaml h5py keras -y && \
    /opt/conda/bin/conda upgrade dask && \
    pip install tensorflow imutils

RUN ["mkdir", "notebooks"]

COPY jupyter_notebook_config.py /root/.jupyter/
COPY run_jupyter.sh /

# Jupyter and Tensorboard ports
EXPOSE 8888 6006

# Store notebooks in this mounted directory
VOLUME /notebooks

CMD ["/run_jupyter.sh"]
```

As you can see, we’re installing just only libgtk2.0 for OpenCV support and all the other components like Terraform, Pandas, Scikit-learn, Matplotlib, Keras and others using conda package manager.

## Results

Using Anaconda makes your Docker images heavy. For example:

```sh
docker images

REPOSITORY                      TAG                 IMAGE ID            CREATED             SIZE
amaksimov/python_data_science   latest              028b5d36fc45        About an hour ago   2.58GB
amaksimov/python_data_science   anaconda3           a944d0507eee        2 hours ago         3.96GB
```

The old way of installing all the components inside the container image including OpenCV building process takes ~1 hour, but we’re getting 2,5 Gb ready for use image size.

At the same time much faster container creation time (~5-10 minutes) using Anaconda’s package manager gives us ~1,5 Gb of data.

Now it’s your time to choose. Build Time vs. Docker Image size.

## How to add packages to container

As soon as you’ve launched Jupyter, some packages may be missing for you and it’s OK. Feel free to to run the following command in a cell of your Jupyter notebook:

```sh
!pip install requests
```

Or for conda:

```sh
!conda install scipy
```

Hope, this article was helpful for you. If so, please like or repost it. See you soon!
