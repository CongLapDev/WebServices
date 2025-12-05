import { Card, Col, Row } from "antd";
import style from './style.module.scss';
import clsx from "clsx";
import { Link } from "react-router-dom";
import RateStar from "../rate-start/RateStar";
import Currency from "../currency/Currency";
import PlaceHolder from "../../assets/image/product_placeholder.png";
function ProductCard({ data, className, ...props }) {
    return (
        <div {...props} className={clsx(style.productCard, className)}>
            <Link to={`/product?id=${data.id}`}>
                <Row>
                    <Col span={24}><img alt="fg" src={data.picture || PlaceHolder} /></Col>
                    <Row className={style.productDetail}>
                        <Col span={24}><div className={style.productName}>{data.name}</div></Col>
                        <Col span={24}><div className={style.manufacturer}>{data.manufacturer}</div></Col>
                        {data.rate && <RateStar percent={data.rate * 10} />}
                        <Col span={24} className={style.productPrice}>
                            <span className={style.current}><Currency value={data.min_price} /> - <Currency value={data.max_price} /></span>
                        </Col>
                    </Row>
                </Row>
            </Link>
        </div >
    );
}

export default ProductCard;