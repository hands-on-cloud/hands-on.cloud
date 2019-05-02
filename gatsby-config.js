const favicon_image = './src/assets/images/hands-on.cloud-logo.png';

module.exports = {
  siteMetadata: {
    title: `Your hands-on.cloud experience`,
    siteUrl: `https://hands-on.cloud`,
    description: `This open source project provides hands-on materials on different aspects of working in the clouds like AWS and GCP.`,
    author: 'Andrei Maksimov',
    canonicalUrl: 'https://hands-on.cloud',
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
        slug: 'other',
        name: 'Other',
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
        name: 'Hands-On.Cloud',
        short_name: 'Hands-On.Cloud',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#6b37bf',
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: 'minimal-ui',
        icon: favicon_image,
      },
    },
    {
      resolve: `gatsby-plugin-favicon`,
      options: {
        logo: favicon_image,
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
    `gatsby-plugin-netlify`,
  ],
};
