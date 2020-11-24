//locals {
//  mysql_labels = {
//    App = "wordpress"
//    Tier = "mysql"
//  }
//}

resource "kubernetes_deployment" "mysql" {
  metadata {
    name = "mysql"
    labels = local.mysql_labels
  }
  spec {
    replicas = 1
    selector {
      match_labels = local.mysql_labels
    }
    template {
      metadata {
        labels = local.mysql_labels
      }
      spec {
        container {
          image = "mysql:5.6"
          name  = "mysql"
          port {
            container_port = 3306
          }
          env {
            name = "MYSQL_ROOT_PASSWORD"
            value_from {
              secret_key_ref {
                name = "mysql-pass"
                key = "password"
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "mysql-service" {
  metadata {
    name = "mysql-service"
  }
  spec {
    selector = local.mysql_labels
    port {
      port        = 3306
      target_port = 3306
    }
    type = "NodePort"
  }
}
