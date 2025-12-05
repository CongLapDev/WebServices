import { Row, Col, Card, Avatar, Button, Flex, Statistic, DatePicker, Space } from "antd";
import style from './style.module.scss';
import { useEffect, useMemo, useRef, useState } from "react";
import APIBase from "../../../api/ApiBase";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement, Title } from "chart.js";
import { Line, Pie, getElementAtEvent } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { Description } from "../../../components";
import useAuth from "../../../secure/useAuth";
import AccountStatusTag from "../../../part/account-status-tag/AccountStatusTag";
const { Meta } = Card;
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, ArcElement, Title);

function AdminDashboardPage() {
    const [state, user] = useAuth();
    const [orderStatistics, setOrderStatistics] = useState(undefined);
    const [userStatistic, setUserStatistic] = useState(undefined);
    const chartRef = useRef();
    const [chartIdx, setChartIdx] = useState(0);
    const [prospectiveUser, setProspectiveUser] = useState();
    const [overview, setOverView] = useState(undefined);

    const totalOrders30days = useMemo(() => {
        var date = new Date();
        date.setDate(1)
        return orderStatistics ? orderStatistics.reduce((pre, item_) => {
            if ((new Date(item_.date) - date) / (1000 * 60 * 60 * 24) >= 0) {
                return pre + item_.number_orders_day;
            }
        }, 0) : 0;
    }, [orderStatistics])
    function fetchOrderPerDayStatistic([from, to]) {
        console.log(from, to)
        var params = new URLSearchParams({
            from: from || (() => {
                var date = new Date()
                date.setDate(date.getDate() - 30)
                return date;
            })().toISOString().split("T")[0],
            to: to || new Date().toISOString().split("T")[0]
        });

        APIBase.get(`/api/v1/statistic/day/order?${params.toString()}`)
            .then(payload => {
                setOrderStatistics(payload.data);
                return payload.data;
            })
            .catch(console.error)
    }
    useEffect(() => {
        fetchOrderPerDayStatistic([])
        APIBase.get("/api/v1/statistic/user").then(payload => {
            setUserStatistic(payload.data);
        }).catch(console.error)
        APIBase.get("/api/v1/statistic/user/prospective").then(payload => payload.data).then(setProspectiveUser).catch(console.error)
        APIBase.get("/api/v1/statistic").then(payload => payload.data).then(setOverView).catch(console.error)
    }, [])
    const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
    const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;
    return (<Row style={{ padding: "16px" }} gutter={[16, 16]} align="stretch">
        <Col span={12}>
            <Card>
                <Row justify="center" align="center">
                    <Col className={style.overview} span={8}>
                        <Description>Users</Description>
                        <h3>{overview && overview.number_of_users}</h3>
                    </Col>
                    <Col className={style.overview} span={8}>
                        <Description>Products</Description>
                        <h3>{overview && overview.number_of_products}</h3>
                    </Col>
                    <Col className={style.overview} span={8}>
                        <Description>Warehouses</Description>
                        <h3>{overview && overview.number_of_warehouse}</h3>
                    </Col>
                    <Col className={style.overview} span={8}>
                        <Description>Categories</Description>
                        <h3>{overview && overview.number_of_category}</h3>
                    </Col>
                    <Col className={style.overview} span={8}>
                        <Description>Payment methods</Description>
                        <h3>{overview && overview.available_payment_method}</h3>
                    </Col>
                    <Col className={style.overview} span={8}>
                        <Description>Revenue</Description>
                        <h3>{overview && overview.revenue}</h3>
                    </Col>
                </Row>
            </Card>
        </Col>
        <Col span={6}>
            <Card style={{ height: "100%" }} actions={[
                <Col className={style.statistic}>
                    <Description>Active</Description>
                    <h3>{userStatistic && userStatistic.totalStatus1}</h3>
                </Col>,
                <Col className={style.statistic}>
                    <Description>Inactive</Description>
                    <h3>{userStatistic && userStatistic.totalStatus2}</h3>
                </Col>,
                <Col className={style.statistic}>
                    <Description>Lock</Description>
                    <h3>{userStatistic && userStatistic.totalStatus3}</h3>
                </Col>
            ]}>
                <Statistic title="Users" value={userStatistic && userStatistic.totalAccounts} />
            </Card>
        </Col>
        <Col span={6}>
            <Card
                style={{ height: "100%" }}
                actions={[
                    <Col className={style.statistic}>
                        <Description>Role</Description>
                        <h5>{user && user.account.roles.map(role_ => role_.name).join(' ')}</h5>
                    </Col>,
                    <Col className={style.statistic}>
                        <Description>Status</Description>
                        <h5> {user && <AccountStatusTag status={user.account.status} />}</h5>


                    </Col>,
                    <Col className={style.statistic}>
                        <Description>More Detail</Description>
                        <h3></h3>
                    </Col>
                ]}
            >

                <Card.Meta
                    avatar={<Avatar src={user.picture} />}
                    title={user.lastname + " " + user.firstname} />
                <div style={{ paddingTop: "1rem" }}>
                    <Description>{user.email}</Description>
                </div>
            </Card>
        </Col>
        <Col span={16}>
            <Card title={<Row justify="space-between">
                <span>Orders</span>
                <Space>
                    <DatePicker.RangePicker picker="date" onChange={(from, to) => fetchOrderPerDayStatistic(to)} />
                </Space>
            </Row>}>
                <div className={style.orderStatisticsChart}>
                    {orderStatistics && <Line
                        ref={chartRef}
                        datasetIdKey='id'
                        data={{
                            labels: orderStatistics.map(item_ => item_.date),
                            datasets: [
                                {
                                    id: 1,
                                    borderColor: "#a52a36",
                                    backgroundColor: "#a52a36",
                                    data: orderStatistics.map(item_ => item_.number_orders_day)
                                }
                            ]
                        }}
                        onClick={(e) => {
                            console.log(e)
                            if (getElementAtEvent(chartRef.current, e)[0]) {
                                setChartIdx(getElementAtEvent(chartRef.current, e)[0].index);
                            }
                        }}
                        options={{
                            plugins: {
                                tooltip: {
                                    usePointStyle: true,
                                    callbacks: {
                                        beforeTitle: function (context) {
                                            return "Title"
                                        }
                                    }
                                }
                            }
                        }}
                    />}
                </div>

            </Card>
        </Col>
        <Col span={8}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Statistic title="Number of Orders" value={orderStatistics && orderStatistics.reduce((pre, orderPerDays_) => pre + orderPerDays_.number_orders_day, 0)} />
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Customer" className={style.ubiquitousPd}>
                        <Col span={24}>
                            {orderStatistics && orderStatistics.length > 0 && orderStatistics[chartIdx].products.map((item_, index) => <Row className={style.product} key={index}>
                                <Col span={6}>
                                    <img src={item_.product.picture} />
                                </Col>
                                <Col span={18}>
                                    <Row><Link to={`/admin/product?id=${item_.product.id}`}>{item_.product.name}</Link></Row>
                                    <Row>{item_.qty}</Row>
                                </Col>
                            </Row>)}
                        </Col>
                    </Card>
                </Col>
            </Row>
        </Col>
        <Col span={6}>
            <Card>
                {orderStatistics && <Row justify="center">
                    {(() => {
                        const data = orderStatistics.reduce((pre, item_) => {
                            for (let product of item_.products) {
                                let category = pre.find(category_ => category_.id == product.product.category.id);
                                if (!category) {
                                    pre.push(product.product.category)
                                    pre[pre.length - 1].qty = product.qty;
                                } else {
                                    category.qty = category.qty + product.qty;
                                }
                            }
                            return pre;
                        }, [])
                        return <Pie
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: "% of brands"
                                    }
                                }
                            }}
                            data={{
                                labels: data.map(category_ => category_.name + "/" + category_.parent?.name),
                                datasets: [{
                                    label: "% of brands",
                                    data: data.map(category_ => category_.qty),
                                    backgroundColor: data.map(category_ => randomRGB())
                                }]
                            }} />;
                    })()}
                </Row>}
            </Card>
        </Col>
        <Col span={6}>
            <Card>
                {orderStatistics && <Row justify="center">
                    {(() => {
                        const data = orderStatistics.reduce((pre, item_) => {
                            for (let product of item_.products) {
                                let category = pre.find(category_ => category_.id == product.product.category.parent.id);
                                if (!category) {
                                    pre.push(product.product.category.parent)
                                    pre[pre.length - 1].qty = product.qty;
                                } else {
                                    category.qty = category.qty + product.qty;
                                }
                            }
                            return pre;
                        }, [])
                        return <Pie
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: "% of categories"
                                    }
                                }
                            }}
                            data={{
                                labels: data.map(category_ => category_.name),
                                datasets: [{
                                    label: "% of categories",
                                    data: data.map(category_ => category_.qty),
                                    backgroundColor: data.map(category_ => randomRGB())
                                }]
                            }} />;
                    })()}
                </Row>}
            </Card>
        </Col>
        <Col span={12}>
            <Card title="Prospective customers">
                <Row gutter={12}>
                    {prospectiveUser && prospectiveUser.map((user_, index) => <Col span={12}>
                        <Card
                            key={index}
                            actions={[
                                <Link to={`/admin/user?id=${user_.id}`}><Button type="link">Details</Button></Link>
                            ]}
                        >
                            <Meta

                                description={
                                    <>
                                        <Row><span>Total Orders:{user_.totalOrders}</span></Row>
                                        <Row><span>Total Amount: {user_.totalAmount}</span></Row>
                                    </>
                                }
                                avatar={<Avatar src={user_.picture} />}
                                title={user_.firstname + " " + user_.lastname}
                            />
                        </Card>
                    </Col>)}
                </Row>
            </Card>
        </Col>

    </Row>);
}

export default AdminDashboardPage;