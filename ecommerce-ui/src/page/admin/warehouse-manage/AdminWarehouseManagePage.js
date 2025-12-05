import { Col, Collapse, Row } from "antd";
import { useContext, useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import { Description } from "../../../components/";
import { GlobalContext } from "../../../context";
import { Link } from "react-router-dom";
function AdminWarehouseManagePage() {
    const [data, setData] = useState();
    const globalContext = useContext(GlobalContext);
    useEffect(() => {
        APIBase.get("/api/v1/warehouse").then(payload => payload.data)
            .then(data => {
                setData(data.map((item_, index) => ({
                    key: index,
                    label: <Link to={`/admin/warehouse/detail?id=${item_.id}`}>{item_.name}</Link>,
                    children: <Col span={24}>
                        <Description>{item_.detail}</Description>
                        <span>{item_.address?.building}</span>
                        <span>{item_.address?.city}</span>
                        <span>{item_.address?.addressLine1}</span>
                        <span>{item_.address?.addressLine2}</span>
                    </Col>
                })));
            }).catch(e => {
                globalContext.message.error("Error");
            })
    }, [])
    return (<Row style={{ padding: "16px" }}>
        <Col span={24}>
            <Collapse items={data} />
        </Col>
    </Row>);
}

export default AdminWarehouseManagePage;