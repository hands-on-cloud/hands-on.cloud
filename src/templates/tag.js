import React from 'react';
import PropTypes from 'prop-types';
import { Link, graphql } from 'gatsby';
import Layout from '../components/layout';
import { CardDeck } from 'reactstrap';
import PostCards from '../components/postcards';

const Tags = ({pageContext, data}) => {
    const { tag } = pageContext
    const tagHeader = `Post${
        data.allMarkdownRemark.totalCount === 1 ? "" : "s"
    } for "${tag}" tag`

    return (
        <Layout>
            <h1>{tagHeader}</h1>
            <Link to="/tags">All tags</Link>
            <CardDeck>
                <PostCards posts={data.allMarkdownRemark.edges}/>
            </CardDeck>
            {/*
              This links to a page that does not yet exist.
              We'll come back to it!
            */}
            <Link to="/tags">All tags</Link>
        </Layout>
    )
}

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
                }).isRequired
            ),
        }),
    }),
}
  
export default Tags

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
