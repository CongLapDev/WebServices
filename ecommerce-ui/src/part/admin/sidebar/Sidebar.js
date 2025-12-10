import { Link, useLocation } from "react-router-dom";
import { Menu } from "antd";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon.js";
import useAuth from "../../../secure/useAuth.js";
import { memo, useMemo } from "react";

function Sidebar({ ...props }) {
    const [state, user, hasRole] = useAuth();
    const location = useLocation();
    
    // CRITICAL: Memoize menu items to prevent re-creation on every render
    // Only recalculate when auth state or user changes
    const menuItems = useMemo(() => {
        // CRITICAL: Don't compute roles when loading - return disabled items
        const isAdmin = state === 1 ? hasRole("ADMIN") : null;
        
        const items = [
            {
                key: "/admin",
                icon: <PrefixIcon><i className="fi fi-rr-dashboard"></i></PrefixIcon>,
                label: <Link to="/admin">Dashboard</Link>,
            },
            {
                key: "/admin/category",
                icon: <PrefixIcon><i className="fi fi-rr-category-alt"></i></PrefixIcon>,
                label: <Link to="/admin/category">Category Management</Link>,
                disabled: isAdmin === false, // Only disable if explicitly false (not null/true)
            },
            {
                key: "/admin/order-manage",
                icon: <PrefixIcon><i className="fi fi-rr-to-do"></i></PrefixIcon>,
                label: <Link to="/admin/order-manage">Order Management</Link>,
            },
            {
                key: "/admin/product-manage",
                icon: <PrefixIcon><i className="fi fi-rr-box-open-full"></i></PrefixIcon>,
                label: <Link to="/admin/product-manage">Product Management</Link>,
            },
            {
                key: "/admin/warehouse",
                icon: <PrefixIcon><i className="fi fi-rr-warehouse-alt"></i></PrefixIcon>,
                label: <Link to="/admin/warehouse">Warehouse Management</Link>,
                disabled: isAdmin === false, // Only disable if explicitly false (not null/true)
            },
            {
                key: "/admin/user/manage",
                icon: <PrefixIcon><i className="fi fi-rr-user-check"></i></PrefixIcon>,
                label: <Link to="/admin/user/manage">User Management</Link>,
                disabled: isAdmin === false, // Only disable if explicitly false (not null/true)
            },
        ];
        
        return items;
    }, [state, hasRole]);
    
    return (
        <Menu 
            style={{ height: "100%" }}
            items={menuItems}
            selectedKeys={[location.pathname]}
        />
    );
}

export default memo(Sidebar);