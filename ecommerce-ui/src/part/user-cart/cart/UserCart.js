import { useEffect, useState, useMemo } from "react";
import OrderItem from "../../../components/order-item/OrderItem";
import { Row, Col, Button, Card } from 'antd';
import style from './style.module.scss';
import APIBase from "../../../api/ApiBase";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../secure/useAuth";
import { Spin } from "antd";
import { debounce, throttle } from "lodash";
import { Currency } from "../../../components";
function UserCart() {
    const [state, user] = useAuth();
    const [page, setPage] = useState({
        index: 0,
        isEnd: false
    });
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedItems, setSelectedItem] = useState([]);
    const [load, setLoad] = useState(false);
    function scrollToLoad() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        if (scrollTop + windowHeight >= docHeight - 100) {
            setLoad(true);
            fetch()
        }
    }

    useEffect(() => {
        if (user) fetch();
        const onScroll = scrollToLoad;
        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        }
    }, [user]);
    function fetch() {
        console.log(page.isEnd)
        if (!page.isEnd) {
            APIBase.get(`api/v1/cart?userId=${user.id}&page=${page.index}`)
                .then(payload => {
                    setData(data_ => [...data_, ...payload.data.content]);
                    if (payload.data.totalPages - 1 == page.index) {
                        setPage(page_ => {
                            page_.isEnd = true;
                            return page_;
                        })
                    }
                    else {
                        setPage(page_ => {
                            page_.index = page_.index + 1;
                            return page_;
                        })
                    }
                })
                .catch(console.error)
                .finally(() => {
                    setLoad(false)
                })
        }
    }

    function onCheckItem(e) {
        if (e.target.checked) {
            setSelectedItem(selectedItem_ => {
                var temp = data.find(item_ => item_.id === Number.parseInt(e.target.value));
                if (temp) return [...selectedItem_, temp];
                return selectedItem_;
            });
        } else {
            setSelectedItem(item_ => {
                for (var i = 0; i < item_.length; i++) {
                    if (item_[i].id === Number.parseInt(e.target.value)) {
                        item_.splice(i, 1);
                    }
                }
                return [...item_];
            })
        }
    }

    function handleItemChange(id, cartItem) {

        APIBase
            .put(`/api/v1/cart/${id}`, cartItem)
            .then(payload => {
                setData(item_ => {
                    for (var i = 0; i < item_.length; i++) {
                        if (item_[i].id === payload.data.id) {
                            item_[i] = payload.data;
                            return [...item_];
                        }
                    }
                    return [...item_];

                })
                setSelectedItem(item_ => {
                    for (var i = 0; i < item_.length; i++) {
                        if (item_[i].id === payload.data.id) {
                            item_[i] = payload.data;
                            return [...item_];
                        }
                    }
                    return [...item_];
                })
            })
            .catch(console.log)
    }
    function handleDelete(id) {
        setData(item_ => {
            for (var i = 0; i < item_.length; i++) {
                if (item_[i].id === Number.parseInt(id)) item_.splice(i, 1);
            }
            return [...item_];
        })
        APIBase.delete(`/api/v1/cart/${id}`).catch(console.log)
    }
    return (<Row gutter={[8, 8]} md={{ gutter: [16, 16] }} >
        <Col span={24} md={{ span: 12 }} lg={{ span: 14 }}>
            <div title="Your Item">
                {data.map((item, key) => <Row style={{ padding: "0px 8px" }} gutter={[8, 8]} key={key} align="middle">
                    <Col span={1} ><input type='checkbox' checked={selectedItems.some(selectedItem_ => selectedItem_.id == item.id)} value={item.id} onChange={onCheckItem} /></Col>
                    <Col span={22}><OrderItem onChange={(payload) => handleItemChange(item.id, payload)} data={item} /></Col>
                    <Col span={1} className={style.deleteBtn} onClick={() => handleDelete(item.id)}><i className="fi fi-br-cross-small"></i></Col>
                </Row>)}
            </div>
        </Col>
        {(load && !page.isEnd) && <Col span={24}>
            <Row><Spin /></Row>
        </Col>}
        <Col span={24} md={{ span: 12 }} lg={{ span: 10 }}>
            <Card title="Total">
                <h4><Currency value={selectedItems.reduce((pre, item) => {
                    return pre + item.qty * item.productItem.price;
                }, 0)} /></h4>
                <Button onClick={() => {
                    navigate("/checkout", {
                        state: {
                            data: selectedItems
                        }
                    })
                }}>Checkout</Button>
            </Card>
        </Col>
    </Row>);
}

export default UserCart;