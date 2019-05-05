import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import { CardColumns } from 'react-bootstrap';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import SEO from '../components/SEO/SEO';
import Pager from '../components/Pager/Pager';

const IndexPage = ({ pageContext }) => {
  const { group, index, first, last } = pageContext;
  const previousUrl = index - 1 === 1 ? '/' : (index - 1).toString();
  const nextUrl = (index + 1).toString();

  return (
    <Layout>
      <StaticQuery
        query={graphql`
          query {
            site {
              siteMetadata {
                title
                description
              }
            }
          }
        `}
        render={data => (
          <SEO
            title={data.site.siteMetadata.title}
            description={data.site.siteMetadata.description}
          />
        )}
      />
      <CardColumns>
        <PostCards posts={group} />
      </CardColumns>

      <Pager
        first={first}
        last={last}
        previousUrl={previousUrl}
        nextUrl={nextUrl}
      />
    </Layout>
  );
};

export default IndexPage;
