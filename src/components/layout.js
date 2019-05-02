import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './layout.module.css';
import Header from './Header/header';
import Footer from './Footer/footer';
import ErrorBoundry from './Sentry/ErrorBoundry';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdSense from './AdSense/adsense';

const Layout = props => {
  const { children } = props;

  return (
    <div className="application">
      <ErrorBoundry>
        <Header />
        <div className={styles.container}>
          <Container>
            <Row>
              <Col sm="12">{children}</Col>
            </Row>
          </Container>
        </div>
        <Footer />
        <AdSense client="ca-pub-2729052102059896" />
      </ErrorBoundry>
    </div>
  );
};

export default Layout;

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
