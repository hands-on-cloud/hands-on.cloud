const website = require('./config/website');

const pathPrefix = website.pathPrefix === '/' ? '' : website.pathPrefix;

module.exports = {
  pathPrefix: website.pathPrefix,
  siteMetadata: {
    title: website.title,
    siteUrl: website.url + pathPrefix, // For gatsby-plugin-sitemap
    pathPrefix,
    description: website.description,
    banner: website.logo,
    headline: website.headline,
    siteLanguage: website.siteLanguage,
    ogLanguage: website.ogLanguage,
    canonicalUrl: website.url,
    author: website.author,
    facebook: website.facebook,
    twitter: website.twitter,

    categories: [
      {
        slug: 'aws',
        name: 'AWS',
      },
      {
        slug: 'gcp',
        name: 'GCP',
      },
      {
        slug: 'ml',
        name: 'ML',
      },
      {
        slug: 'terraform',
        name: 'Terraform',
      },
      {
        slug: 'devops',
        name: 'DevOps',
      },
    ],
  },
  plugins: [
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
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
              quality: 100,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
              aliases: {
                sh: 'bash',
              },
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: website.title,
        short_name: website.titleAlt,
        description: website.description,
        start_url: website.pathPrefix,
        background_color: website.backgroundColor,
        theme_color: website.themeColor,
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: 'minimal-ui',
        icon: website.logo,
      },
    },
    {
      resolve: `gatsby-plugin-favicon`,
      options: {
        logo: website.logo,
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          yandex: false,
          windows: false,
        },
      },
    },
    'gatsby-plugin-offline',
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        sitemapSize: 5000,
      },
    },
    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: 'GTM-MNPN749',
        // Include GTM in development.
        // Defaults to false meaning GTM will only be loaded in production.
        includeInDevelopment: false,
      },
    },
    {
      resolve: 'gatsby-plugin-sentry',
      options: {
        dsn: 'https://2570151402b643bea52671e8a5084cba@sentry.io/1450085',
        // Optional settings, see https://docs.sentry.io/clients/node/config/#optional-settings
        // environment: process.env.NODE_ENV,
        // enabled: (() => ["production", "stage"].indexOf(process.env.NODE_ENV) !== -1)()
      },
    },
    `gatsby-plugin-catch-links`,
    'gatsby-plugin-offline',
    `gatsby-plugin-netlify`,
  ],
};
