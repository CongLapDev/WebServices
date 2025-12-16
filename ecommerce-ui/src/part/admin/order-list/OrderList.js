import { Row, Col, Spin } from 'antd';
import { useState, useEffect, useRef } from 'react';
import APIBase from '../../../api/ApiBase';
import UserOrder from '../user-order/UserOrder';
function OrderList({ state, user }) {
    const [data, setData] = useState([]);
    const [page, setPage] = useState({
        index: 0,
        isEnd: false,
        loaded: false
    });
    const [load, setLoad] = useState(false);
    function scrollToLoad() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        // Kiểm tra nếu người dùng đã cuộn tới cuối trang
        if (scrollTop + windowHeight >= docHeight) {
            setLoad(true);
            fetchOrder(page);
        }
    }
    useEffect(() => {
        console.log(state)
        setData([])
        fetchOrder(page);
        window.addEventListener("scroll", scrollToLoad);
        return () => {
            window.removeEventListener("scroll", scrollToLoad);
        }
    }, [state])
    function fetchOrder(page) {
        if ((!page.isEnd) && (!page.loaded)) {
            // Admin can optionally pass userId to filter specific user's orders
            // If user is provided, include it, otherwise backend shows all orders
            const userIdParam = user?.id ? `&userId=${user.id}` : '';
            APIBase.get(`/api/v1/order?status=${state}${userIdParam}&page=${page.index}`)
                .then(payload => {
                    setData(data_ => {
                        return [...data_, ...payload.data.content];
                    })
                    if (payload.data.totalPages - 1 == page.index) {
                        setPage(page_ => {
                            page_.isEnd = true;
                            return page_;
                        })
                    } else {
                        setPage(page_ => {
                            page_.index = page_.index + 1;
                            page_.loaded = false;
                            return page_;
                        })
                    }
                })
                .catch(console.log)
                .finally(() => {
                    setLoad(false);
                })
        } else {
            setLoad(false)
        }
    }
    return (<Row justify="center">
        <Col span={24} lg={{ span: 16 }} >
            {data.map((item) => <UserOrder key={item.id} data={item} />)}
        </Col>
        {load && <Col span={24}>
            <Row justify="center" style={{ padding: "10px" }}><Spin /></Row>
        </Col>}
    </Row>);
}

export default OrderList;