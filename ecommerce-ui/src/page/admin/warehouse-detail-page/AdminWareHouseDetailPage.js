import { Row, Col, Card, Upload, Space, Button, Table } from "antd";
import { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";
import { default as LinkStyle } from "antd/es/typography/Link";
import style from './style.module.scss';
function AdminWareHouseDetailPage() {
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState(undefined);
    const globalContext = useContext(GlobalContext);
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [productList, setProductList] = useState(undefined)
    useEffect(() => {
        APIBase.get(`/api/v1/warehouse/${params.get("id")}`).then(payload => payload.data)
            .then(data => {
                setData(data)
                return data;
            })
            .then(data => {
                let products = data.warehouseItems.reduce((pre, currentItem) => {
                    let product = undefined;
                    for (let i = 0; i < pre.length; i++) {
                        if (pre[i].id == currentItem.productItem.productId) {
                            product = pre[i];
                            break;
                        }
                    }
                    if (product) {
                        product.productItems = Array.isArray(product.productItems) ? [currentItem, ...product.productItems] : []
                    } else {
                        pre.push(({
                            ...currentItem.productItem.product,
                            productItems: [currentItem]
                        }))
                    }
                    return pre;
                }, [])
                setProductList(products);
            })
            .catch(() => {
                globalContext.message.error("Error");
            })
    }, [])
    function handleUploadFile() {
        setUploading(true);
        var formData = new FormData();
        formData.append("file", fileList[0])
        APIBase.post(`/api/v1/warehouse/${params.get("id")}/importXLSX`, formData)
            .then(payload => payload.data)
            .then(data => {
                globalContext.message.success("Import successfully");
            })
            .catch(e => {
                globalContext.message.error("Reading file error");
            }).finally(() => {
                setUploading(false);
            })
    }
    return (<Row style={{ padding: "16px" }}>
        <Col span={24}>
            {data && <Card title={data.name}>
                <Col span={24}>
                    <Row>
                        <Space>
                            <Upload beforeUpload={file => {
                                setFileList([file]);
                                return false;
                            }} fileList={fileList} >
                                <Button icon={<PrefixIcon><i className="fi fi-rr-file-upload"></i></PrefixIcon>} type="dashed">Select file</Button>
                            </Upload>
                            <Button loading={uploading} onClick={handleUploadFile}>Import</Button>
                            <Button href={`${APIBase.getUri()}/api/v1/warehouse/importXLSX/sample`}>Download Sample</Button>
                        </Space>
                    </Row>
                </Col>
                <Row style={{ padding: "16px" }}>
                    <table className={style.table} style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <td>PRODUCT_ID</td>
                                <td>PRODUCT</td>
                                <td>MANUFACTURER</td>
                                <td>PRODUCT_ITEM_ID</td>
                                <td>SPEC</td>
                                <td>ORIGINAL PRICE</td>
                                <td>PRICE</td>
                                <td>QUANTITY</td>
                            </tr>
                        </thead>
                        <tbody>
                            {productList && productList.map((item_, index) =>
                                <>
                                    <tr>
                                        <td rowSpan={item_.productItems.length}> <Link to={`/admin/product?id=${item_.id}`}><LinkStyle>{item_.id}</LinkStyle></Link> </td>
                                        <td rowSpan={item_.productItems.length}><Link to={`/admin/product?id=${item_.id}`}>{item_.name} </Link></td>
                                        <td rowSpan={item_.productItems.length}>{item_.manufacturer}</td>
                                        <td>{item_.productItems[0]?.productItem.id}</td>
                                        <td>{item_.productItems[0]?.productItem.options?.map(option_ => option_.value).join(",")}</td>
                                        <td>{item_.productItems[0]?.productItem.originalPrice}</td>
                                        <td>{item_.productItems[0]?.productItem.price}</td>
                                        <td>{item_.productItems[0]?.qty}</td>
                                    </tr>
                                    {item_.productItems.map((item, index) => {
                                        if (index == 0) return false;
                                        return (<tr>
                                            <td>{item.productItem.id}</td>
                                            <td>{item.productItem.options?.map(option_ => option_.value).join(",")}</td>
                                            <td>{item.productItem.originalPrice}</td>
                                            <td>{item.productItem.price}</td>
                                            <td>{item.qty}</td>
                                        </tr>)
                                    })}
                                </>)}
                        </tbody>
                    </table>
                </Row>
            </Card>}
        </Col>
    </Row>);
}

export default AdminWareHouseDetailPage;