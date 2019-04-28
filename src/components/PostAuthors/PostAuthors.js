import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PostAuthor from './PostAuthor/PostAuthor'; 

export default ({ authors }) => {
    const authorsTitle = (authors.length === 1) ? 'Article author' : 'Article authors';
    
    return (
        <div>
            <Row>
                <h2>{authorsTitle}</h2>
            </Row>
            <Row>
                {authors.map(name => (
                    <Col md={4}>
                        <PostAuthor name={name} />
                    </Col>
                ))}
            </Row>            
        </div>
        
    )
};
