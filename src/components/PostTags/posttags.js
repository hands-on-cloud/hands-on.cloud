import React from 'react';
import { Badge } from 'react-bootstrap';
import kebabCase from 'lodash/kebabCase';

const posttags = (props) => {
    let tagStyle={
        marginRight: "2px"
    };
    
    return (
        <div>
            {props.tags.map(tag => (
                <a href={`/tags/${kebabCase(tag)}/`}>
                    <Badge key={tag} variant="dark" style={tagStyle}>{tag}</Badge>
                </a>
            ))}
        </div>
    )
}

export default posttags;