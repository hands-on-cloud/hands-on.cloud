import React from 'react';
import PropTypes from 'prop-types';

export default class AdSense extends React.Component {
    componentDidMount() {
        if(window) (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: this.props.client,
            enable_page_level_ads: true
        });
    }

    render () {
        return (
            <ins className={`${this.props.className} adsbygoogle`}
                data-ad-client={this.props.client} >
            </ins>
        );
    }
}

AdSense.propTypes = {
    className: PropTypes.string,
    client: PropTypes.string.isRequired
};

AdSense.defaultProps = {
    className: '',
};
