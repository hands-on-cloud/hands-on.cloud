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
import componentStyles from './reactnavbar.module.css';

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
        return (
            <div className={componentStyles.ReactNavbar}>
                <Navbar color="dark" light>
                    <NavbarBrand className="mr-auto">
                        <NavLink style={brandStyle} href="/">hands-on.cloud</NavLink>
                    </NavbarBrand>

                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    
                    <Collapse isOpen={!this.state.collapsed} navbar>
                        <Nav navbar>
                            <NavItem className='span'>
                                <NavLink style={menuStyle} href="#aws">AWS</NavLink>
                            </NavItem>
                            <NavItem className='span'>
                                <NavLink style={menuStyle} href="#cloud">Cloud</NavLink>
                            </NavItem>
                            <NavItem className='span'>
                                <NavLink style={menuStyle} href="#docker">Docker</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        )
    }
}