import { Col, Row } from "antd";
import style from './style.module.scss';
import clsx from "clsx";
import { Link } from "react-router-dom";
import Currency from "../currency/Currency";
function ProductCard({ data, className, ...props }) {
    return (
        <div {...props} className={clsx(style.productCard, className)}>
            <Link to={`/product?id=${data.id}`}>
                <Row>
                    <Col span={24}><img alt="fg" src={data.picture || "https://down-vn.img.susercontent.com/file/vn-11134201-7r98o-lt6j2nuwf2ksf0_tn"} /></Col>
                    <Row className={style.productDetail}>
                        <Col span={24}><div className={style.productName}>{data.name}</div></Col>
                        <Col span={24}><div className={style.manufacturer}>{data.manufacturer}</div></Col>
                        <Col span={24} className={style.productPrice}>
                            <span className={style.current}>{data.productItems && <Currency value={(data.productItems.reduce((pre, item_) => item_.price + pre, 0) / data.productItems.length)} />}</span>
                        </Col>
                    </Row>
                </Row>
            </Link>
        </div >
    );
}

export default ProductCard;