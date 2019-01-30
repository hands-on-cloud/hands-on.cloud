module.exports = {
    siteMetadata: {
        title: `Your hands-on.cloud experience`,
        description: `
          This open source project provides hands-on
          materials on different aspects of working in the clouds
          like AWS and GCP.
        `,
        canonicalUrl: 'https://hands-on.cloud',
        categories: [
            {
                slug: 'aws',
                name: 'AWS'
            },
            {
                slug: 'gcp',
                name: 'GCP'
            },
            {
                slug: 'ml',
                name: 'ML'
            },
            {
                slug: 'terraform',
                name: 'Terraform'
            },
            {
                slug: 'other',
                name: 'Other'
            }
        ]
    },
    plugins: [
        {
            resolve: `gatsby-source-filesystem`,
            options: {
              name: `src`,
              path: `${__dirname}/src/`,
            },
        },
        `gatsby-transformer-sharp`,
        `gatsby-plugin-sharp`,
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: `gatsby-remark-images`,
                        options: {
                            maxWidth: 1024,
                            quality:	100,
                        },
                    },
                    {
                        resolve: `gatsby-remark-prismjs`,
                        options: {
                            classPrefix: "language-",
                            inlineCodeMarker: null,
                            aliases: {
                                sh: "bash"
                            },
                            showLineNumbers: false,
                            noInlineHighlight: false,
                        },
                    },
                ],
            },
        },
    ],
}