import UserCart from '../../../part/user-cart/cart/UserCart';
import Tabs from '../../../components/tabs/Tabs';
import OrderList from '../../../part/user/order-list/OrderList';
import styled from 'styled-components';
import useAuth from '../../../secure/useAuth';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
const Container = styled.div`
    background-color: white;
    border-radius: 0.95rem;
`
function UserCartPage() {
    const [state, user] = useAuth();
    const location = useLocation();
    const [activeTabKey, setActiveTabKey] = useState(1);
    
    // Handle navigation from empty cart state
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTabKey(location.state.activeTab);
            // Clear location state to prevent re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const items = [
        {
            key: 1,
            label: "Cart",
            children: <UserCart />
        },
        {
            key: 2,
            label: "To Pay",
            children: <OrderList state="PENDING" user={user} />
        },
        {
            key: 3,
            label: "Preparing",
            children: <OrderList state="PREPARING" user={user} />
        },
        {
            key: 4,
            label: "Delivering",
            children: <OrderList state="DELIVERING" user={user} />
        },
        {
            key: 5,
            label: "Delivered",
            children: <OrderList state="DELIVERED" user={user} />
        },
        {
            key: 6,
            label: "Completed",
            children: <OrderList state="COMPLETED" user={user} />
        },
        {
            key: 7,
            label: "Cancelled",
            children: <OrderList state="CANCEL" user={user} />
        },
        {
            key: 8,
            label: "Return",
            children: <OrderList state="RETURN" user={user} />
        },

    ]
    return (
        <Container className={styled}>
            <Tabs 
                items={items} 
                defaultActiveKey={activeTabKey}
            />
        </Container>
    );
}

export default UserCartPage;