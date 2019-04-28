import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFacebook,
    faLinkedin,
    faGithub,
    faTwitter,
    faInstagram
} from '@fortawesome/free-brands-svg-icons';

export default ({ name }) => {

    return (
        <StaticQuery
            query={graphql`
                query AuthorQuery {
                    allAuthorsJson {
                        edges {
                            node {
                                name
                                avatar
                                bio {
                                    short
                                }
                                linkedin
                                github
                                facebook
                                twitter
                                instagram
                            }
                        }
                    }
                }
            `}
            render={data => {
                const author = data.allAuthorsJson.edges.find(
                    edge => edge.node.name === name
                )
                if (!author) {
                    return null
                }
                return (
                    <Card>
                        <Card.Img variant="top" src={author.node.avatar} />
                        <Card.Body>
                            <Card.Title>{`${author.node.name}`}</Card.Title>
                            <Card.Text>{`${author.node.bio.short}`}</Card.Text>
                            <div style={{ textAlign: 'center' }}>
                                <a href={author.node.linkedin} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faLinkedin} size="2x" fixedWidth style={{ color: '#0976b4' }} />
                                </a>
                                <a href={author.node.github} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faGithub} size="2x" fixedWidth style={{ color: '#333' }} />
                                </a>
                                <a href={author.node.facebook} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faFacebook} size="2x" fixedWidth style={{ color: '#3b5998' }} />
                                </a>
                                <a href={author.node.twitter} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faTwitter} size="2x" fixedWidth style={{ color: '#55acee' }} />
                                </a>
                                <a href={author.node.instagram} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faInstagram} size="2x" fixedWidth style={{ color: '#3F729B' }} />
                                </a>
                            </div>
                        </Card.Body>
                    </Card>
                )
            }}
        />
    )
};
