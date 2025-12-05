import { useState, useEffect, useLayoutEffect } from "react";
import { Button, Card, Col, Image, Row, Table } from "antd";
import { Form, useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";
import VariationFormModal from "../../../part/product-item/modal";
import VariationForm from "../../../part/product-item/variation-form-modal";
import ProductItemView from "../../../part/product-item/productItemView";
import clsx from "clsx";
import style from './style.module.scss';
function ProductDetailPage() {
    const [urlParams, setUrlParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [variationForm, setVariationForm] = useState(false);
    const [load, reload] = useState(false);
    useLayoutEffect(() => {
        fetchProduct()
    }, [])
    async function fetchProduct() {
        APIBase.get(`api/v1/product/${urlParams.get("id")}`)
            .then((payload) => {
                setData(payload.data)
            }).catch(console.log)
    }
    return (
        data && <Card title={<Col>
            <h3>{data.name}</h3>
            <p>{data.manufacturer}</p>
        </Col>}>
            <Row gutter={24}>
                <Col span={24}>
                    <Row gutter={[24, 32]} className="p-3">
                        <Col md={4} className="p-3">
                            {data && <Image className="w-100" src={data.picture} />}
                        </Col>
                        <Col md={8} className="p-3">
                            <div>
                                <p>{data.description}</p>
                            </div>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row justify="space-between">
                        <h4>Variation</h4>
                        <Col sm={4}><Button type="primary" className="align-self-end" onClick={() => { setVariationForm(true) }}>Add variation</Button></Col>
                    </Row>
                </Col>
                {data && <VariationFormModal reload={reload} setProduct={setData} product={data} open={variationForm} footer={null} onCancel={() => { setVariationForm(false) }} />}
                <table className={clsx(style.productItemTable)}>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>Image</td>
                            <td>Properties</td>
                            <td>Value</td>
                            <td>Original Price</td>
                            <td>Price</td>
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        {data && Array.isArray(data.productItems) && data.productItems.map((item, index) => <ProductItemView setData={setData} key={index} productItem={item} />)}
                    </tbody>
                </table>
            </Row>
        </Card>
    );
}

export default ProductDetailPage;