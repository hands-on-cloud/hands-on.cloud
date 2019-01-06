import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import { CardDeck } from 'reactstrap';

export default ({data}) => {
    const style = {
        paddingTop: '20px',
        paddingBottom: '20px'
    };

    return (
        <Layout>
            <div style={style}>
                <CardDeck>
                    <PostCards posts={data.allMarkdownRemark.edges}/>
                </CardDeck>
            </div>
        </Layout>
    )
}

export const query = graphql`
query {
    allMarkdownRemark {
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
