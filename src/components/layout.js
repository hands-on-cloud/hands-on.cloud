import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import styles from './layout.module.css';
import Header from './Header/header';
import Footer from '../components/Footer/footer';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class Layout extends React.Component {

    render() {
        return (
            <div className="application">
                <Header />
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
                <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
                <script>{`
                    (adsbygoogle = window.adsbygoogle || []).push({
                        google_ad_client: "ca-pub-2729052102059896",
                        enable_page_level_ads: true
                    });
                `}</script>
            </div>
        )
    }
}
