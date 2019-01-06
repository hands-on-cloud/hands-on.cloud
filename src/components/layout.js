import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import styles from './layout.module.css';
import ReactNavbar from '../components/reactnavbar';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class Layout extends React.Component {

    render() {
        return (
            <div className={styles.container}>
                <ReactNavbar />
                <Container>
                    <Row>
                        <Col sm="12" md={{ size: 10, offset: 1 }}>
                            {this.props.children}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
