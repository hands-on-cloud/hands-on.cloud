import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import { CardColumns } from 'react-bootstrap';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import Pager from '../components/Pager/Pager';
import SEO from '../components/SEO/SEO';

const IndexPage = ({ pageContext }) => {
  const { group, index, first, last } = pageContext;
  const previousUrl = index - 1 === 1 ? '/' : `/${(index - 1).toString()}/`;
  const nextUrl = `/${(index + 1).toString()}/`;

  return (
    <Layout>
      <SEO title="Hands-On.Cloud" />
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
