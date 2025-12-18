import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import APIBase, { getImageUrl } from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import ProductPlaceHolder from "../../../assets/image/product_placeholder.png";
import { Card, Col, Row, Tag, Divider, Button, Modal, Form, Input, Space, Spin } from "antd";
import { ReloadOutlined } from '@ant-design/icons';
import { Description } from "../../../components";
import AddressTag from "../../../components/address-tag/AddressTag";
import useAuth from "../../../secure/useAuth";
import OrderStatusTag from "../../../part/admin/order-status-tag/OrderStatusTag";
import { isFinalStatus } from "../../../utils/orderUtils";

function UserOrderDetailPage() {
    const globalContext = useContext(GlobalContext);
    const [state, user, hasRole] = useAuth();
    const [urlParams, setRequestParams] = useSearchParams();
    const [data, setData] = useState();
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();
    const pollingIntervalRef = useRef(null);
    const orderId = urlParams.get("id");

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    // Load order data
    const loadOrder = useCallback(async (showLoading = false) => {
        if (!orderId) return;
        
        if (showLoading) setRefreshing(true);
        try {
            const response = await APIBase.get(`/api/v1/order/${orderId}`);
            const newData = response.data;
            setData(newData);
            
            // Check if order is in final status, stop polling if so
            const currentStatus = newData.status?.[newData.status.length - 1]?.status;
            if (currentStatus && isFinalStatus(currentStatus)) {
                stopPolling();
            }
        } catch (e) {
            if (showLoading) {
                globalContext.message.error("Không thể tải thông tin đơn hàng");
            }
        } finally {
            if (showLoading) setRefreshing(false);
        }
    }, [orderId, globalContext, stopPolling]);

    // Manual refresh handler
    const handleRefresh = useCallback(() => {
        loadOrder(true);
    }, [loadOrder]);

    // Start polling for order status updates
    const startPolling = useCallback(() => {
        // Clear any existing interval
        stopPolling();
        
        // Poll every 15 seconds
        pollingIntervalRef.current = setInterval(() => {
            loadOrder(false);
        }, 15000);
    }, [loadOrder, stopPolling]);

    // Handle window focus - refresh when user returns to tab
    useEffect(() => {
        const handleFocus = () => {
            if (orderId) {
                loadOrder(false);
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [orderId, loadOrder]);

    // Initial load and setup polling
    useEffect(() => {
        if (orderId) {
            setLoading(true);
            loadOrder(false).finally(() => {
                setLoading(false);
                // Start polling after initial load
                // Small delay to ensure data is set
                setTimeout(() => {
                    startPolling();
                }, 500);
            });
        }

        // Cleanup on unmount
        return () => {
            stopPolling();
        };
    }, [orderId, loadOrder, startPolling, stopPolling]);

    // Update polling when data changes (to check if we should stop)
    useEffect(() => {
        if (data) {
            const currentStatus = data.status?.[data.status.length - 1]?.status;
            if (currentStatus && isFinalStatus(currentStatus)) {
                stopPolling();
            } else if (!pollingIntervalRef.current) {
                // If not polling and order is active, start polling
                startPolling();
            }
        }
    }, [data, startPolling, stopPolling]);

    function cancelOrder(payload) {
        setLoading(true);
        APIBase.post(`/api/v1/order/${data.id}/status/CANCEL`, payload)
            .then(() => {
                navigate("/", {
                    status: "success",
                    title: "Successfully cancelled your order"
                })
            }).catch(() => {
                globalContext.message.error("Can't cancel this order right now");
            })
            .finally(() => {
                setLoading(false);
            });
    }
    if (loading && !data) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
                <p style={{ marginTop: 16 }}>Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

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
                                    <Button danger htmlType="submit" type="primary" loading={loading}>
                                        Continue
                                    </Button>
                                </Space>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            
            <Row gutter={[0, 16]} md={{ gutter: [24, 24] }}>
                {/* Header with Refresh Button */}
                <Col span={24}>
                    <Card 
                        extra={
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={handleRefresh}
                                loading={refreshing}
                                type="text"
                            >
                                {refreshing ? 'Đang tải...' : 'Làm mới'}
                            </Button>
                        }
                    >
                        <Row justify="space-between" align="middle">
                            <Col>
                                <h2 style={{ margin: 0 }}>Đơn hàng #{data?.id}</h2>
                            </Col>
                            <Col>
                                {data && <OrderStatusTag status={data.status[data.status.length - 1]?.status} />}
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card>
                        {data && <AddressTag data={data} />}
                    </Card>
                </Col>
                <Col span={24}>
                    <Card>
                        {data && data.orderLines.map((item, index) => (
                            <Row key={index} gutter={[16, 16]}>
                                <Col span={6}><img style={{ width: "100%", height: "100%", objectFit: "contain" }} src={getImageUrl(item.productItem.product.picture) || ProductPlaceHolder} alt={item.productItem.product.name} /></Col>
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
                        <Button block danger onClick={() => setModal(true)} loading={loading}>
                            Cancel
                        </Button>
                    </Col>
                }
            </Row>
        </>
    );
}

export default UserOrderDetailPage;