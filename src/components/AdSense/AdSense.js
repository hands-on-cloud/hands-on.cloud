import React from 'react';

export default class AdSense extends React.Component {
  componentDidMount() {
    const installGoogleAds = () => {
      const elem = document.createElement('script');
      elem.src = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      elem.async = true;
      elem.defer = true;
      document.body.insertBefore(elem, document.body.firstChild);
    };
    installGoogleAds();
    if (window)
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: 'ca-pub-2729052102059896',
        enable_page_level_ads: true,
      });
  }

  render() {
    return <div key={Math.random()} />;
  }
}
