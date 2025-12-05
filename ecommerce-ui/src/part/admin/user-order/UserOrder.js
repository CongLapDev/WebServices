import { Button, Col, Divider, Form, Input, Modal, Row, Space } from "antd";
import style from './style.module.scss';
import { OrderItem } from "../../../components";
import clsx from "clsx";
import { Link } from "react-router-dom";
function UserOrder({ data, ...props }) {
    console.log(data)
    return (
        <div {...props} className={clsx(style.container)}>
            {data.orderLines.map((item_, key) => <><Col key={key} span={24}><OrderItem disabled data={item_} /> </Col></>)}
            {data.status[data.status.length - 1].status <= 2 && <Col span={24}>
                <Row justify="end">
                    <Link to={`/admin/order?id=${data.id}`}><Button type="link">Details</Button></Link>
                </Row>
            </Col>}
        </div>);
}

export default UserOrder;