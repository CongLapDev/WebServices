import { Alert, Layout } from 'antd';
import Sidebar from '../../../part/admin/sidebar/Sidebar';
import { useState } from 'react';
import styled from 'styled-components';
import Header from '../../../part/admin/header/header';
import useAuth from '../../../secure/useAuth';
const Trigger = styled.div`
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #001529;
    span{
        padding:16px;
        i{
            color: white;
        }
    }
   

`
function SidebarLayout({ children }) {
    const [, , hasRole] = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    return (
        <>
            <Alert type='warning' message="You are currently accessing our resources under the role of standard user! Therefore, some functions may not work correctly or even be unable to work due to policy. Sorry for this uncomfortable, this is my effort to prevent unexpected attacks outside.
                For more, please contact sonnguyen9616@gmail.com " />
            <Layout>
                <Layout.Sider trigger={null} collapsible collapsed={collapsed}>
                    <Trigger><span onClick={() => setCollapsed(state => !state)}><i className="fi fi-rr-menu-burger"></i></span></Trigger>
                    <Sidebar />
                </Layout.Sider>
                <Layout>
                    <Layout.Header>
                        <Header />
                    </Layout.Header>
                    <Layout.Content>
                        {children}
                    </Layout.Content>
                </Layout>
            </Layout>
        </>
    );
}

export default SidebarLayout;