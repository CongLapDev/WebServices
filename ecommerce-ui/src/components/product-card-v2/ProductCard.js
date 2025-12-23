import { Card, Col, Row, Typography, Button } from "antd";
import style from './style.module.scss';
import clsx from "clsx";
import { Link } from "react-router-dom";
import RateStar from "../rate-start/RateStar";
import Currency from "../currency/Currency";
import { getImageUrl } from "../../api/ApiBase";
import PlaceHolder from "../../assets/image/product_placeholder.png";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function ProductCard({ data, className, showBadge = false, ...restProps }) {
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement add to cart functionality
        console.log("Add to cart:", data.id);
    };

    // showBadge is already destructured above, so it won't be in restProps
    // This ensures no non-DOM props are passed to the Card component
    return (
        <Card
            hoverable
            className={clsx(style.productCard, className)}
            {...restProps}
        >
            <Link to={`/product?id=${data.id}`} className={style.productLink}>
                <div className={style.imageContainer}>
                    {showBadge && (
                        <div className={style.badge}>New</div>
                    )}
                    <img 
                        alt={data.name || "Product"} 
                        src={getImageUrl(data.picture) || PlaceHolder}
                        className={style.productImage}
                    />
                    <div className={style.hoverOverlay}>
                        <Button
                            type="primary"
                            ghost
                            icon={<ShoppingCartOutlined />}
                            className={style.addToCartButton}
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </Button>
                    </div>
                </div>
                <div className={style.productDetail}>
                    <Title level={5} className={style.productName} ellipsis={{ tooltip: data.name }}>
                        {data.name}
                    </Title>
                    {data.manufacturer && (
                        <Text type="secondary" className={style.manufacturer}>
                            {data.manufacturer}
                        </Text>
                    )}
                    {data.rate && (
                        <div className={style.ratingContainer}>
                            <RateStar percent={data.rate * 10} />
                        </div>
                    )}
                    <div className={style.productPrice}>
                        <span className={style.current}>
                            <Currency value={data.min_price} />
                            {data.min_price !== data.max_price && (
                                <> - <Currency value={data.max_price} /></>
                            )}
                        </span>
                    </div>
                </div>
            </Link>
        </Card>
    );
}

export default ProductCard;