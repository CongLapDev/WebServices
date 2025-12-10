import { Card, Row, Col, Table, Pagination } from "antd";
import UserFilter from "../../../part/admin/user-filter/UserFilter";
import { useState, useEffect, useContext } from "react";
import APIBase from "../../../api/ApiBase";
import { Link } from "react-router-dom";
import AccountStatusTag from "../../../part/account-status-tag/AccountStatusTag";
import { formatDate } from "../../../utils/dateFormatter";
function AdminUserManagePage() {
    const [api, setApi] = useState("api/v1/product")
    const [page, setPage] = useState({ page: 0, size: 10 })
    const [filter, setFilter] = useState(undefined);
    const [data, setData] = useState();
    const [loader, setLoader] = useState(true);
    function onFilter(value) {
        Object.keys(value).forEach(key => {
            if (!value[key]) delete value[key];
        })
        if (Object.keys(value).length > 0) setFilter(value);
        else setFilter(undefined);
    }
    useEffect(() => {
        if (filter) {
            var param = new URLSearchParams(filter);
            var pagination = new URLSearchParams(page);
            setApi(api => `api/v1/user?${param.toString()}&${pagination.toString()}`);
        } else {
            setApi(api => `api/v1/user?page=${page.page}&size=${page.size}`)
        }
    }, [filter, page])
    useEffect(() => {
        APIBase.get(api).then(payload => {
            setData(payload.data);
        }).catch(console.log).finally(() => {
            setLoader(false);
        })
    }, [api])
    const columns = [
        {
            title: "First Name",
            dataIndex: "firstname",
            key: "firstname",
        },
        {
            title: "Last Name",
            dataIndex: "lastname",
            key: "lastname",
        },
        { title: "Email", dataIndex: "email", key: 'email' },
        { title: "PhoneNumber", dataIndex: "phone", key: 'phone' },
        { title: "Date of Birth", dataIndex: "dob", key: 'dob' },
        { title: "Gender", dataIndex: "gender", key: 'dob' },
        { title: "Status", dataIndex: "status", key: 'status' },
        { title: "Action", dataIndex: "action", key: 'action' }
    ]
    return (<Row>
        <Col span={4}>
            <Card>
                <UserFilter onFilter={onFilter} />
            </Card>
        </Col>
        <Col span={20}>
            <Card style={{ width: "100%" }}>
                <Col span={24}>
                    <Table
                        bordered
                        loading={loader}
                        pagination={false}
                        columns={columns}
                        dataSource={data && data.content.map((user_, key) => ({
                            id: key,
                            firstname: user_.firstname,
                            lastname: user_.lastname,
                            email: user_.email,
                            phone: user_.phoneNumber,
                            dob: formatDate(user_.dateOfBirth),
                            gender: user_.gender,
                            status: <AccountStatusTag status={user_.account?.status} />,
                            action: <Link to={`/admin/user?id=${user_.id}`}>Detail</Link>
                        }))} />
                </Col>
                <Col span={24}>
                    <Row justify="end" style={{ marginTop: "20px" }}>
                        <Pagination total={data && data.totalElements} defaultCurrent={1} onChange={(page, size) => setPage({
                            page: page - 1,
                            size: size
                        })} />
                    </Row>
                </Col>
            </Card>
        </Col>
    </Row>);
}

export default AdminUserManagePage;