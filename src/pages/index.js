import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import { CardColumns } from 'reactstrap';

export default ({data}) => {
    return (
        <Layout>
            <CardColumns>
                <PostCards posts={data.allMarkdownRemark.edges}/>
            </CardColumns>
        </Layout>
    )
}

export const query = graphql`
query {
    allMarkdownRemark (
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
                    fluid (maxWidth: 700) {
                      src
                    }
                }
              }
            }
            fields {
                slug
            }
            excerpt
          }
        }
    }
}
`
