---
title: '{{ .Name  | title }}'
date: {{ .Date }}
image: '{{ replace .Name " " "-" | title }}'
tags:
  - linux
  - ubuntu
  - docker
  - kubernetes
  - k8s
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

{{< my-picture name="My-Image-Name" >}}
