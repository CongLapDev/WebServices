import { Col, Flex, Pagination, Row, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import ProductFilter from "../../../part/user/product-filter/ProductFilter";
import { useContext, useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import { ProductCardv2 } from "../../../components";
import style from './style.module.scss';
function SearchProductPage() {
    const [urlParams, setUrlParams] = useSearchParams();
    const [data, setData] = useState({
        content: [],
        pageable: {
            pageSize: 0,
            pageNumber: 0
        }
    });
    const globalContext = useContext(GlobalContext);
    useEffect(() => {
        var apiParam = new URLSearchParams(urlParams);
        APIBase.get(`/api/v2/product?${apiParam.toString()}`)
            .then(payload => payload.data)
            .then(setData)
            .catch(e => {
                console.log(e)
                globalContext.message.error("Error while fetching products");
            })
    }, [urlParams])

    return (
        <Row gutter={{ xs: 6, sm: 8, md: 12, lg: 16 }}>
            <Col span={24}>
                <h2>Search Result</h2>
            </Col>
            <Col span={24}>
                <Row className={style.filter} gutter={[16, 16]}>
                    <Col span={12} md={{ span: 8 }} style={{ overflowX: "scroll" }}>
                        <ProductFilter onFilter={params_ => {
                            setUrlParams(urlSearchParams_ => {
                                params_.entries().forEach(([key, value]) => {
                                    if (value) urlSearchParams_.set(key, value);
                                    else urlSearchParams_.delete(key);
                                });
                                return urlParams;
                            })
                        }} />
                    </Col>
                    <Col span={12} md={{ span: 6 }}>
                        <Select
                            style={{ width: "100%" }}
                            options={[
                                {
                                    label: "From Top",
                                    value: 1,

                                }, {
                                    label: "From Bottom",
                                    value: 2
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row gutter={[16, 16]}>
                    {data.content.map((product_, index) => <Col key={index} span={12} md={{ span: 6 }} lg={{ span: 4 }} ><ProductCardv2 data={product_} /></Col>)}
                </Row>
            </Col>
            <Col span={24}>
                {data && <Flex justify="end"><Pagination pageSize={data.pageable.pageSize} current={data.pageable.pageNumber + 1} /></Flex>}
            </Col>
        </Row>);
}

export default SearchProductPage;