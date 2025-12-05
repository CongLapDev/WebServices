import { useState } from "react";
import CategoryBar from "../../part/user/category-bar/CategoryBar.js";
import Header from "../../part/user/header/header.js";
import style from './style.module.scss';
import { Layout, Row, Space, Col } from "antd";
import useDevice from "../../hooks/useDevice.js";
import SearchInput from "../../part/user/search-input/SearchInput.js";
import logo from '../../assets/image/logo512.png';
import clsx from "clsx";
import Link from "antd/es/typography/Link.js";
function HeadOnly({ children }) {
    const device = useDevice();
    const [category, setCategory] = useState(device !== "MOBILE");
    const [search, setSearch] = useState(false);
    return (
        <Layout>
            <Layout.Header style={device === "MOBILE" ? { padding: "8px" } : {}} className={style.header} >
                <Header searchTrigger={setSearch} />
                <Space align="center" className={clsx(style.categoryToggle, category ? style.active : "")} onClick={() => { setCategory(state_ => !state_) }}><i className="fi fi-br-menu-burger"></i></Space>
            </Layout.Header>
            <Layout.Content >
                {(device === "MOBILE" || device === "TABLET") && search && <div style={{ padding: "8px 16px" }}><SearchInput /></div>}
                <CategoryBar className={clsx(style.category, category ? style.display : " ")} />
                <div className={style.container}>
                    {children}
                </div>
            </Layout.Content>
            <Layout.Footer className={style.footer}>
                <div className={style.container}>
                    <Row gutter={[16, 16]}>
                        <Col className={style.logo} span={6} lg={{ span: 4 }}>
                            <img alt="logo" src={logo} />
                        </Col>
                        <Col className={style.contact} span={18} lg={{ span: 20 }}>
                            <h4>Contact</h4>
                            <div>Developer: Nguyễn Hoàng Sơn</div>
                            <div>Email: sonnguyen9616@gmail.com </div>
                            <div>Telephone: 0393497961</div>
                            <h4>
                                <code>Facebook: <Link target="https://www.facebook.com/profile.php?id=100008617812145https://www.facebook.com/profile.php?id=100008617812145">https://www.facebook.com/profile.php?id=100008617812145</Link></code>

                            </h4>
                            <h4>
                                <code>Github: <Link target="blank" href="https://github.com/sonnguyen400">https://github.com/sonnguyen400</Link></code>

                            </h4>                        </Col>
                    </Row>
                    <Row className={style.project} gutter={[24, 24]}>
                        <Col span={24}>
                            This page is the result of my hard work. It is NOT my first project, but as someone new to the technology field, it is definitely not perfect. If you encounter any problems, I hope you can take the time to email me about them.
                        </Col>
                        <Col span={24}>
                            I am also seeking an internship. If you are interested in my project and are looking for an applicant, please contact me. Thank you so much!
                        </Col>
                    </Row>
                </div>
            </Layout.Footer>
        </Layout>);
}

export default HeadOnly;