const path = require(`path`);
const _ = require('lodash');

const { createFilePath } = require(`gatsby-source-filesystem`);
const createPaginatedPages = require('gatsby-paginate');

const tagSet = new Set();
const categorySet = new Set();

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });
    createNodeField({
      node,
      name: `slug`,
      value: _.kebabCase(slug),
    });
  }
};

exports.createPages = ({ graphql, actions }) => {
  // **Note:** The graphql function call returns a Promise
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise for more info
  const { createPage } = actions;

  const blogPostTemplate = path.resolve('src/templates/blog-post.js');
  const tagTemplate = path.resolve('src/templates/tag.js');
  const categoryTemplate = path.resolve('src/templates/category.js');

  return graphql(`
    {
      site {
        siteMetadata {
          title
          description
        }
      }
      allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
        edges {
          node {
            id
            frontmatter {
              title
              date(formatString: "DD MMM YYYY")
              thumbnail {
                relativePath
                childImageSharp {
                  fluid(maxWidth: 700) {
                    src
                  }
                }
              }
              tags
              category
            }
            fields {
              slug
            }
            excerpt
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    const posts = result.data.allMarkdownRemark.edges;

    createPaginatedPages({
      edges: posts,
      createPage,
      pageTemplate: 'src/templates/index.js',
      pageLength: 6, // This is optional and defaults to 10 if not used
      pathPrefix: '', // This is optional and defaults to an empty string if not used
      context: {}, // This is optional and defaults to an empty object if not used
    });

    posts.forEach(({ node }) => {
      // Generating tags set
      if (node.frontmatter.tags) {
        node.frontmatter.tags.forEach(tag => {
          tagSet.add(tag);
        });
      }

      // Generating categories set
      if (node.frontmatter.category) {
        categorySet.add(node.frontmatter.category);
      }

      // Create post detail pages
      createPage({
        path: node.fields.slug,
        component: blogPostTemplate,
        context: {
          // Data passed to context is available
          // in page queries as GraphQL variables.
          slug: node.fields.slug,
        },
      });
    });

    // Generating tags pages
    const tagList = Array.from(tagSet);
    tagList.forEach(tag => {
      createPage({
        path: `/tags/${_.kebabCase(tag)}/`,
        component: tagTemplate,
        context: {
          tag,
        },
      });
    });

    const categoryList = Array.from(categorySet);
    categoryList.forEach(category => {
      createPage({
        path: `/${_.kebabCase(category)}/`,
        component: categoryTemplate,
        context: {
          category,
        },
      });
    });
  });
};
