import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const NavLink = props => {
  const { hide, url, text } = props;

  if (!hide) {
    return (
      <Button
        href={url}
        variant="outline-dark"
        style={{ padding: '0.5em', margin: '0.5em' }}>
        {text}
      </Button>
    );
  }
  return (
    <Button variant="outline-dark" hidden>
      {text}
    </Button>
  );
};

NavLink.propTypes = {
  hide: PropTypes.bool,
  url: PropTypes.string,
  text: PropTypes.string,
};

const Pager = props => {
  const { first, last, previousUrl, nextUrl } = props;

  return (
    <div style={{ textAlign: 'center' }}>
      <NavLink hide={first} url={previousUrl} text="Go to Previous Page" />
      <NavLink hide={last} url={nextUrl} text="Go to Next Page" />
    </div>
  );
};

export default Pager;

Pager.propTypes = {
  first: PropTypes.bool,
  last: PropTypes.bool,
  previousUrl: PropTypes.string,
  nextUrl: PropTypes.string,
};
