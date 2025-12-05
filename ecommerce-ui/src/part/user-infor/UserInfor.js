import image from '../../assets/image/image.png';
import LinkListItem from '../../components/link-list-Item/LinkListItem';
import { Link } from "react-router-dom";
import { Col, Row, Card, List } from "antd";
import style from './style.module.scss';
import PrefixIcon from '../../components/prefix-icon/PrefixIcon';
function UserInfor({ user }) {
    return (<Card >
        <Col>
            <Row className={style.avatar}><img alt='avatar' src={image} /></Row>
            <h3 className="text-center pt-4">{user ? `${user.lastname} ${user.firstname}` : <Link to="/login">Login</Link>}</h3>
        </Col>

        {user && <List>
            <LinkListItem title="Email" prefix={<PrefixIcon><i className="fi fi-rr-envelope"></i></PrefixIcon>}>
                {user.email}
            </LinkListItem>
            <LinkListItem title="Phone" prefix={<PrefixIcon><i className="fi fi-rr-phone-call"></i></PrefixIcon>}>
                {user.phoneNumber}
            </LinkListItem>
            <LinkListItem title="Gender" prefix={<i className="fi fi-rr-venus-mars"></i>}>
                {user.gender}
            </LinkListItem>
            <LinkListItem title="Birthday" prefix={<PrefixIcon><i className="fi fi-rr-cake-birthday"></i></PrefixIcon>}>
                {user.dateOfBirth}
            </LinkListItem>
            <LinkListItem title="Address" to={`/user/address`} prefix={<PrefixIcon><i className="fi fi-rr-building"></i></PrefixIcon>} arrow />
            <LinkListItem title="Payment" prefix={<PrefixIcon><i className="fi fi-sr-credit-card"></i></PrefixIcon>} arrow />
        </List>}
    </Card>);
}

export default UserInfor;