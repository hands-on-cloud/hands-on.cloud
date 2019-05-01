import React from 'react';
import { graphql } from 'gatsby';
import { CardColumns } from 'react-bootstrap';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import AdSense from '../components/AdSense/adsense';

const Categories = ({ pageContext, data }) => {
  const { category } = pageContext;

  return (
    <Layout>
      <h1>{category}</h1>
      <CardColumns>
        <PostCards posts={data.allMarkdownRemark.edges} />
      </CardColumns>
      <AdSense key={`category-${category}`} client="ca-pub-2729052102059896" />
    </Layout>
  );
};

export default Categories;

export const pageQuery = graphql`
  query($category: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { category: { eq: $category } } }
    ) {
      totalCount
      edges {
        node {
          frontmatter {
            title
            thumbnail {
              relativePath
              childImageSharp {
                fluid(maxWidth: 700) {
                  src
                }
              }
            }
            tags
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`;
