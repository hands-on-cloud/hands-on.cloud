import React from 'react';
import { Button } from 'react-bootstrap';

const NavLink = props => {
    if (!props.hide) {
      return <Button href={props.url} variant="outline-dark" style={{ padding: '1em', margin: '1em' }}>{props.text}</Button>
    } else {
      return <Button variant="outline-dark" hidden>{props.text}</Button>
    }
}

const Pager = props => {
    return (
        <div style={{ textAlign: 'center' }}>
            <NavLink hide={props.first} url={props.previousUrl} text="Go to Previous Page" />
            <NavLink hide={props.last} url={props.nextUrl} text="Go to Next Page" />
        </div>
    )
}

export default Pager;
