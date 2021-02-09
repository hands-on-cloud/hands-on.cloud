# Haands-On.Cloud Hugo Serverless Blog

I stopped the development of this blog as maintenance become a very time-consuming thing.

All articles have been migrated to WordPress.

This repository is no longer maintained but will stay here in read-only mode.

<p align="center">
  <a href="https://gohugo.io">
    <img alt="Hugo" src="https://raw.githubusercontent.com/gohugoio/gohugoioTheme/master/static/images/hugo-logo-wide.svg?sanitize=true" width="120" />
  </a> <br />
  <a href="https://hands-on.cloud">
    <img alt="hands-on.cloud" src="./hugo/themes/hands-on-cloud/static/assets/images/hands-on.cloud-logo.png" width="120" />
  </a>
</p>
<h1 align="center">
  hands-on.cloud - Hugo based Serverless Blog
</h1>

[![CircleCI](https://circleci.com/gh/hands-on-cloud/hands-on.cloud.svg?style=svg)](https://circleci.com/gh/hands-on-cloud/hands-on.cloud)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhands-on-cloud%2Fhands-on.cloud.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhands-on-cloud%2Fhands-on.cloud?ref=badge_shield)

## ✍️ Adding articles

```sh
hugo new 'My Article Name/index.md'
```

Pull request workflow described in detail at our [For Authors](https://hands-on.cloud/for-authors/) blog page.

## 🚀 Quick start

1.  **Set up your development environment**

    Set up your development environment using [this part](https://gohugo.io/getting-started/) of Hugo Tutorial.

1.  **Developing with Hugo.**

    Do not need to do anything special, just

    ```sh
    hugo server -D
    ```

1.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:1313/`!

    Open `hugo` project directory in your code editor of choice and edit any content inside `hugo/content/`. Save your changes and the browser will update in real time!

## 🎓 Learning Hugo

Looking for more guidance? Full documentation for Hugo lives [on the website](https://gohugo.io). 

## 💫 Deploy

1.  **Terraform configuration**

    - Change Terraform backend configuration in `infrastructure.tf` file.

    - Change `root_domain_name` variable to your Route53 hosted zone name.

    - Create your static website AWS infrastructure by running:

      ```sh
      terrafrom plan
      terraform apply
      ```

1.  **Generate Hugo static content**

    ```sh
    hugo -v -d ./public
    ```

1.  **Publish test changes**

    ```sh
    aws s3 sync ./public s3://$(terraform output test_website_bucket)
    ```

1.  **Validate your changes**

    ```sh
    open $(terraform output test_website_url)
    ```

1.  **Publish production changes**

    ```sh
    aws s3 sync ./public s3://$(terraform output origin_website_bucket)
    ```

## Image manipulation

The most comfortable and easy way of doing this is to use [Photopea](https://www.photopea.com/) - online free Photoshop alternative.

## Converting `.png` to `.webp`

The following command will create `.webp` images from `.png`:

```sh
./scripts/generate_images.sh
```

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fandreivmaksimov%2Fhands-on.cloud.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fandreivmaksimov%2Fhands-on.cloud?ref=badge_large)
