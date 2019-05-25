import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'gatsby';
import PostTags from './PostTags/posttags';

const postcard = props => {
  return (
    <Card key={props.post.node.id}>
      <Link to={`/${props.post.node.fields.slug}/`}>
        <Card.Img
          variant="top"
          width="100%"
          src={props.post.node.frontmatter.thumbnail.childImageSharp.fluid.src}
          alt={props.post.node.frontmatter.title}
        />
      </Link>
      <Card.Body>
        <Link to={`/${props.post.node.fields.slug}/`}>
          <Card.Title>
            <h5>{props.post.node.frontmatter.title}</h5>
          </Card.Title>
          <Card.Text>{props.post.node.excerpt}</Card.Text>
        </Link>
        <PostTags tags={props.post.node.frontmatter.tags} />
      </Card.Body>
    </Card>
  );
};

export default postcard;
