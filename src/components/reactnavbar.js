import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import { StaticQuery, graphql } from 'gatsby';
import kebabCase from 'lodash/kebabCase';

import componentStyles from './reactnavbar.module.css';

export default class ReactNavbar extends React.Component {
    constructor(props) {
        super(props);
    
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };
    }
  
    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        const brandStyle = {
            'color': 'white',
            'textDecoration': 'none'
        }

        const menuStyle = {
            'color': 'white',
            'textDecoration': 'none',
            'fontSize': '0.9em',
            'marginLeft': '35px'
        }

        return (
            <div className={componentStyles.ReactNavbar}>
                <Navbar color="dark" light>
                    <NavbarBrand className="mr-auto" href="/" style={brandStyle}>
                        hands-on.cloud
                    </NavbarBrand>

                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    
                    <Collapse isOpen={!this.state.collapsed} navbar>
                        
                            <StaticQuery 
                                query={graphql`
                                    query TagsQuery {
                                        allMarkdownRemark(
                                            limit: 7
                                        ) {
                                            group(field: frontmatter___tags) {
                                              fieldValue
                                              totalCount
                                            }
                                        }
                                    }
                                `}
                                render={data => (
                                    <Nav navbar>
                                    {
                                        data.allMarkdownRemark.group.map( (tag, index) => (
                                            <NavItem className='span' key={index}>
                                                <NavLink style={menuStyle} href={`/tags/${kebabCase(tag.fieldValue)}/`}>{tag.fieldValue}</NavLink>
                                            </NavItem>
                                        ))
                                    }
                                    </Nav>
                                )}
                            />
                            
                            
                        
                    </Collapse>
                </Navbar>
            </div>
        )
    }
}