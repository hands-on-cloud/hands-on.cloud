import React from 'react';
import { Badge } from 'react-bootstrap';
import kebabCase from 'lodash/kebabCase';

const posttags = props => {
  const tagStyle = {
    marginRight: '2px',
  };

  return (
    <div>
      {props.tags.map(tag => (
        <a key={tag} href={`/tags/${kebabCase(tag)}/`}>
          <Badge variant="dark" style={tagStyle}>
            {tag}
          </Badge>
        </a>
      ))}
    </div>
  );
};

export default posttags;
