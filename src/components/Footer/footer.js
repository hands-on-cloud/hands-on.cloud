import React from 'react';
import { Link } from 'gatsby';
import logo from './images/logo-small.png';
import facebook_icon from './images/facebook-icon.png';
import linkedin_icon from './images/linked-in-icon.png';
import twitter_icon from './images/twitter-icon.png';

const footer = (props) => {
    return (
        <div id="footer" className="footer">
            <div className="container">
                <h1 className="header-content__logo">
                    <Link to="/">
                        <img src={logo} alt="footer logo" />
                    </Link>
                </h1>
                <span className="copyright-note">Copyright © 2019, All Rights Reserved.</span>
                <ul className="social-links right">
                    <li>
                        <a href="https://twitter.com/andreivmaksimov" target="_blank" rel="noopener noreferrer">
                            <img src={twitter_icon} alt="twitter-icon" />
                        </a>
                    </li>
                    <li>
                        <a href="https://linkedin.com/in/avmaksimov" target="_blank" rel="noopener noreferrer">
                            <img src={linkedin_icon} alt="linked-in-icon" />
                        </a>
                    </li>
                    <li>
                        <a href="https://business.facebook.com/andrei.v.maksimov/" target="_blank" rel="noopener noreferrer">
                            <img src={facebook_icon} alt="facebook-icon" />
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default footer;
