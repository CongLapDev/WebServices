import { 
    Card, Row, Col, Space, Statistic, Timeline, Divider, 
    Tag, Button, Modal, Form, Input, Avatar, Alert, Steps
} from "antd";
import { 
    CheckCircleOutlined, CloseCircleOutlined, 
    ExclamationCircleOutlined, SyncOutlined 
} from '@ant-design/icons';
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import APIBase, { getImageUrl } from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import PlaceHolder from "../../../assets/image/product_placeholder.png";
import { Currency, Description } from "../../../components";
import OrderStatusTag from "../../../part/admin/order-status-tag/OrderStatusTag";
import { formatDateTime } from "../../../utils/dateFormatter";
import { 
    getCurrentStatus, 
    getStatusLabel, 
    canCancelOrder, 
    isFinalStatus 
} from "../../../utils/orderUtils";
import { 
    validateTrackingNumber, 
    getTrackingUrl, 
    getTrackingFormatHint 
} from "../../../utils/validationUtils";

const { confirm } = Modal;
const { TextArea } = Input;

function AdminOrderDetailPage() {
    const [params] = useSearchParams();
    const [data, setData] = useState();
    const [actionLoading, setActionLoading] = useState(false);
    const globalContext = useContext(GlobalContext);
    const [cancelModal, setCancelModal] = useState(false);

    useEffect(() => {
        loadOrder();
    }, []);

    const loadOrder = () => {
        APIBase.get(`/api/v1/order/${params.get("id")}`)
            .then(payload => payload.data)
            .then(data => {
                setData(data);
                console.log('Order loaded:', data);
                console.log('Order date raw:', data.orderDate, 'Type:', typeof data.orderDate);
            })
            .catch(() => {
                globalContext.message.error("Unable to load order information");
            });
    };

    // ========== ACTION HANDLERS ==========

    const handleConfirmOrder = () => {
        confirm({
            title: 'Confirm Order',
            icon: <CheckCircleOutlined />,
            content: 'Are you sure you want to confirm this order?',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: async () => {
                setActionLoading(true);
                try {
                    const response = await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/confirm`,
                        { note: 'Order confirmed by admin' }
                    );
                    globalContext.message.success('✅ Order confirmed!');
                    loadOrder(); // Reload order
                } catch (error) {
                    globalContext.message.error('Confirmation error: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handlePrepareOrder = () => {
        let note = '';
        confirm({
            title: 'Start Preparing Order',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Notify warehouse to start preparing products.</p>
                    <TextArea
                        placeholder="Note (optional)"
                        rows={3}
                        onChange={(e) => note = e.target.value}
                    />
                </div>
            ),
            okText: 'Start Preparing',
            cancelText: 'Cancel',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/prepare`,
                        { note: note || 'Warehouse is preparing order' }
                    );
                    globalContext.message.success('📦 Order moved to preparing!');
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Error: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleShipOrder = () => {
        let trackingNumber = '';
        let note = '';
        let validationResult = null;
        
        confirm({
            title: 'Ship Order',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Enter tracking number:</p>
                    <Input
                        placeholder="Tracking number"
                        style={{ marginBottom: 10 }}
                        onChange={(e) => {
                            trackingNumber = e.target.value;
                            validationResult = validateTrackingNumber(trackingNumber);
                        }}
                    />
                    <Alert
                        message="Tracking Number Format"
                        description={getTrackingFormatHint()}
                        type="info"
                        showIcon
                        style={{ marginBottom: 10, fontSize: 12 }}
                    />
                    <TextArea
                        placeholder="Note (optional)"
                        rows={2}
                        onChange={(e) => note = e.target.value}
                    />
                </div>
            ),
            okText: 'Ship Order',
            cancelText: 'Cancel',
            onOk: async () => {
                // Validate tracking number
                const validation = validateTrackingNumber(trackingNumber);
                
                if (!validation.valid) {
                    globalContext.message.error(validation.message);
                    return Promise.reject();
                }
                
                if (validation.warning) {
                    globalContext.message.warning(validation.warning);
                }
                
                setActionLoading(true);
                try {
                    await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/ship`,
                        {
                            note: note || `Order shipped via ${validation.carrier || 'carrier'}`,
                            trackingNumber: trackingNumber
                        }
                    );
                    globalContext.message.success(`🚚 Shipped via ${validation.carrier || 'carrier'}!`);
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Error: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleDeliverOrder = () => {
        confirm({
            title: 'Confirm Delivery',
            icon: <CheckCircleOutlined />,
            content: (
                <div>
                    <p>Confirm that the order has been delivered successfully and COD payment collected?</p>
                    <p style={{ color: '#52c41a', fontWeight: 'bold' }}>
                        COD Amount: {data?.total?.toLocaleString()}₫
                    </p>
                </div>
            ),
            okText: 'Delivered',
            cancelText: 'Not Yet',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/deliver`,
                        { note: `Delivery successful. COD payment of ${data.total.toLocaleString()}₫ collected` }
                    );
                    globalContext.message.success('✅ Order delivered successfully!');
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Error: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleCompleteOrder = () => {
        confirm({
            title: 'Complete Order',
            icon: <CheckCircleOutlined />,
            content: 'Confirm to complete this order? This action cannot be undone.',
            okText: 'Complete',
            okType: 'primary',
            cancelText: 'Cancel',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/complete`,
                        { note: 'Order completed' }
                    );
                    globalContext.message.success('🎉 Order completed!');
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Error: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleCancelOrder = (formData) => {
        setActionLoading(true);
        APIBase.post(`/api/v1/order/${params.get("id")}/cancel`, formData)
            .then(() => {
                globalContext.message.success('Order cancelled');
                setCancelModal(false);
                loadOrder();
            })
            .catch(() => {
                globalContext.message.error('Error cancelling order');
            })
            .finally(() => {
                setActionLoading(false);
            });
    };

    // ========== GET ACTION BUTTONS BY STATUS ==========

    const getActionButtons = () => {
        if (!data) return null;

        const currentStatus = getCurrentStatus(data);
        if (!currentStatus) return null;

        const statusId = currentStatus.status;

        // Final states - show message only
        if (isFinalStatus(statusId)) {
            return (
                <Alert
                    message={statusId === 7 ? '🎉 Order Completed' : '❌ Order Cancelled'}
                    description={
                        statusId === 7
                            ? 'No further action needed. Order has been processed successfully.'
                            : `Reason: ${currentStatus.note}`
                    }
                    type={statusId === 7 ? 'success' : 'error'}
                    showIcon
                    style={{ marginTop: 16 }}
                />
            );
        }

        // Active states - show action buttons
        return (
            <div style={{ marginTop: 16 }}>
                <Alert
                    message="💡 Next Step"
                    description={getNextStepHint(statusId)}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Primary Action Button */}
                    {statusId === 1 && ( // PENDING_PAYMENT
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={handleConfirmOrder}
                            loading={actionLoading}
                            block
                        >
                            ✅ Confirm Order
                        </Button>
                    )}

                    {statusId === 3 && ( // CONFIRMED
                        <Button
                            type="primary"
                            size="large"
                            icon={<SyncOutlined />}
                            onClick={handlePrepareOrder}
                            loading={actionLoading}
                            block
                        >
                            📦 Start Preparing
                        </Button>
                    )}

                    {statusId === 4 && ( // PREPARING
                        <Button
                            type="primary"
                            size="large"
                            icon={<SyncOutlined />}
                            onClick={handleShipOrder}
                            loading={actionLoading}
                            block
                        >
                            🚚 Ship Order
                        </Button>
                    )}

                    {statusId === 5 && ( // SHIPPING
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={handleDeliverOrder}
                            loading={actionLoading}
                            block
                        >
                            ✅ Confirm Delivery
                        </Button>
                    )}

                    {statusId === 6 && ( // DELIVERED
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={handleCompleteOrder}
                            loading={actionLoading}
                            block
                        >
                            🎉 Complete Order
                        </Button>
                    )}

                    {/* Cancel Button (if allowed) */}
                    {canCancelOrder(statusId) && (
                        <Button
                            danger
                            size="large"
                            icon={<CloseCircleOutlined />}
                            onClick={() => setCancelModal(true)}
                            loading={actionLoading}
                            block
                        >
                            ❌ Cancel Order
                        </Button>
                    )}
                </Space>
            </div>
        );
    };

    const getNextStepHint = (statusId) => {
        const hints = {
            1: 'Review order information and confirm',
            3: 'Notify warehouse to start preparing products',
            4: 'After packaging, ship order and enter tracking number',
            5: 'Wait for carrier to deliver and collect COD payment',
            6: 'Confirm order completion (or auto-complete after 3 days)'
        };
        return hints[statusId] || 'Process order';
    };

    // ========== RENDER ORDER TIMELINE ==========

    const renderTimeline = () => {
        if (!data) return null;

        const currentStatus = getCurrentStatus(data);
        if (!currentStatus) return null;

        const currentStatusId = currentStatus.status;

        // For CANCELLED orders
        if (currentStatusId === 8) {
            return (
                <Card style={{ marginBottom: 16 }}>
                    <Steps
                        current={0}
                        status="error"
                        items={[
                            {
                                title: 'Order Cancelled',
                                icon: <CloseCircleOutlined />,
                                description: currentStatus.note
                            }
                        ]}
                    />
                </Card>
            );
        }

        // Normal workflow steps
        const workflowSteps = [
            { id: 1, title: 'To Pay' },
            { id: 3, title: 'Confirmed' },
            { id: 4, title: 'Preparing' },
            { id: 5, title: 'Shipping' },
            { id: 6, title: 'Delivered' },
            { id: 7, title: 'Completed' }
        ];

        let currentStep = 0;
        workflowSteps.forEach((step, index) => {
            if (currentStatusId >= step.id) {
                currentStep = index;
            }
        });

        return (
            <Card style={{ marginBottom: 16 }}>
                <Steps
                    current={currentStep}
                    status={currentStatusId === 7 ? 'finish' : 'process'}
                    items={workflowSteps.map((step, index) => ({
                        title: step.title,
                        description: index === currentStep ? '← Current step' : null
                    }))}
                />
            </Card>
        );
    };

    // ========== RENDER ==========

    if (!data) {
        return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
    }

    const currentStatus = getCurrentStatus(data);

    return (
        <>
            {/* Cancel Order Modal */}
            <Modal
                title="Cancel Order"
                open={cancelModal}
                onCancel={() => setCancelModal(false)}
                footer={null}
            >
                <Alert
                    message="Warning"
                    description="This action cannot be undone!"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Form onFinish={handleCancelOrder}>
                    <Form.Item
                        name="note"
                        rules={[{ required: true, message: 'Please enter cancellation reason' }]}
                    >
                        <TextArea placeholder="Cancellation reason (required)" rows={3} />
                    </Form.Item>
                    <Form.Item name="detail">
                        <TextArea placeholder="Details (optional)" rows={2} />
                    </Form.Item>
                    <Row justify="end">
                        <Space>
                            <Button onClick={() => setCancelModal(false)}>Cancel</Button>
                            <Button type="primary" danger htmlType="submit" loading={actionLoading}>
                                Confirm Cancellation
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>

            {/* Main Content */}
            <Row style={{ padding: "16px" }} gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <h2 style={{ margin: 0 }}>Order #{data.id}</h2>
                            </Col>
                            <Col>
                                <OrderStatusTag status={currentStatus?.status} />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Timeline */}
                <Col span={24}>
                    {renderTimeline()}
                </Col>

                {/* Customer Info */}
                <Col xs={24} lg={6}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="👤 Customer">
                                <Card.Meta
                                    avatar={<Avatar src={data.user.picture} />}
                                    title={`${data.user.firstname} ${data.user.lastname}`}
                                    description={data.user.email}
                                />
                                {data.user.phoneNumber && (
                                    <p style={{ marginTop: 12 }}>
                                        <strong>Phone:</strong> {data.user.phoneNumber}
                                    </p>
                                )}
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="📍 Delivery Address">
                                    <p>{data.address.city}</p>
                                    <Description>{data.address.region}</Description>
                                    <Description>{data.address.addressLine1}</Description>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Order Details */}
                <Col xs={24} lg={18}>
                    <Row gutter={[16, 16]}>
                        {/* Stats */}
                        <Col span={24}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Statistic title="📅 Order Date" value={formatDateTime(data.orderDate)} />
                                    </Card>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Card>
                                        <Statistic title="💰 Total" value={data.total} suffix="₫" />
                                    </Card>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Card>
                                        <Statistic
                                            title="🚚 Shipping"
                                            value={data.shippingMethod?.price || 0}
                                            suffix="₫"
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                        {/* Products & Actions */}
                        <Col xs={24} lg={18}>
                            <Card title="📦 Products">
                                        {data.orderLines.map((item, index) => (
                                    <div key={index}>
                                        <Row gutter={[16, 16]} align="middle">
                                            <Col xs={6} sm={4}>
                                                <img
                                                    style={{ width: "100%", height: "auto" }}
                                                    src={getImageUrl(item.productItem.product.picture) || PlaceHolder}
                                                    alt={item.productItem.product.name}
                                                />
                                            </Col>
                                            <Col xs={18} sm={20}>
                                                <h4>{item.productItem.product.name}</h4>
                                                <Tag color="blue">
                                                    {item.productItem.options.map(opt => opt.value).join(", ")}
                                                </Tag>
                                                <Row justify="space-between" style={{ marginTop: 8 }}>
                                                    <Col>Quantity: {item.qty}</Col>
                                                    <Col>
                                                        <strong><Currency value={item.total} /></strong>
                                                </Col>
                                            </Row>
                                            </Col>
                                        </Row>
                                        {index < data.orderLines.length - 1 && <Divider />}
                                    </div>
                                ))}
                                        <Divider />
                                <Row justify="end">
                                    <h3>Total: <span style={{ color: '#52c41a' }}>
                                        <Currency value={data.total} />
                                    </span></h3>
                                </Row>
                            </Card>
                        </Col>

                        {/* Right Sidebar */}
                        <Col xs={24} lg={6}>
                            <Row gutter={[16, 16]}>
                                {/* Payment Method */}
                                <Col span={24}>
                                    <Card title="💳 Payment">
                                        <p><strong>Method:</strong></p>
                                        <Tag color="gold">{data.payment?.type.name}</Tag>
                                    </Card>
                                </Col>

                                {/* Tracking Number (if shipping) */}
                                {(() => {
                                    const shippingStatus = data.status.find(s => s.status === 5); // SHIPPING
                                    if (shippingStatus && shippingStatus.detail) {
                                        const validation = validateTrackingNumber(shippingStatus.detail);
                                        const trackingUrl = getTrackingUrl(shippingStatus.detail, validation.carrier);
                                        
                                        return (
                                            <Col span={24}>
                                                <Card title="🚚 Shipping">
                                                    <p><strong>Tracking Number:</strong></p>
                                                    <Tag color="purple">{shippingStatus.detail}</Tag>
                                                    {validation.carrier && (
                                                        <p style={{ marginTop: 8 }}>
                                                            <Tag color="blue">{validation.carrier}</Tag>
                                                        </p>
                                                    )}
                                                    {trackingUrl && (
                                                        <Button
                                                            type="link"
                                                            href={trackingUrl}
                                                            target="_blank"
                                                            style={{ paddingLeft: 0 }}
                                                        >
                                                            🔍 Track Package
                                                        </Button>
                                                    )}
                                                </Card>
                                            </Col>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Action Buttons */}
                                        <Col span={24}>
                                    <Card title="⚡ Actions">
                                        {getActionButtons()}
                                            </Card>
                                        </Col>

                                {/* Status History */}
                                        <Col span={24}>
                                    <Card title="📜 History">
                                        <Timeline
                                            items={data.status.map(item => ({
                                                children: (
                                                    <div>
                                                        <OrderStatusTag status={item.status} />
                                                        <h4 style={{ marginTop: 8 }}>{item.note}</h4>
                                                        {item.detail && (
                                                            <Description>{item.detail}</Description>
                                                        )}
                                                        <Description>{formatDateTime(item.updateAt)}</Description>
                                                    </div>
                                                )
                                            })).reverse()}
                                        />
                                            </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    );
}

export default AdminOrderDetailPage;
