import { Col, Input, Divider, Form, Space, Cascader, Select, Row, Button } from "antd";
import { useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import FormList from "antd/es/form/FormList";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";
import SelectVariaton from "../../../components/select-variaion/SelectVariaton";

function VariationOptionSelect({ name, variations, remove, props }) {
    let [selectedVariation, setSelectedVariation] = useState((Array.isArray(variations) && variations.length > 0) ? variations[0] : undefined);
    let [change, setChange] = useState(true);
    return (<>
        <Col span={10}>
            <Form.Item name={[name, "variation"]} {...props}>
                <Select
                    onChange={value => {
                        setSelectedVariation(variations.find(variation_ => variation_.id == value))
                        setChange(change => !change);
                    }}
                    options={variations && variations.map(variation_ => ({ label: variation_.name, value: variation_.id }))}
                />
            </Form.Item>
        </Col>
        <Col span={12}>
            <Form.Item name={[name, "id"]} {...props}>
                <Select
                    options={selectedVariation && Array.isArray(selectedVariation.options) && selectedVariation.options.map(option_ => ({ label: option_.value, value: option_.id }))}
                />
            </Form.Item>
        </Col>
        <Col span={2}>
            <Space style={{ paddingBottom: "24px" }}><Button type="text" icon={<PrefixIcon><i className="fi fi-rr-cross-small"></i></PrefixIcon>} onClick={() => remove(name)}></Button></Space>
        </Col>
    </>)
}


function ProductFilter({ onFilter }) {
    var [categories, setCategories] = useState(undefined);
    const [variations, setVariations] = useState([]);
    function renderCategory(category) {
        return category.children && category.children.map(category_ => ({
            label: category_.name,
            value: category_.id,
            children: renderCategory(category_)
        }))
    }
    useEffect(() => {
        APIBase.get("api/v1/category/1")
            .then(payload => payload.data)
            .then(data => {
                if (data) {
                    var options = renderCategory(data)
                    setCategories(options);
                }
                return APIBase.get(`/api/v1/variation`);
            })
            .then(payload => payload.data)
            .then(data => setVariations(data))
            .catch(console.log)
    }, [])
    return (<Form onFinish={onFilter}>
        <Col span={24} style={{ padding: "0px 8px" }}>
            <Col span={24}>
                <Form.Item name="name" label="Product name">
                    <Input placeholder="Enter product name" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="category">
                    <Cascader options={categories} />
                </Form.Item>
            </Col>
            <Divider />
            <Col span={24}>
                <label>Price</label>
                <Space>
                    <Form.Item name="minPrice"><Input placeholder="min" /></Form.Item>
                    <Form.Item name="minPrice"><Input placeholder="max" /></Form.Item>
                </Space>
            </Col>
            <Divider />
            <Col span={24}>
                <label>Properties</label>
                <FormList name="options">
                    {(fields, { add, remove }) => <>
                        {
                            fields.map(({ key, name, ...props }) => (
                                <Row style={{ width: "100%" }} align="baseline" span={24} key={key}>
                                    <VariationOptionSelect variations={variations} props={props} name={name} remove={remove} />
                                </Row>))
                        }
                        <Col span={24}><Button icon={<PrefixIcon><i className="fi fi-rr-plus"></i></PrefixIcon>} type="dashed" block onClick={() => add()}>Add options</Button></Col>
                    </>}
                </FormList>
            </Col>
            <Divider />
            <Col>
                <Button block htmlType="reset" type="dashed">Clear</Button>
            </Col>
            <Divider />
            <Col>
                <Button block htmlType="submit" type="primary">Filter</Button>
            </Col>
            <Col span={24}>
                <label name="variation"></label>
            </Col>
        </Col>
    </Form>);
}

export default ProductFilter;