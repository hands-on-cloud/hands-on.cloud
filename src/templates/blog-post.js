import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import Disqus from 'disqus-react';
import SEO from '../components/SEO';

export default ({ data }) => {
  const post = data.markdownRemark;
  const disqusShortname = 'hands-on-cloud';
  const disqusConfig = {
    url: post.frontmatter.slug,
    identifier: post.fields.slug,
    title: post.frontmatter.title,
  };

  return (
    <Layout>
      <SEO title={post.frontmatter.title} keywords={post.frontmatter.tags}/>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <Disqus.DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
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
      }
      fields {
        slug
      }
    }
  }
`;
