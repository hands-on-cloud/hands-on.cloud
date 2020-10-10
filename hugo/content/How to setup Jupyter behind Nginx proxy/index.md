---
title: 'How to setup Jupyter behind Nginx proxy'
date: '2020-04-12'
image: 'How-to-setup-Jupyter-behind-Nginx-proxy'
tags:
  - jupyter
  - nginx
categories:
  - Machine Learning
authors:
  - Andrei Maksimov
---

The initial version of this article been published over two years ago. Here I'm showing, how to configure Jupyter behind Nginx reverse proxy.

Such configuration is still not very obvious for many people. There’re a lot of issues and gists on GitHub and it is very difficult to choose the right solution for this problem. Also, you may find a lot of different articles describing how to do it, but most of them are outdated and not covering CORS configuration well.

As the topic is still very popular, I decided to renew the article and simplify configuration.

Thanks for your comments below, **Andrew Barker**. Catch the updated version of the article.

## JupyterHub configuration

First, let's create a folder where we'll put all our configuration files.

Here's our final structure:

```sh
mkdir docker
tree docker

docker
├── docker-compose.yaml
├── jupyter_notebook_config.py
└── nginx.conf
```

### Docker Compose

To simplify everything, I created `docker-compose.yaml`, which describes our services:

```yaml
version: "3.7"
services:
  nginx:
    image: nginx:alpine
    volumes:
      - "./nginx.conf:/etc/nginx/nginx.conf:ro"
    ports:
      - 8080:8080
    links:
      - "jupyterhub"
  jupyterhub:
    image: jupyterhub/jupyterhub
    container_name: jupyterhub
    volumes:
      - "./jupyter_notebook_config.py:/root/.jupyter/jupyter_notebook_config.py:ro"
```

The configuration is straightforward - a simple small `nginx` Docker container in front of `jupyterhub`. 

Both launched from their latest versions.

### Nginx configuration

Nginx is sitting on port `8080` and listening on port `8080` as well.

**VERY IMPORTANT:** `nginx.conf` contains reverse proxy configuration.

If your Nginx is sitting on a port other than `80` or `443`, you need to use the following configuration directive:

* `proxy_set_header Host $host:$server_port;`

For Nginx, which is sitting at default ports, use "default" configuration:

* `proxy_set_header Host $host;`

If you make a mistake here, you'll start receiving `Blocking Cross Origin API request for /api/contents` error messages. 

AAgain, the primary reason for these messages - not equal ports for service binding and export for Nginx container.

Here's my `nginx.conf` for listening on port `8080`:

```nginx
worker_processes 1;

events { worker_connections 1024; }

http {

    sendfile on;

    upstream ml {
        server jupyterhub:8000;
    }

    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    server {
        listen 8080;

        location / {
            proxy_pass http://ml;

            proxy_redirect   off;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $host:$server_port;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # websocket headers
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
        }
    }

}
```

### Jupyter configuration

For JupyterHub configuration we’ll use the following configuration placed to `/root/.jupyter/jupyter_notebook_config.py`:

```python
# get the config object
c = get_config()
# JupyterHub listen address
c.JupyterHub.hub_ip = '0.0.0.0'
# JupyterHub connect hostname.
# In our case it's 'jupyterhub' by the name of the service from docker-compose.yaml
c.JupyterHub.hub_connect_ip = 'jupyterhub'
# Location for users notebooks
c.Spawner.notebook_dir = '~/'
```

## Stack launch

I did not have too much time to build a new container and/or play with user authentication settings. The main purpose of this article is to provide a solution for `Blocking Cross Origin API request for /api/contents` issues.

So, here's how you may launch this configuration:

```sh
docker-compose up -d
```

Connect to just launched containers and create a user and install `notebook` package:

```sh
docker exec -it jupyterhub /bin/bash
adduser <your_username>
pip install notebook
```

Now you may connect to JupterHub and use your created username and password as login credentials.

{{< my-picture name="JupyterHub-behind-Nginx-proxy" >}}

## Conclusion

I hope, this small note will help you to save some time. If you found it useful, please, help spread it to the world!
