import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import styles from './layout.module.css';
import Header from './Header/header';
import Footer from '../components/Footer/footer';
import AdSense from '../components/AdSense/adsense';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class Layout extends React.Component {

    render() {
        const gtmStyle = {
            display: 'none',
            visibility: 'hidden'
        };
        return (
            <div className="application">
                <Header />
                {/* Google Tab Manager */}
                <script>{`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-MNPN749');
                `}</script>
                {/* Google Tab Manager */}
                <div className={styles.container}>
                    <Container>
                        <Row>
                            <Col sm="12" md={{ size: 10, offset: 1 }}>
                                {this.props.children}
                            </Col>
                        </Row>
                    </Container>
                </div>
                <Footer />
                <AdSense />
                {/* Google Tab Manager */}
                <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MNPN749"
                height="0" width="0" style={gtmStyle} title="GTM"></iframe></noscript>
                {/* Google Tab Manager */}
            </div>
        )
    }
}
