import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import { Card, Col, Row, Tag, Divider, Button, Modal, Form, Input, Space } from "antd";
import { Description } from "../../../components";
import AddressTag from "../../../components/address-tag/AddressTag";
import useAuth from "../../../secure/useAuth";
import OrderStatusTag from "../../../part/admin/order-status-tag/OrderStatusTag";
function UserOrderDetailPage() {
    const globalContext = useContext(GlobalContext);
    const [state, user, hasRole] = useAuth();
    const [urlParams, setRequestParams] = useSearchParams();
    const [data, setData] = useState();
    const [modal, setModal] = useState(false);
    const navigate = useNavigate();
    function cancelOrder(payload) {
        APIBase.post(`/api/v1/order/${data.id}/status/CANCEL`, payload)
            .then(() => {
                navigate("/", {
                    status: "success",
                    title: "Successfully cancelled your order"
                })

            }).catch(() => {
                globalContext.message.error("Can't cancel this order right now");
            })
    }

    useEffect(() => {
        APIBase.get(`/api/v1/order/${urlParams.get("id")}`)
            .then(payload => payload.data)
            .then(setData)
            .catch(e => {
                globalContext.message.error("Error");
            })
    }, [])
    return (

        <>
            <Modal footer={null} title="Are you sure?" open={modal} onCancel={() => { setModal(false) }}>
                <h4>Please let's we know your advises </h4>
                <Form onFinish={cancelOrder}>
                    <Row>
                        <Col span={24}>
                            <Form.Item name="note">
                                <Input.TextArea placeholder="Your problems" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="detail">
                                <Input.TextArea placeholder="Your advises" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Row justify="end">
                                <Space>
                                    <Button danger htmlType="submit" type="primary">Continue</Button>
                                </Space>
                            </Row>
                        </Col>
                    </Row>

                </Form>
            </Modal>
            <Row gutter={[0, 16]} md={{ gutter: [24, 24] }}>
                <Col span={24}>
                    <Card>
                        {data && <AddressTag data={data} />}
                    </Card>
                </Col>
                <Col span={24}>
                    <Card>
                        {data && data.orderLines.map((item, index) => (
                            <Row key={index} gutter={[16, 16]}>
                                <Col span={6}><img style={{ width: "100%", height: "100%", objectFit: "contain" }} src={item.productItem.product.picture} /></Col>
                                <Col span={18}>
                                    <Row style={{ paddingRight: "16px" }}>{item.productItem.product.name}</Row>
                                    <Tag color="blue">{item.productItem.options.map(item_ => item_.value).join(",")}</Tag>
                                    <Row><Description>Quantity: {item.qty}</Description></Row>
                                    <Row justify="end"><Description>Total {item.total}</Description></Row>
                                </Col>
                                <Divider />
                            </Row>
                        ))}
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Status">
                        {data && <OrderStatusTag status={data.status[data.status.length - 1]?.status} />}
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Note">
                        {data && data.note}
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Payment">
                        <div>Method: {data && data.payment.type.name}</div>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Delivery Method">
                        {data && data.shippingMethod.name}
                    </Card>
                </Col>

                {data && data.status[data.status.length - 1]?.status <= 2 &&
                    <Col span={24}>
                        <Button block danger onClick={() => setModal(true)}>Cancel</Button>
                    </Col>
                }
            </Row>
        </>
    );
}

export default UserOrderDetailPage;