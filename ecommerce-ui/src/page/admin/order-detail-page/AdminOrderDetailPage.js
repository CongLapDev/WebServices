import { Card, Row, Col, Space, Flex, Statistic, Timeline, Divider, Tag, Button, Modal, Form, Input, Select, Avatar } from "antd";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import { Currency, Description } from "../../../components";
import OrderStatusTag from "../../../part/admin/order-status-tag/OrderStatusTag";

function AdminOrderDetailPage() {
    const [params, setRequestParams] = useSearchParams();
    const [data, setData] = useState();
    const globalContext = useContext(GlobalContext);
    const [modal, setModal] = useState(false);
    useEffect(() => {
        APIBase.get(`/api/v1/order/${params.get("id")}`).then(payload => payload.data)
            .then(data => {
                setData(data);
                console.log(data);
            }).catch(() => {
                globalContext.message.error("Fail to fetch data");
            })
    }, [])
    console.log(data && data.status[data.status.length - 1].status <= 1)
    function approveOrder() {
        APIBase.post(`/api/v1/order/${params.get("id")}/status/APPROVE`, {
            note: "APPROVED ORDER"
        }).then(payload => {
            globalContext.message.success("Successfully update status");
            setData(data => {
                data.status.push(payload.data);
                return data;
            })
        }).catch(err => {
            globalContext.message.error("Error");
        })
    }
    function cancelOrder(data) {
        APIBase
            .post(`/api/v1/order/${params.get("id")}/status/CANCEL`, data)
            .then(payload => {
                globalContext.message.success("Successfully cancel order");
                setData(data => {
                    data.status.push(payload.data);
                    return data;
                })
            }).catch(err => {
                globalContext.message.error("Error Action");
            })

    }
    return (data &&
        <>
            <Modal footer={null} title="Cancel this order" onCancel={() => { setModal(false) }} open={modal}>
                <Form onFinish={cancelOrder}>
                    <Form.Item name="detail">
                        <Input.TextArea placeholder="Detail" title="Detail" />
                    </Form.Item>
                    <Form.Item name="note">
                        <Input.TextArea placeholder="Note" title="Note" />
                    </Form.Item>
                    <Row justify="end">
                        <Space>
                            <Button htmlType="button" onClick={() => { setModal(false) }} type="primary" danger>Cancel</Button>
                            <Button htmlType="submit" type="primary">Submit</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
            <Row style={{ padding: "16px" }} gutter={[16, 16]}>
                <Col span={6}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="Customer" >
                                <Card.Meta description={data.user.email}
                                    avatar={<Avatar src={data.user.picture} />} title={`${data.user.firstname} ${data.user.lastname}`} />
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Address">
                                <Col>
                                    <p>{data.address.city}</p>
                                    <Description>{data.address.region}</Description>
                                    <Description>{data.address.addressLine1}</Description>
                                </Col>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={18}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Row gutter={[16, 16]} align="stretch">
                                <Col span={12}><Card style={{ height: "100%" }}><Statistic title="Date" value={(new Date(data.orderDate).toString())} /></Card></Col>
                                <Col span={6}><Card style={{ height: "100%" }}><Statistic title="Total" value={data.total} /></Card></Col>
                                <Col span={6}><Card style={{ height: "100%" }}><Statistic title="Ship Method" value={data.shippingMethod?.name} suffix={data.shippingMethod?.price} /></Card></Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <Row gutter={[16, 16]}>
                                <Col span={18}>
                                    <Card title="Items">
                                        {data.orderLines.map((item, index) => (
                                            <Row key={index} gutter={[16, 16]}>
                                                <Col span={4}><img style={{ width: "100%", height: "100%" }} src={item.productItem.product.picture} /></Col>
                                                <Col span={20}>
                                                    <Row style={{ paddingRight: "16px" }}>{item.productItem.product.name}</Row>
                                                    <Tag color="blue">{item.productItem.options.map(item_ => item_.value).join(",")}</Tag>
                                                    <Row><Description>Quantity: {item.qty}</Description></Row>
                                                    <Row justify="end"><Description>Total <Currency value={item.total} /></Description></Row>
                                                </Col>
                                                <Divider />
                                            </Row>
                                        ))}
                                        <Row justify="end">
                                            <Space>
                                                <Button onClick={() => { setModal(true) }} type="primary" danger>Cancel</Button>
                                                {(data.status[data.status.length - 1].status <= 1) && <Button type="primary" onClick={approveOrder}>Approve</Button>}
                                            </Space>
                                        </Row>
                                        <Divider />
                                        <h3>Dev</h3>
                                        <Select style={{ width: "100px" }} options={[{
                                            label: "PENDING",
                                            value: "PENDING"
                                        }, {
                                            label: "PREPARING",
                                            value: "PREPARING",
                                        }, {
                                            value: "DELIVERING"
                                        }, {
                                            value: "DELIVERED"
                                        }, {
                                            value: "COMPLETED"
                                        }, {
                                            value: "CANCEL"
                                        }, {
                                            value: "RETURN"
                                        }]} />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Row gutter={[16, 16]}>
                                        <Col span={24}>
                                            <Card>
                                                <Statistic title="Payment Method" value={data.payment?.type.name} />
                                            </Card>
                                        </Col>
                                        <Col span={24}>
                                            <Card>
                                                <Timeline items={data.status.map(item => ({
                                                    children: <Col>
                                                        <OrderStatusTag status={item.status} />
                                                        <h4>{item.note}</h4>
                                                        <h5>{item.detail}</h5>
                                                        <Description>{item.updateAt}</Description>
                                                    </Col>
                                                })).reverse()} />
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>);
}

export default AdminOrderDetailPage;