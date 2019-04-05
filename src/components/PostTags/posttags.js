import React from 'react';
import { Badge } from 'reactstrap';
import kebabCase from 'lodash/kebabCase';

const posttags = (props) => {
    let tagStyle={
        marginRight: "2px"
    };
    
    return (
        <div>
            {props.tags.map(tag => (
                <Badge href={`/tags/${kebabCase(tag)}`} color="dark" style={tagStyle}>{tag}</Badge>
            ))}
        </div>
    )
}

export default posttags;