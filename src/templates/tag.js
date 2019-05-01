import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import { CardColumns } from 'react-bootstrap';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import AdSense from '../components/AdSense/adsense';

const Tags = ({ pageContext, data }) => {
  const { tag } = pageContext;

  return (
    <Layout>
      <h1>{tag}</h1>
      <CardColumns>
        <PostCards posts={data.allMarkdownRemark.edges} />
      </CardColumns>
      <AdSense key={`tag-${tag}`} client="ca-pub-2729052102059896" />
    </Layout>
  );
};

Tags.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }),
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              title: PropTypes.string.isRequired,
            }),
            fields: PropTypes.shape({
              slug: PropTypes.string.isRequired,
            }),
          }),
        }).isRequired,
      ),
    }),
  }),
};

export default Tags;

export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
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
