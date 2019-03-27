<!-- AUTO-GENERATED-CONTENT:START (STARTER) -->
<p align="center">
  <a href="https://hands-on.cloud">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  hands-on.cloud - Gatsby based Serverless Blog
</h1>

[![CircleCI](https://circleci.com/gh/andreivmaksimov/hands-on.cloud.svg?style=svg)](https://circleci.com/gh/andreivmaksimov/hands-on.cloud)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fandreivmaksimov%2Fhands-on.cloud.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fandreivmaksimov%2Fhands-on.cloud?ref=badge_shield)

## 🚀 Quick start

1.  **Set up your development environment**

    Set up your development environment using [this part](https://www.gatsbyjs.org/tutorial/part-zero/) of Gatsby Tutorial.

1.  **Gatsby developing.**

    Do not need to do anything special, just

    ```sh
    gatsby develop
    ```

1.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:8000`!

    \_Note: You'll also see a second link: `http://localhost:8000/___graphql`. This is a tool you can use to experiment with querying your data. Learn more about using this tool in the [Gatsby tutorial](https://www.gatsbyjs.org/tutorial/part-five/#introducing-graphiql).\_

    Open this project directory in your code editor of choice and edit `src/pages/index.js`. Save your changes and the browser will update in real time!

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.org/). Here are some places to start:

- **For most developers, we recommend starting with [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.org/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to documentation](https://www.gatsbyjs.org/docs/).** In particular, check out the _Guides_, _API Reference_, and _Advanced Tutorials_ sections in the sidebar.

## 💫 Deploy

1.  **Terraform configuration**

    * Change Terraform backend configuration in `infrastructure.tf` file.

    * Change `root_domain_name` variable to your Route53 hosted zone name.

    * Create your static website AWS infrastructure by running:

      ```sh
      terrafrom plan
      terraform apply
      ```

1.  **Generate Gatsby static content**

      ```sh
      gatsby build
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

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fandreivmaksimov%2Fhands-on.cloud.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fandreivmaksimov%2Fhands-on.cloud?ref=badge_large)