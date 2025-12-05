import { Card, Row, Col, Table, Select, Button, Tag, Modal, Input, Flex, Pagination, Form, Space } from "antd";
import { useContext, useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import OrderFilter from "../../../part/admin/order-filter/OrderFilter.js";
import { GlobalContext } from "../../../context";
import { Link } from "react-router-dom";
import OrderStatusTag from "../../../part/admin/order-status-tag/OrderStatusTag.js";
import dayjs from "dayjs";
import PrefixIcon from '../../../components/prefix-icon/PrefixIcon.js';
function AdminOrderManagePage() {
    const [data, setData] = useState({});
    const [page, setPage] = useState({ page: 0, size: 10 })
    const [filter, setFilter] = useState(undefined);
    const globalContext = useContext(GlobalContext);
    const [api, setApi] = useState(`/api/v1/order?page=${page.page}&size=${page.size}`)
    useEffect(() => {
        if (filter) {
            var param = new URLSearchParams(filter);
            var pagination = new URLSearchParams(page);
            setApi(api => `${param.toString()}&${pagination.toString()}`);
        } else {
            setApi(api => `page=${page.page}&size=${page.size}`)
        }
    }, [page, filter])
    useEffect(() => {
        APIBase.get(`/api/v1/order?${api}`)
            .then(payload => payload.data)
            .then(data => {
                setData(data)

            }, [])
            .catch((e) => {
                globalContext.message.error("Error occurred while loading data! Try again");
                console.log(e)
            })
    }, [api])

    function onPageChange([page, size]) {
        setPage(page_ => ({
            page: page - 1,
            size: size
        }));
    }
    console.log(data.totalPages)
    function onFilter(value) {
        Object.keys(value).forEach(key => {
            if (!value[key]) delete value[key];
        })
        if (value.from) {
            value.from = dayjs(value.from).format("YYYY-MM-DD HH-mm-ss")
        }
        if (value.from) {
            value.to = dayjs(value.to).format("YYYY-MM-DD HH-mm-ss")
        }
        if (Object.keys(value).length > 0) setFilter(value);
        else setFilter(undefined);
    }
    const detailOrderColums = [
        {
            title: "Product Name",
            dataIndex: "pdname",
            key: 'pdname'
        },
        {
            title: "Price",
            dataIndex: "price",
            key: 'price'
        },
        {
            title: "Option",
            dataIndex: "option",
            key: "option"
        },
        {
            title: "Quantity",
            dataIndex: "qty",
            key: "qty"
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total"
        }
    ]
    const columns = [
        {
            title: "User",
            dataIndex: "user",
            key: "user",
            children: [
                {
                    title: "First name",
                    dataIndex: "firstname",
                    key: "firstname"
                },
                {
                    title: "Last name",
                    dataIndex: "lastname",
                    key: "lastname"
                }
            ]
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone"
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address"
        },
        {
            title: "Ship Method",
            dataIndex: "shipmethod",
            key: "shipmethod"
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total"
        },
        {
            title: "Status",
            dataIndex: 'status',
            key: "status"
        },
        {
            title: "Action",
            dataIndex: 'action',
            key: "action"
        }
    ]
    return (<Row>
        <Col span={4}>
            <Card>
                <OrderFilter onFilter={onFilter} />
            </Card>
        </Col>
        <Col span={20}>
            <Card title={<Row justify="space-between"><Col>Orders</Col><a target="_blank" href={`${APIBase.getUri()}/api/v1/order/xlsx?${api}`}><Button style={{ backgroundColor: "#0f7a40" }} type="primary" icon={<PrefixIcon><i style={{ color: "white" }} class="fi fi-sr-file-excel"></i></PrefixIcon>}>Export</Button></a></Row>}>
                <Row justify="end">
                    <Col span={24}>

                        <Table
                            style={{ borderColor: "#333" }}
                            pagination={false}
                            expandable={{
                                expandedRowRender: (record) => <Card><Table pagination={false} columns={detailOrderColums} dataSource={record.description} /></Card>,
                                rowExpandable: (record) => !!record.description
                            }}
                            columns={columns}
                            dataSource={data.content && data.content.map((value, index) => ({
                                key: index,
                                id: value.id,
                                firstname: value.user.firstname,
                                lastname: value.user.lastname,
                                phone: value.user.phoneNumber,
                                address: value.address.addressLine1,
                                shipmethod: value.shippingMethod?.name,
                                total: value.total,
                                status: <OrderStatusTag status={value.status[value.status.length - 1].status} />,
                                action: <Link to={`/admin/order?id=${value.id}`}>Detail</Link>,
                                description: value.orderLines.map((orderLine, index) => ({
                                    pdname: orderLine.productItem.product.name,
                                    price: orderLine.productItem.price,
                                    option: orderLine.productItem.options.map(option_ => option_.value).join(","),
                                    qty: orderLine.qty,
                                    total: orderLine.total
                                }))
                            }))} />
                    </Col>
                </Row>
                <Row justify="end">
                    <Pagination onChange={(page, size) => { onPageChange([page, size]) }} defaultCurrent={page} total={data.totalElements} />
                </Row>
            </Card>
        </Col>
    </Row>);

}

export default AdminOrderManagePage;