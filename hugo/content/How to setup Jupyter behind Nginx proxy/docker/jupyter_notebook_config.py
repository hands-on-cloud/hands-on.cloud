# get the config object
c = get_config()
c.JupyterHub.hub_ip = '0.0.0.0'
c.JupyterHub.hub_connect_ip = 'jupyterhub'
c.Spawner.notebook_dir = '~/'
