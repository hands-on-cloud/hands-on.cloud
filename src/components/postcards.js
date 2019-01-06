import React from 'react';
import PostCard from './postcard';

const postcards = (props) => props.posts.map( (post, index) => {
    return (
        <PostCard post={post} key={index}/>
    )
});

export default postcards;