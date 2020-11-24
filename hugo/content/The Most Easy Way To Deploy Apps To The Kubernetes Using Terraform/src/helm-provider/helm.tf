provider "helm" {
  kubernetes {
    config_context = "minikube"
  }
}

resource "helm_release" "mysql" {
  name  = "mysql"
  chart = "${abspath(path.root)}/charts/mysql-chart"
}

resource "helm_release" "wordpress" {
  name  = "wordpress"
  chart = "${abspath(path.root)}/charts/wordpress-chart"
}
