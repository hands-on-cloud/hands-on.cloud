import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import Disqus from 'disqus-react';

export default ({ data }) => {
  const post = data.markdownRemark;
  const disqusShortname = 'hands-on.cloud';
  const disqusConfig = {
    url: post.frontmatter.slug,
    identifier: post.fields.slug,
    title: post.frontmatter.title,
  };

  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <Disqus.CommentCount shortname={disqusShortname} config={disqusConfig}>
          Comments
        </Disqus.CommentCount>
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
