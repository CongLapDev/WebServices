import { Card, Col, Row, Statistic, Button } from "antd";
import { Tabs, PrefixIcon, LinkListItem } from "../../../components";
import { useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";
import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context";
import OrderList from "../../../part/admin/order-list/OrderList";
import AccountStatusTag from "../../../part/account-status-tag/AccountStatusTag";
function AdminUserDetailPage() {
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState();
    const globalContext = useContext(GlobalContext);
    const [load, setLoad] = useState(true);
    function reload() {
        setLoad(o => !o);
    }
    useEffect(() => {
        APIBase.get(`/api/v1/user/${params.get("id")}`).then(payload => {
            setData(payload.data);
        }).catch(() => {
            globalContext.message.error("Error");
        })
    }, []);
    function changeStatus(status) {
        APIBase.put(`api/v1/account/${data.account.id}/status/${status}`, {
            id: data.id
        }).then(() => {
            setData(data_ => {
                data_.account.status = 2;
                return data;
            })
            globalContext.message.success(`Update status ${status} success`);
            reload();

        }).catch(e => {
            globalContext.message.error("Error");
        })
    }
    var items = [
        {
            key: 1,
            label: "To Pay",
            children: <OrderList state="PENDING" user={data} />
        },
        {
            key: 2,
            label: "Preparing",
            children: <OrderList state="PREPARING" user={data} />
        },
        {
            key: 3,
            label: "Delivering",
            children: <OrderList state="DELIVERING" user={data} />
        },
        {
            key: 4,
            label: "Delivered",
            children: <OrderList state="DELIVERED" user={data} />
        },
        {
            key: 5,
            label: "Completed",
            children: <OrderList state="COMPLETED" user={data} />
        },
        {
            key: 6,
            label: "Cancelled",
            children: <OrderList state="CANCEL" user={data} />
        },
        {
            key: 7,
            label: "Return",
            children: <OrderList state="RETURN" user={data} />
        }
    ]
    return (data && <Row style={{ padding: "16px" }} gutter={[16, 16]}>
        <Col span={7}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Col>
                            <Row justify="center"><img style={{ width: "60%", aspectRatio: "1/1", borderRadius: "50%" }} alt='avatar' src={data.picture} /></Row>
                            <h3 className="text-center pt-4">{`${data.lastname} ${data.firstname}`}</h3>
                        </Col>
                        <LinkListItem title="Email" prefix={<PrefixIcon><i className="fi fi-rr-envelope"></i></PrefixIcon>}>
                            {data.email}
                        </LinkListItem>                        <LinkListItem title="Phone" prefix={<PrefixIcon><i className="fi fi-rr-phone-call"></i></PrefixIcon>}>
                            {data.phoneNumber}
                        </LinkListItem>
                        <LinkListItem title="Gender" prefix={<i className="fi fi-rr-venus-mars"></i>}>
                            {data.gender}
                        </LinkListItem>
                        <LinkListItem title="Birthday" prefix={<PrefixIcon><i className="fi fi-rr-cake-birthday"></i></PrefixIcon>}>
                            {data.dateOfBirth}
                        </LinkListItem>
                        <Row style={{ paddingTop: "16px" }} gutter={[16, 16]}>
                            {data.account.status != 2 && <Col span={12}><Button onClick={() => changeStatus("INACTIVE")} type="primary" danger block>Inactive</Button></Col>}
                            {data.account.status != 3 && <Col span={12}><Button style={{ backgroundColor: "orange" }} onClick={() => changeStatus("LOCK")} type="primary" block>Lock</Button></Col>}
                            {data.account.status != 1 && <Col span={12}><Button onClick={() => changeStatus("ACTIVE")} type="primary" block>Active</Button></Col>}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Col>
        <Col span={17}>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card><Statistic title="Number of orders" value="" /></Card>
                </Col>
                <Col span={6}>
                    <Card><Statistic title="Number of products" value="" /></Card>
                </Col>
                <Col span={6}>
                    <Card><Statistic title="Account status" formatter={value => <AccountStatusTag status={value} />} value={data.account.status} /></Card>
                </Col>
                <Col span={24}>
                    <Card>
                        <Tabs items={items} />
                    </Card>
                </Col>
            </Row>
        </Col>

    </Row>);
}

export default AdminUserDetailPage;