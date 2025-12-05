import { Col, Input, Divider, Form, Button, Select, InputNumber, Space } from "antd";


function UserFilter({ onFilter }) {
    return (<Form onFinish={onFilter}>
        <Col span={24} style={{ padding: "0 8px" }}>
            <Col span={24}>
                <label>User name</label>
                <Form.Item name="name">
                    <Input placeholder="Enter User name" />
                </Form.Item>
            </Col>
            <Divider />
            <Col span={24}>
                <label>Provider</label>
                <Form.Item name="provider">
                    <Select>
                        <Select.Option value="SYSTEM">System</Select.Option>
                        <Select.Option value="GOOGLE">Google</Select.Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col>
                <label>Status</label>
                <Form.Item name="status">
                    <Select>
                        <Select.Option value="INACTIVE">In Active</Select.Option>
                        <Select.Option value="ACTIVE">Active</Select.Option>
                        <Select.Option value="LOCKED">Locked</Select.Option>
                        <Select.Option value="VERIFYING">Verifying</Select.Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={24}>
                <label>Age</label>
                <Space>
                    <Form.Item name="from">
                        <InputNumber placeholder="From" />
                    </Form.Item>
                    <Form.Item name="to">
                        <InputNumber placeholder="To" />
                    </Form.Item>
                </Space>
            </Col>
            <Divider />
            <Col span={24}>
                <label>Address</label>
                <Form.Item name="address">
                    <Input placeholder="Address" />
                </Form.Item>
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

export default UserFilter;