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
                <AdSense client="ca-pub-2729052102059896"/>
            </div>
        )
    }
}
