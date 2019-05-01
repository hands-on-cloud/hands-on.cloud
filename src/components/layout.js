import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './layout.module.css';
import Header from './Header/header';
import Footer from './Footer/footer';
import ErrorBoundry from './Sentry/ErrorBoundry';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class Layout extends React.Component {
  render() {
    return (
      <div className="application">
        <ErrorBoundry>
          <Header />
          <div className={styles.container}>
            <Container>
              <Row>
                <Col sm="12">{this.props.children}</Col>
              </Row>
            </Container>
          </div>
          <Footer />
          <script
            async
            src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          />
        </ErrorBoundry>
      </div>
    );
  }
}
