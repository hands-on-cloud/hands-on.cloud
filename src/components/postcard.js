import React from 'react';
import {
    Card,
    CardImg,
    CardBody,
    CardTitle,
    CardText,
} from 'reactstrap';
import { Link } from 'gatsby';
import PostTags from '../components/PostTags/posttags';

const postcard = (props) => {
    return (
        <Card key={props.post.node.id}>
            <Link to={`/${props.post.node.fields.slug}/`}>
                <CardImg top width="100%" src={props.post.node.frontmatter.thumbnail.childImageSharp.fluid.src} alt={props.post.node.frontmatter.title} />
            </Link>
            <CardBody>
                <Link to={`/${props.post.node.fields.slug}/`}>
                    <CardTitle><h5>{props.post.node.frontmatter.title}</h5></CardTitle>
                    <CardText>{props.post.node.excerpt}</CardText>
                </Link>
                <PostTags tags={props.post.node.frontmatter.tags} />
            </CardBody>
        </Card>
    )
}

export default postcard;
