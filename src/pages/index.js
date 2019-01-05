import React from 'react';
import { Link, graphql } from 'gatsby';
import Layout from '../components/layout';

export default ({data}) => {
    console.log(data)
    return (
        <Layout>
            {data.allMarkdownRemark.edges.map(({ node }) => (
                <div key={node.id}>
                    <Link to={node.fields.slug}>
                        <h3>
                            {node.frontmatter.title}{" "}<span> — {node.frontmatter.date}</span>
                        </h3>
                        <p>{node.excerpt}</p>
                    </Link>
                </div>
            ))}
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
