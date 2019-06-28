const fs = require('fs');

const path = require(`path`);

const HashMap = require(`hashmap`);

const _ = require('lodash');

const { createFilePath } = require(`gatsby-source-filesystem`);

const createPaginatedPages = require('gatsby-paginate');

const postsByTags = new HashMap();
const postsByCategories = new HashMap();
const pageLength = 6;
const indexPageTemplate = path.resolve('src/templates/index.js');
const blogPostTemplate = path.resolve('src/templates/blog-post.js');
const tagTemplate = path.resolve('src/templates/tag.js');
const categoryTemplate = path.resolve('src/templates/category.js');

const getFileUpdatedDate = path => {
  const stats = fs.statSync(path);
  return stats.mtime;
};

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });

    createNodeField({
      node,
      name: `slug`,
      value: `${_.kebabCase(slug)}/`,
    });
    createNodeField({
      node,
      name: `modified_date`,
      value: getFileUpdatedDate(`./src/pages/${slug}/index.md`),
    });
  }
};

const addObjToHashMap = (hashmap, key, obj) => {
  if (hashmap.has(key)) {
    const arr = hashmap.get(key);
    arr.push(obj);
  } else {
    hashmap.set(key, [obj]);
  }
};

exports.createPages = ({ graphql, actions }) => {
  // **Note:** The graphql function call returns a Promise
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise for more info
  const { createPage } = actions;

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
      pageTemplate: indexPageTemplate,
      pageLength,
      pathPrefix: '',
      context: {},
      buildPath: (index, pathPrefix) =>
        index > 1 ? `${pathPrefix}/${index}` : `/${pathPrefix}`,
    });

    posts.forEach(({ node }) => {
      // Generating tags set
      if (node.frontmatter.tags) {
        node.frontmatter.tags.forEach(tag => {
          addObjToHashMap(postsByTags, tag, { node });
        });
      }

      // Generating categories set
      if (node.frontmatter.category) {
        addObjToHashMap(postsByCategories, node.frontmatter.category, { node });
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
    postsByTags.forEach((nodes, tag) => {
      createPaginatedPages({
        edges: nodes,
        createPage,
        pageTemplate: tagTemplate,
        pageLength,
        pathPrefix: `tags/${_.kebabCase(tag)}`,
        context: {
          tag,
        },
      });
    });

    // Generating categories pages
    postsByCategories.forEach((nodes, category) => {
      createPaginatedPages({
        edges: nodes,
        createPage,
        pageTemplate: categoryTemplate,
        pageLength,
        pathPrefix: `${category}`,
        context: {
          category,
        },
      });
    });
  });
};
