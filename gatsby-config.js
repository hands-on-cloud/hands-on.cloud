module.exports = {
    siteMetadata: {
        title: `Your hands-on.cloud experience`,
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
                ],
            },
        },
    ],
}