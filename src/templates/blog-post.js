import React from 'react';
import { graphql } from 'gatsby';
import Disqus from 'disqus-react';
import Layout from '../components/layout';
import PostTags from '../components/PostTags/posttags';
import PostAuthors from '../components/PostAuthors/PostAuthors';
import SEO from '../components/SEO/SEO';

export default ({ data }) => {
  const post = data.markdownRemark;
  const { markdownRemark: { excerpt, html, frontmatter } } = data
  const image = frontmatter.thumbnail ? frontmatter.thumbnail.childImageSharp.sizes.src : null

  const disqusShortname = 'hands-on-cloud';
  const disqusConfig = {
    url: post.frontmatter.slug,
    identifier: post.fields.slug,
    title: post.frontmatter.title,
  };

  return (
    <Layout>
      <SEO title="Hands-On.Cloud" description={excerpt} image={image} />
      <div>
        <h1>{post.frontmatter.title}</h1>
        <br />
        <PostTags tags={post.frontmatter.tags} />
        <br />
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <br />
        <PostTags tags={post.frontmatter.tags} />
        <br />
        <PostAuthors authors={post.frontmatter.authors} />
        <br />
        <br />
        <Disqus.DiscussionEmbed
          shortname={disqusShortname}
          config={disqusConfig}
        />
      </div>
    </Layout>
  );
};

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        tags
        authors
        thumbnail {
          childImageSharp {
            sizes(maxWidth: 1240) {
              ...GatsbyImageSharpSizes_tracedSVG
            }
          }
        }
        date
      }
      excerpt(format: PLAIN)
      fields {
        slug
        modified_date
      }
    }
  }
`;
