import { Card, Row, Col, Pagination, Button } from "antd";
import ProductFilter from "../../../part/admin/product-filter/ProductFilter";
import { useContext, useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import { Link } from "react-router-dom";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon.js";
import PlaceHolder from "../../../assets/image/product_placeholder.png";
function AdminProductManagePage() {
    const [api, setApi] = useState("api/v1/product")
    const [page, setPage] = useState({ page: 0, size: 10 })
    const [filter, setFilter] = useState(undefined);
    const [products, setProducts] = useState(undefined);
    const globalContext = useContext(GlobalContext);
    const [loader, setLoader] = useState(true);
    function onFilter(value) {
        if (value.options) {
            value.options = value.options.map(option_ => option_.id);
        }

        Object.keys(value).forEach(key => {
            if (!value[key]) delete value[key];
        })
        console.log(value)
        if (Array.isArray(value.category) && value.category.length == 2) {
            value.category = value.category[value.category.length - 1];
        }
        if (Object.keys(value).length > 0) setFilter(value);
        else setFilter(undefined);

    }
    useEffect(() => {
        if (filter) {
            setFilter(filter);
            var param = new URLSearchParams(filter);
            var pagination = new URLSearchParams(page);
            setApi(api => `${param.toString()}&${pagination.toString()}`);
        } else {
            setApi(api => `page=${page.page}&size=${page.size}`)
        }
    }, [filter, page])
    useEffect(() => {
        APIBase.get(`api/v1/product?${api}`).then(payload => {
            setProducts(payload.data)
            setLoader(state => !state)
        }).catch(e => {
            globalContext.message.error("Error");
        })
    }, [api])

    return (
        <Card title="Product Manage">
            <Row>
                <Col span={4}>
                    <ProductFilter onFilter={onFilter} />
                </Col>
                <Col span={20}>
                    <Card title={<Row justify="space-between"><span>Product List</span><a target="_blank" href={`${APIBase.getUri()}/api/v1/product/xlsx?${api}`}><Button style={{ backgroundColor: "#0f7a40" }} type="primary" icon={<PrefixIcon><i style={{ color: "white" }} class="fi fi-sr-file-excel"></i></PrefixIcon>}>Export</Button></a></Row>}>
                        <Col span={24}>
                            <Row gutter={[12, 12]}>
                                {products && products.content && products.content.map((product_, index) =>
                                    <Col key={index} span={12} lg={{ span: 4 }}>
                                        <Link to={`/admin/product?id=${product_.id}`}>
                                            <Card cover={<img alt={product_.name} src={product_.picture || PlaceHolder} />} title={product_.name} hoverable={true}>
                                                <p style={{ maxLines: "3", overflow: "hidden", textOverflow: "ellipsis", maxHeight: "40px" }}>{product_.description}</p>
                                            </Card>
                                        </Link>
                                    </Col>
                                )}
                            </Row>
                            <Row justify="end" style={{ padding: "8px 0px" }}>
                                <Pagination onChange={(page, size) => setPage({ page: page - 1, size: size })} defaultCurrent={1} total={products && products.totalElements} />
                            </Row>
                        </Col>
                    </Card>
                </Col>
            </Row>
        </Card>);
}

export default AdminProductManagePage;