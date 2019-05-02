import React from 'react';
import PropTypes from 'prop-types';

const AdSense = props => {
  const { className, client } = props;
  return <ins className={`${className} adsbygoogle`} data-ad-client={client} />;
};

export default AdSense;

AdSense.propTypes = {
  className: PropTypes.string,
  client: PropTypes.string.isRequired,
};

AdSense.defaultProps = {
  className: '',
};
