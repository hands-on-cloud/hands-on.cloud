---
title: "How to setup Jupyter behind Nginx proxy"
date: "2019-03-02"
thumbnail: "./How-to-setup-Jupyter-behind-Nginx-proxy.png"
tags: ["jupyter", "nginx"]
category: "other"
---

![How to setup Jupyter behind Nginx proxy](How-to-setup-Jupyter-behind-Nginx-proxy.png)

Last 2 evenings we spent on setup Nginx + Jupyter configuration where Nginx acts as reverse proxy in front of Jupyter which we need to embed in our website by the suburl like `/ipython/`. The question was not so easy. First of all there’re a lot of issues and gists on GitHub and it is very difficult to choose a right one. Also you may find a lot of different articles describing how to do it but.. All of them are pretty much outdated and not covering CORS configuration. So, right now I’ll show you our results.

## JUPYTER CONFIGURATION

We’re packing Jupyter inside a Docker container to provide each of our users their own isolated environment.  We’re using the following configuration placed inside `/root/.jupyter/jupyter_notebook_config.py`:`

```python
# get the config object
c = get_config()  
# in-line figure when using Matplotlib
c.IPKernelApp.pylab = 'inline'
# listen on all interfaces
c.NotebookApp.ip = '*' 
# port configuration
c.NotebookApp.port = 8889
# do not open a browser window by default when using notebooks
c.NotebookApp.open_browser = False
# No token. Always use jupyter over ssh tunnel
c.NotebookApp.token = ''
# Place, where we're mounting Docker volumes with user's notebooks
c.NotebookApp.notebook_dir = '/notebooks'
# Allow to run Jupyter from root user inside Docker container
c.NotebookApp.allow_root = True 
# Setting up Jupyter base URL
c.NotebookApp.base_url = '/ipython/'
# Allowing Jupyter iframe embeddings
c.NotebookApp.trust_xheaders = True 
c.NotebookApp.tornado_settings = {
    'headers': {
        'Content-Security-Policy': "frame-ancestors 'self' http://* https://*",
    }
}
```

## Nginx configuration

As soon as we’ve finished with Jupyter, we can start Nginx configuration. It was not so easy to fix CORS issues, but here’s the result:

```nginx
daemon off;
worker_processes 1;

events { worker_connections 1024; }

http {

    sendfile on;

    upstream ml {
        server 127.0.0.1:8889;
    }

    server {
        listen 8888;

        location ~* /ipython.* {
            proxy_pass http://127.0.0.1:8889;

            proxy_set_header Host $http_host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Real-IP $remote_addr;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header  Referer  http://localhost;
            proxy_set_header Origin "";
        }

        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }

}
```

We’re launching Nginx proxy in the same container where Jupyter placed. Such config makes us able not only to be able to embed Jupyter in our website, but also make AJAX calls to it’s backend.

## CONCLUSION

Hope, this small note will help you to save some time. See you soon!
