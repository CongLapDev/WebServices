import { Link } from 'react-router-dom';
import style from './style.module.scss';
import clsx from 'clsx';
import React from 'react';
import { List, Row, Col } from 'antd';

class LinkListItem extends React.Component {
    constructor({ to }) {
        super();
        this.to = to;
    }

    render() {
        return (<List.Item className={clsx(style.item, this.props.className)}>
            <Link to={this.props.to} className={clsx(style.link)}>
                <Row style={{ width: "100%" }} align="middle" justify="space-between">
                    <Col span={8}>
                        <Row>
                            <Col span={5} className={style.icon}>{this.props.prefix}</Col>
                            <Col span={19} className={style.text}>{this.props.title}</Col>
                        </Row>
                    </Col>
                    <Col span={16}>
                        <Row justify="end">
                            <Col className={style.content}>{this.props.children}</Col>
                            {this.props.arrow &&
                                <Col span={4}>
                                    <span className={clsx(style.icon)}>
                                        <i className="fi fi-rr-angle-small-right"></i>
                                    </span>
                                </Col>}
                        </Row>
                    </Col>
                </Row>
            </Link>
        </List.Item>)
    }
}
export default LinkListItem;