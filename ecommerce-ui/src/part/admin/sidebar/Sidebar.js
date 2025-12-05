
import { Link } from "react-router-dom";
import { Menu } from "antd";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon.js";
import useAuth from "../../../secure/useAuth.js";
import { memo, useEffect, useState } from "react";
function Sidebar({ ...props }) {
    const [, user, hasRole,] = useAuth();
    const [state, setState] = useState(true);
    // useEffect(() => {
    //     setState(state => !state);
    // }, [user])
    return (
        <Menu style={{ height: "100%" }}>
            <Menu.Item icon={<PrefixIcon><i className="fi fi-rr-dashboard"></i></PrefixIcon>}>
                <Link to="/admin">Dashboard</Link>
            </Menu.Item>

            <Menu.Item disabled={!hasRole("ADMIN")} icon={<PrefixIcon><i className="fi fi-rr-category-alt"></i></PrefixIcon>}>
                <Link to="/admin/category">
                    Category Management
                </Link>
            </Menu.Item>
            <Menu.Item icon={<PrefixIcon><i className="fi fi-rr-to-do"></i></PrefixIcon>}>
                <Link to="/admin/order-manage">
                    Order Management
                </Link>
            </Menu.Item>
            <Menu.Item icon={<PrefixIcon><i className="fi fi-rr-box-open-full"></i></PrefixIcon>}>
                <Link to="/admin/product-manage">
                    Product Management
                </Link>
            </Menu.Item>
            <Menu.Item disabled={!hasRole("ADMIN")} icon={<PrefixIcon><i className="fi fi-rr-warehouse-alt"></i></PrefixIcon>}>
                <Link to="/admin/warehouse">
                    Warehouse Management
                </Link>
            </Menu.Item>
            <Menu.Item disabled={!hasRole("ADMIN")} icon={<PrefixIcon><i className="fi fi-rr-user-check"></i></PrefixIcon>}>
                <Link to="/admin/user/manage">
                    User Management
                </Link>
            </Menu.Item>
        </Menu>);
}

export default memo(Sidebar);