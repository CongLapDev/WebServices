import { Button, Card, Col, Input, List, Row, Select, Form, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import OrderItem from "../../../components/order-item/OrderItem.js";
import { useContext, useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase.js";
import { findAllByUserId } from "../../../store/address/addressSlide.js";
import { AddressTag, PrefixIcon, Description } from "../../../components";
import AddressAddModal from "../../../part/address-add-modal/AddressAddModal.js";
import { GlobalContext } from "../../../context/index.js";
import { useLocation, useNavigate } from "react-router-dom";
function UserOrderCheckOutPage() {
    const { state } = useLocation();
    const { data } = state;
    const user = useSelector(state => state.user);
    const address = useSelector(state => state.userAddress);
    const [shipMethods, setShipMethods] = useState(null);
    const [currentShipMethod, setCurrentShipMethod] = useState(null);
    const [addressModal, setAddressModal] = useState(false);
    const globalContext = useContext(GlobalContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        if (address.length === 0) {
            if (user && user.id) dispatch(findAllByUserId({
                userId: user.id
            }))
        }
        APIBase.get("api/v1/shipmethod")
            .then(payload => payload.data)
            .then((data) => {
                setShipMethods(data);
                setCurrentShipMethod(data[0])
                return data;
            }).catch(console.log);
    }, [dispatch])


    function setShipMethod(id) {
        setCurrentShipMethod(shipMethods.find(method => method.id == id));
    }

    function calculateTotal() {
        return data.reduce((pre, item) => {
            return pre + item.productItem.price * item.qty;
        }, 0) + (currentShipMethod ? currentShipMethod.price : 0);
    }

    function submitHandler(value) {
        globalContext.loader(true);

        var payload = {
            orderLines: data.map(line => ({
                productItem: {
                    id: line.productItem.id
                },
                qty: line.qty,
                total: line.productItem.price * line.qty
            })),
            user: {
                id: user.id
            },
            payment: {
                type: {
                    id: value.payment
                }
            },
            address: {
                id: value.address
            },
            shippingMethod: {
                id: value.shipmethod
            },
            note: value.note,
            total: calculateTotal()
        }
        APIBase.post('/api/v1/order', payload)
            .then(payload => payload.data)
            .then(data => {
                globalContext.loader(false)
                if (value.payment == 1) {
                    navigate(`/result`, {
                        state: {
                            status: "success",
                            title: "Successfully Ordered",
                            subTitle: "If you have any question, please contact 0393497961 for more"
                        }
                    });
                } else if (value.payment == 2) {
                    navigate(`/zalopay/purchase?id=${data.id}`);
                }
            })
            .catch(e => {
                globalContext.message.error("Error");
                console.log(e)
            })
            .finally(() => { globalContext.loader(false) })

    }
    return (
        <Form onFinish={submitHandler}>
            <AddressAddModal open={addressModal} onCancel={() => setAddressModal(false)} />
            <Row gutter={16}>
                <Col span={24} lg={{ span: 14 }}>
                    <Row gutter={[8, 16]}>
                        <Col span={24}>
                            <Card title={<Row align="middle"><PrefixIcon><i className="fi fi-rr-marker"></i></PrefixIcon><span>Delivery Address</span></Row>}>
                                <Form.Item
                                    required
                                    rules={[{ required: "Required" }]}
                                    name="address">
                                    <Select style={{ width: "100%", height: "fit-content" }} options={address && address.map((item, index) => ({
                                        value: item.id.addressId,
                                        label: <AddressTag data={item} />
                                    }))}
                                        dropdownRender={(menu) => <>
                                            {menu}
                                            <Button htmlType="button" onClick={() => setAddressModal(true)} type="dashed" block>Add address</Button>
                                        </>}
                                    />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title={<Row align="middle"><PrefixIcon><i className="fi fi-rr-marker"></i></PrefixIcon><span>Order Lines</span></Row>}>
                                <List className="list-group-flush">
                                    {data && data.map((item, index) => (<List.Item key={item}>
                                        <OrderItem data={item} disabled />
                                    </List.Item>))}
                                </List>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={24} lg={{ span: 10 }}>
                    <Row gutter={[8, 16]}>
                        <Col span={24}>
                            <Card title={<Row align="middle"><PrefixIcon><i className="fi fi-rr-ticket"></i></PrefixIcon><span>Voucher</span></Row>}>
                                <Space>
                                    <Input placeholder="Enter your voucher code" />
                                    <Button type="success" htmlType="button">Apply</Button>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title={<Row align="middle"><PrefixIcon><i className="fi fi-rr-ticket"></i></PrefixIcon><span>Payment</span></Row>}>
                                <Form.Item rules={[{ required: "Required" }]} name="payment">
                                    <Select options={[{
                                        label: "COD",
                                        value: 1
                                    }, {
                                        label: "ZaloPay",
                                        value: 2
                                    }]} />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title={<Row align="middle"><PrefixIcon><i className="fi fi-rr-shipping-fast"></i></PrefixIcon><span>Delivery Method</span></Row>}>
                                <Form.Item rules={[{ required: "Required" }]} name="shipmethod">
                                    <Select
                                        options={
                                            shipMethods && shipMethods.map(item => ({
                                                value: item.id,
                                                label: <Col span={24}>
                                                    <Row><Description>{item.name}</Description></Row>
                                                    <span>{item.price}</span>
                                                </Col>
                                            }))
                                        }
                                        defaultValue={shipMethods && shipMethods[0].id}
                                        onChange={setShipMethod} style={{ width: "100%", height: "fit-content" }}
                                    />
                                </Form.Item>

                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Note">
                                <Form.Item name="note">
                                    <Input.TextArea />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Total">
                                <h5>{calculateTotal()}</h5>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Button style={{ width: "100%" }} type="primary" htmlType="submit">Order</Button>
                        </Col>
                    </Row>
                </Col>
            </Row >
        </Form>

    );
}

export default UserOrderCheckOutPage;