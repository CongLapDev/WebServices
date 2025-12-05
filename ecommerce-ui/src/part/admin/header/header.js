import { Col, Dropdown, Row } from "antd";
import style from './style.module.scss';
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";
import { Description } from "../../../components";
import Logout from "../../logout/Logout";
import useAuth from "../../../secure/useAuth";
import image from "../../../assets/image/image.png";
function Header() {
    const [status, user] = useAuth();
    const items = [
        {
            key: 1,
            label: <div className={style.menuItem}>
                <PrefixIcon><i className="fi fi-rr-user"></i></PrefixIcon>
                <Description>
                    {`${user.lastname} ${user.firstname}`}
                </Description>
            </div>
        }, {
            key: 2,
            label: <div className={style.menuItem}>
                <div
                    className={style.seperate}
                ></div>
                <Logout trigger={
                    <div className={style.menuItem}>
                        <PrefixIcon><i className="fi fi-rs-sign-out-alt"></i></PrefixIcon>
                        <Description>Logout</Description>
                    </div>
                } />

            </div>
        }
    ]
    return (
        <Row justify="space-between" className={style.container}>
            <Col xl={1}></Col>
            <Col className={style.headerR}>
                <Dropdown menu={{ items }}>
                    <div className={style.avatar}>
                        <img
                            src={image && user && user.picture}
                            alt=""
                        ></img>
                    </div>
                </Dropdown>
            </Col>
        </Row>);
}

export default Header;