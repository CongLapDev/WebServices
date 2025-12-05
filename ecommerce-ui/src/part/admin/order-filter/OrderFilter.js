import { Col, Input, Divider, Form, Button, Select, Space, Row, DatePicker } from "antd";

function OrderFilter({ onFilter }) {
    return (<Form onFinish={onFilter}>
        <Col span={24} style={{ padding: "0 8px" }}>
            <Divider />
            <Col>
                <label>Status</label>
                <Form.Item name="status">
                    <Select>
                        <Select.Option value="PENDING">PENDING</Select.Option>
                        <Select.Option value="PREPARING">PREPARING</Select.Option>
                        <Select.Option value="DELIVERING">DELIVERING</Select.Option>
                        <Select.Option value="DELIVERED">DELIVERED</Select.Option>
                        <Select.Option value="COMPLETED">COMPLETED</Select.Option>
                        <Select.Option value="CANCEL">CANCEL</Select.Option>
                        <Select.Option value="RETURN">RETURN</Select.Option>
                        <Select.Option value="PAID">PAID</Select.Option>
                    </Select>
                </Form.Item>
            </Col>

            <Divider />
            <Col span={24}>
                <label>Address</label>
                <Form.Item name="address">
                    <Input placeholder="Address" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Row>
                    <Space>
                        <Form.Item name="from">
                            <DatePicker />
                        </Form.Item>
                        <Form.Item name="to">
                            <DatePicker />
                        </Form.Item>
                    </Space>
                </Row>
            </Col>
            <Col>
                <Button block htmlType="reset" type="dashed">Clear</Button>
            </Col>
            <Divider />
            <Col>
                <Button block htmlType="submit" type="primary">Filter</Button>
            </Col>
        </Col>
    </Form>);
}

export default OrderFilter;