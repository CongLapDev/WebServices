import { Row, Image, Col } from 'antd';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../../api/ApiBase';
import PlaceHolder from '../../../assets/image/product_placeholder.png';

function ProductDetailItem({ children, ...props }) {
    return (
        <Col span={24}>
            <Row {...props} gutter={[14, 14]}>
                <Col span={8}>
                    <Image 
                        src={getImageUrl(children.picture) || PlaceHolder} 
                        alt={children.name}
                    />
                </Col>
                <Col span={16}>
                    <Link to={`/admin/product?id=${children.id}`}>
                        <span>{children.name}</span>
                    </Link>
                </Col>
            </Row>
        </Col>);
}

export default ProductDetailItem;