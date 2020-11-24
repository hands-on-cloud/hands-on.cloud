resource "kubernetes_secret" "mysql-pass" {
  metadata {
    name = "mysql-pass"
  }
  data = {
    password = "root"
  }
}


