import { Row, Col, Button, Flex, Card } from 'antd';
import { Link } from 'react-router-dom';
import style from './style.module.scss';
import clsx from 'clsx';
import InputNumber from '../input-number/InputNumber';
import { useContext, useState } from 'react';
import ProductItemSelect from '../../part/product-item-selection/ProductItemSelect';
import APIBase from '../../api/ApiBase';
import { memo } from 'react';
import { GlobalContext } from '../../context';
import Currency from '../currency/Currency';
function OrderItem({ data, disabled, onChange, ...props }) {
    const [product, setProduct] = useState();
    const [item, setItem] = useState();
    const globalContext = useContext(GlobalContext);
    const [state, setState] = useState(false);
    function changeVariation() {
        if (!product) {
            APIBase.get(`api/v1/product/${data.productItem.product.id}`)
                .then(payload => {
                    setProduct(payload.data);
                    setState(true)
                    return payload.data;
                }).catch(e => {
                    globalContext.message.error("Sorry! Your selection isn't available now");
                })
        } else {
            setState(state_ => !state_);
        }

    }
    function updateQty(value) {
        data.qty = Number.parseInt(value);
        if (onChange) onChange(data);
    }
    function saveItem() {
        if (item && isAvailable()) {
            data.productItem = null
            data.productItem = {
                id: item.id
            }
            if (onChange) onChange(data);
        } else {
            globalContext.message.warning("This option isn't available! Select another");
        }
    }
    function isAvailable() {
        return item.warehouses.reduce((pre, warehouseItem) => {
            if (warehouseItem && warehouseItem.qty) return pre + warehouseItem.qty;
            return pre;
        }, 0) > 0
    }
    return (<div>
        {data && <Row {...props}>
            <Col span={24}>
                <Row align="middle" gutter={12} className={clsx(style.orderItem)}>
                    <Col span={6} className={style.image}>
                        <img src={data.productItem.product && data.productItem.product.picture} />
                    </Col>
                    <Col span={16} md={{ span: 17 }} className={style.productDetail}>
                        <Row>
                            <Col span={24}>
                                <Link to={`/product?id=${data.productItem.product.id}`} className={clsx(style.productName)}>{data.productItem.product && data.productItem.product.name}</Link>
                            </Col>
                            <Col span={24}>
                                <span className={clsx(style.price)}><Currency value={data.productItem && data.productItem.price} /></span>
                            </Col>
                            <Col span={24}>
                                <button disabled={disabled} className={clsx(style.optionBtn)} onClick={() => changeVariation()}>
                                    <span>{data.productItem.options.map(option => option.value).join(" , ")}</span>
                                    <i className="fi fi-rr-angle-small-down"></i>
                                </button>
                            </Col>
                            <Col span={4}>
                                <InputNumber disabled={disabled} onChange={updateQty} value={data.qty} className={clsx(style.quantityChange)} min={1} />
                            </Col>
                            <Col span={24} lg={{ span: 24 }} className={style.total}>
                                <div className={style.label}>Total</div>
                                <div className={style.value}><Currency value={data.qty * data.productItem.price} /></div>
                            </Col>
                        </Row>

                    </Col>
                </Row>
            </Col>
            {(product && state) && <Col span={state ? 24 : 0}>
                <Card>
                    <Row justify="space-between">
                        <Col span={20}><ProductItemSelect onChange={setItem} productItems={product.productItems} /></Col>
                        <Col span={4}><Button onClick={saveItem} type='text' style={{ color: "#006dee", fontWeight: 500 }}>Save</Button></Col>
                    </Row>
                </Card>
            </Col>}
        </Row >}
    </div >);
}

export default memo(OrderItem);