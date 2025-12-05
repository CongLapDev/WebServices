import { Row, Col, Select, Flex } from "antd";
import { memo, useState } from "react";
function ProductFilter({ onFilter }) {
    const [params, setParams] = useState(new Map());
    return (<Row gutter={[12, 12]}>
        <Col span={24}  >
            <Flex align="center" direction="horizontal">
                <span style={{ marginRight: "12px" }}>Range</span>
                <Select style={{ flex: 1 }}
                    onChange={value => {
                        setParams(params_ => {
                            let [from, to] = value ? value.split("-") : [undefined, undefined];
                            params_.set("price-min", from);
                            params_.set("price-max", to);
                            return params_;
                        })
                        onFilter(params)
                    }}
                    options={[
                        {
                            label: "0-2.000.000",
                            value: "0-2000000",
                        },
                        {
                            label: "2.000.000-5.000.000",
                            value: "2000000-5000000"
                        },
                        {
                            label: "5.000.000-10.000.000",
                            value: "5000000-10000000",
                        },
                        {
                            label: "10.000.000-15.000.000",
                            value: "10000000-15000000",
                        },
                        {
                            label: "15.000.000-20.000.000",
                            value: "15000000-20000000",
                        },
                        {
                            label: "20.000.000-30.000.000",
                            value: "20000000-30000000",
                        },
                        {
                            label: "Above 30.000.000",
                            value: "30000000",
                        },
                        {
                            label: "All",
                            value: 0
                        }
                    ]}
                />
            </Flex>
        </Col>
    </Row>);
}

export default memo(ProductFilter);