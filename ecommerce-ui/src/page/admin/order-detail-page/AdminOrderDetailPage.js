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
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
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
            })
            .catch(() => {
                globalContext.message.error("Không thể tải thông tin đơn hàng");
            });
    };

    // ========== ACTION HANDLERS ==========

    const handleConfirmOrder = () => {
        confirm({
            title: 'Xác nhận đơn hàng',
            icon: <CheckCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xác nhận đơn hàng này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                setActionLoading(true);
                try {
                    const response = await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/confirm`,
                        { note: 'Đơn hàng đã được xác nhận bởi admin' }
                    );
                    globalContext.message.success('✅ Đã xác nhận đơn hàng!');
                    loadOrder(); // Reload order
                } catch (error) {
                    globalContext.message.error('Lỗi xác nhận: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handlePrepareOrder = () => {
        let note = '';
        confirm({
            title: 'Bắt đầu chuẩn bị hàng',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Thông báo kho bắt đầu chuẩn bị sản phẩm.</p>
                    <TextArea
                        placeholder="Ghi chú (optional)"
                        rows={3}
                        onChange={(e) => note = e.target.value}
                    />
                </div>
            ),
            okText: 'Bắt đầu chuẩn bị',
            cancelText: 'Hủy',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/prepare`,
                        { note: note || 'Kho đang chuẩn bị hàng' }
                    );
                    globalContext.message.success('📦 Đã chuyển sang chuẩn bị hàng!');
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Lỗi: ' + error.message);
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
            title: 'Giao hàng cho shipper',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Nhập mã vận đơn:</p>
                    <Input
                        placeholder="Mã vận đơn (tracking number)"
                        style={{ marginBottom: 10 }}
                        onChange={(e) => {
                            trackingNumber = e.target.value;
                            validationResult = validateTrackingNumber(trackingNumber);
                        }}
                    />
                    <Alert
                        message="Định dạng mã vận đơn"
                        description={getTrackingFormatHint()}
                        type="info"
                        showIcon
                        style={{ marginBottom: 10, fontSize: 12 }}
                    />
                    <TextArea
                        placeholder="Ghi chú (optional)"
                        rows={2}
                        onChange={(e) => note = e.target.value}
                    />
                </div>
            ),
            okText: 'Giao cho shipper',
            cancelText: 'Hủy',
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
                            note: note || `Đơn hàng đã giao cho shipper ${validation.carrier || ''}`,
                            trackingNumber: trackingNumber
                        }
                    );
                    globalContext.message.success(`🚚 Đã giao cho ${validation.carrier || 'shipper'}!`);
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Lỗi: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleDeliverOrder = () => {
        confirm({
            title: 'Xác nhận đã giao hàng',
            icon: <CheckCircleOutlined />,
            content: (
                <div>
                    <p>Xác nhận shipper đã giao hàng thành công và thu tiền COD?</p>
                    <p style={{ color: '#52c41a', fontWeight: 'bold' }}>
                        Số tiền COD: {data?.total?.toLocaleString()}₫
                    </p>
                </div>
            ),
            okText: 'Đã giao hàng',
            cancelText: 'Chưa',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/deliver`,
                        { note: `Giao hàng thành công. Đã thu ${data.total.toLocaleString()}₫` }
                    );
                    globalContext.message.success('✅ Đã giao hàng thành công!');
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Lỗi: ' + error.message);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleCompleteOrder = () => {
        confirm({
            title: 'Hoàn tất đơn hàng',
            icon: <CheckCircleOutlined />,
            content: 'Xác nhận hoàn tất đơn hàng này? Sau khi hoàn tất không thể thay đổi.',
            okText: 'Hoàn tất',
            okType: 'primary',
            cancelText: 'Hủy',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await APIBase.post(
                        `/api/v1/order/${params.get("id")}/status/complete`,
                        { note: 'Đơn hàng hoàn tất' }
                    );
                    globalContext.message.success('🎉 Đơn hàng đã hoàn tất!');
                    loadOrder();
                } catch (error) {
                    globalContext.message.error('Lỗi: ' + error.message);
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
                globalContext.message.success('Đã hủy đơn hàng');
                setCancelModal(false);
                loadOrder();
            })
            .catch(() => {
                globalContext.message.error('Lỗi khi hủy đơn');
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
                    message={statusId === 7 ? '🎉 Đơn hàng đã hoàn tất' : '❌ Đơn hàng đã bị hủy'}
                    description={
                        statusId === 7
                            ? 'Không cần thao tác thêm. Đơn hàng đã được xử lý thành công.'
                            : `Lý do: ${currentStatus.note}`
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
                    message="💡 Bước tiếp theo"
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
                            ✅ Xác nhận đơn hàng
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
                            📦 Bắt đầu chuẩn bị hàng
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
                            🚚 Giao cho shipper
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
                            ✅ Đã giao hàng thành công
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
                            🎉 Hoàn tất đơn hàng
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
                            ❌ Hủy đơn hàng
                        </Button>
                    )}
                </Space>
            </div>
        );
    };

    const getNextStepHint = (statusId) => {
        const hints = {
            1: 'Kiểm tra thông tin đơn hàng và xác nhận',
            3: 'Thông báo kho bắt đầu chuẩn bị sản phẩm',
            4: 'Đóng gói xong, giao cho shipper và nhập mã vận đơn',
            5: 'Chờ shipper giao hàng và thu tiền COD',
            6: 'Xác nhận đơn hàng hoàn tất (hoặc tự động sau 3 ngày)'
        };
        return hints[statusId] || 'Xử lý đơn hàng';
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
                                title: 'Đơn hàng đã bị hủy',
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
            { id: 1, title: 'Chờ xác nhận' },
            { id: 3, title: 'Đã xác nhận' },
            { id: 4, title: 'Chuẩn bị hàng' },
            { id: 5, title: 'Đang giao' },
            { id: 6, title: 'Đã giao' },
            { id: 7, title: 'Hoàn tất' }
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
                        description: index === currentStep ? '← Bạn đang ở đây' : null
                    }))}
                />
            </Card>
        );
    };

    // ========== RENDER ==========

    if (!data) {
        return <div style={{ padding: 24, textAlign: 'center' }}>Đang tải...</div>;
    }

    const currentStatus = getCurrentStatus(data);

    return (
        <>
            {/* Cancel Order Modal */}
            <Modal
                title="Hủy đơn hàng"
                open={cancelModal}
                onCancel={() => setCancelModal(false)}
                footer={null}
            >
                <Alert
                    message="Cảnh báo"
                    description="Hành động này không thể hoàn tác!"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Form onFinish={handleCancelOrder}>
                    <Form.Item
                        name="note"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do hủy đơn' }]}
                    >
                        <TextArea placeholder="Lý do hủy đơn (bắt buộc)" rows={3} />
                    </Form.Item>
                    <Form.Item name="detail">
                        <TextArea placeholder="Chi tiết (optional)" rows={2} />
                    </Form.Item>
                    <Row justify="end">
                        <Space>
                            <Button onClick={() => setCancelModal(false)}>Hủy</Button>
                            <Button type="primary" danger htmlType="submit" loading={actionLoading}>
                                Xác nhận hủy đơn
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
                                <h2 style={{ margin: 0 }}>Đơn hàng #{data.id}</h2>
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
                            <Card title="👤 Khách hàng">
                                <Card.Meta
                                    avatar={<Avatar src={data.user.picture} />}
                                    title={`${data.user.firstname} ${data.user.lastname}`}
                                    description={data.user.email}
                                />
                                {data.user.phoneNumber && (
                                    <p style={{ marginTop: 12 }}>
                                        <strong>SĐT:</strong> {data.user.phoneNumber}
                                    </p>
                                )}
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="📍 Địa chỉ giao hàng">
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
                                        <Statistic title="📅 Ngày đặt" value={formatDateTime(data.orderDate)} />
                                    </Card>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Card>
                                        <Statistic title="💰 Tổng tiền" value={data.total} suffix="₫" />
                                    </Card>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Card>
                                        <Statistic
                                            title="🚚 Vận chuyển"
                                            value={data.shippingMethod?.price || 0}
                                            suffix="₫"
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                        {/* Products & Actions */}
                        <Col xs={24} lg={18}>
                            <Card title="📦 Sản phẩm">
                                        {data.orderLines.map((item, index) => (
                                    <div key={index}>
                                        <Row gutter={[16, 16]} align="middle">
                                            <Col xs={6} sm={4}>
                                                <img
                                                    style={{ width: "100%", height: "auto" }}
                                                    src={item.productItem.product.picture}
                                                    alt={item.productItem.product.name}
                                                />
                                            </Col>
                                            <Col xs={18} sm={20}>
                                                <h4>{item.productItem.product.name}</h4>
                                                <Tag color="blue">
                                                    {item.productItem.options.map(opt => opt.value).join(", ")}
                                                </Tag>
                                                <Row justify="space-between" style={{ marginTop: 8 }}>
                                                    <Col>Số lượng: {item.qty}</Col>
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
                                    <h3>Tổng cộng: <span style={{ color: '#52c41a' }}>
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
                                    <Card title="💳 Thanh toán">
                                        <p><strong>Phương thức:</strong></p>
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
                                                <Card title="🚚 Vận chuyển">
                                                    <p><strong>Mã vận đơn:</strong></p>
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
                                                            🔍 Tra cứu vận đơn
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
                                    <Card title="⚡ Thao tác">
                                        {getActionButtons()}
                                            </Card>
                                        </Col>

                                {/* Status History */}
                                        <Col span={24}>
                                    <Card title="📜 Lịch sử">
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
