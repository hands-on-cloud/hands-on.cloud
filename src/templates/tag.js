import React from 'react';
import { CardColumns } from 'react-bootstrap';
import Layout from '../components/layout';
import PostCards from '../components/postcards';
import Pager from '../components/Pager/Pager';

const Tags = ({ pageContext }) => {
  const {
    group,
    index,
    first,
    last,
    pathPrefix,
    additionalContext,
  } = pageContext;
  const { tag } = additionalContext;
  const previousUrl =
    index - 1 === 1 ? `/${pathPrefix}/` : (index - 1).toString();
  const nextUrl = `/${pathPrefix}/${(index + 1).toString()}`;

  return (
    <Layout>
      <h1>{tag}</h1>
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

export default Tags;
