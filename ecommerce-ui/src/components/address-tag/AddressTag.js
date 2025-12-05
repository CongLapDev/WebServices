import { Row, Col } from 'antd';
import style from './style.module.scss';
import clsx from 'clsx';
function AddressTag({ data, className, props }) {
    return (<Row {...props} className={className}>
        <Col>
            <div className={clsx(style.address)}>
                {data?.phoneNumber}
            </div>
            <div className={clsx(style.address)}>
                {data.address?.city}
            </div>
            <div className={clsx(style.addressLine)}>
                {data.address?.addressLine1}
            </div>
        </Col>
    </Row>);
}

export default AddressTag;