import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { StaticQuery, graphql } from 'gatsby';
import logo from './images/logo-small.png';

import componentStyles from './header.module.css';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true,
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const menuStyle = {
      color: 'white',
      textDecoration: 'none',
      fontSize: '0.9em',
      marginLeft: '35px',
    };

    return (
      <div className={componentStyles.ReactNavbar}>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="light">
          <Navbar.Brand className="mr-auto" href="/">
            <img src={logo} alt="hands-on.cloud logo" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />

          <Navbar.Collapse id="responsive-navbar-nav">
            <StaticQuery
              query={graphql`
                query {
                  site {
                    siteMetadata {
                      categories {
                        slug
                        name
                      }
                    }
                  }
                }
              `}
              render={data => (
                <Nav className="mr-auto">
                  {data.site.siteMetadata.categories.map((category, key) => (
                    <Nav className="span" key={key}>
                      <Nav.Link style={menuStyle} href={`/${category.slug}/`}>
                        {category.name}
                      </Nav.Link>
                    </Nav>
                  ))}
                  <Nav className="span" key="for-authors">
                    <Nav.Link style={menuStyle} href="/for-authors/">
                      For Authors
                    </Nav.Link>
                  </Nav>
                </Nav>
              )}
            />
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}
