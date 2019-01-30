import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import { CardDeck } from 'reactstrap';
import PostCards from '../components/postcards';

const Categories = ({pageContext, data}) => {
    const { category } = pageContext

    return (
        <Layout>
            <h1>{ category }</h1>
            <CardDeck>
                <PostCards posts={data.allMarkdownRemark.edges}/>
            </CardDeck>
        </Layout>
    )
}

export default Categories

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
