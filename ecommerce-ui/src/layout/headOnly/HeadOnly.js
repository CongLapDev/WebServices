import { useState } from "react";
import CategoryBar from "../../part/user/category-bar/CategoryBar.js";
import Header from "../../part/user/header/header.js";
import Footer from "../../components/footer/Footer.js";
import style from "./style.module.scss";
import { Layout, Row, Space, Col } from "antd";
import useDevice from "../../hooks/useDevice.js";
import SearchInput from "../../part/user/search-input/SearchInput.js";
import clsx from "clsx";
function HeadOnly({ children }) {
    const device = useDevice();
    const [category, setCategory] = useState(device !== "MOBILE");
    const [search, setSearch] = useState(false);
    return (
        <Layout>
            <Layout.Header
                style={device === "MOBILE" ? { padding: "8px" } : {}}
                className={style.header}
            >
                <Header searchTrigger={setSearch} />
                <Space
                    align="center"
                    className={clsx(
                        style.categoryToggle,
                        category ? style.active : ""
                    )}
                    onClick={() => {
                        setCategory((state_) => !state_);
                    }}
                >
                    <i className="fi fi-br-menu-burger"></i>
                </Space>
            </Layout.Header>
            <Layout.Content>
                {(device === "MOBILE" || device === "TABLET") && search && (
                    <div style={{ padding: "8px 16px" }}>
                        <SearchInput />
                    </div>
                )}
                <CategoryBar
                    className={clsx(
                        style.category,
                        category ? style.display : " "
                    )}
                />
                <div className={style.container}>{children}</div>
            </Layout.Content>
            <Footer />
        </Layout>
    );
}

export default HeadOnly;
