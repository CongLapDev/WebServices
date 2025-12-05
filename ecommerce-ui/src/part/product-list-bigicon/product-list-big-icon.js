import { Row } from "antd";
import style from './style.module.scss';
import ProductDetailItem from "../../components/admin/product-list-item/ProductDetailItem";
import clsx from "clsx";
function ProductListBigIcon({ children }) {
    return (
        <Row>
            {children && Array.isArray(children) && children.map((item, index) => <ProductDetailItem key={index} className={clsx(style.productCard)} >{item}</ProductDetailItem>)}
        </Row>);
}

export default ProductListBigIcon;