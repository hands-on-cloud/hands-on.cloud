import React from 'react';
import { graphql } from 'gatsby';
import { CardColumns } from 'react-bootstrap';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import SEO from '../components/SEO';
import AdSense from '../components/AdSense/adsense';

export default ({ data }) => {
  return (
    <Layout>
      <SEO
        title={data.site.siteMetadata.title}
        description={data.site.siteMetadata.description}
      />
      <CardColumns>
        <PostCards posts={data.allMarkdownRemark.edges} />
      </CardColumns>
      <AdSense key="index" client="ca-pub-2729052102059896" />
    </Layout>
  );
};

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
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
