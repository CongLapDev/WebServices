import { Routes, Route } from "react-router-dom";
import { publicRouter, userRouter, adminRouter } from "./routers/routers";
import { DefaultLayout } from "./layout/default";
import { Fragment, useState } from "react";

import "./App.css";
import Loader from "./components/loader/Loader";
import { DarkModeContext, DeviceContext, GlobalContext } from "./context";
import { Role } from "./constant";
import { Layout, message, notification } from "antd";
import RoleBaseAuthorize from "./secure/RoleBaseAuthorize";
import { MessageContext } from "./context/MessageContext";
function App() {
    let [loaderContent, setLoaderContent] = useState(false);
    const [notificationAPI, notificationContext] = notification.useNotification();
    const [messageAPI, messageContext] = message.useMessage();
    return (
        <Layout>
            {loaderContent ? <Loader /> : ""}
            {notificationContext}
            {messageContext}
            <GlobalContext.Provider
                value={{
                    notification: notificationAPI,
                    message: messageAPI,
                    loader: setLoaderContent
                }}
            >
                <DarkModeContext.Provider value={false}>
                    <Routes>
                        {[...publicRouter.map((page, index) => {
                            let Layout =
                                (page.layout === undefined
                                    ? DefaultLayout
                                    : page.layout) || Fragment;
                            let Page = page.component;
                            return (
                                <Route
                                    key={index}
                                    path={page.path || "/"}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        }),
                        ...userRouter.map((page, index) => {
                            let Layout =
                                (page.layout === undefined
                                    ? DefaultLayout
                                    : page.layout) || Fragment;
                            let Page = page.component;
                            return (
                                <Route
                                    key={index}
                                    path={page.path || "/"}
                                    element={
                                        <RoleBaseAuthorize role={["USER"]}>
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        </RoleBaseAuthorize>
                                    }
                                />
                            );
                        }),
                        ...adminRouter.map((page, index) => {
                            let Layout =
                                (page.layout === undefined
                                    ? DefaultLayout
                                    : page.layout) || Fragment;
                            let Page = page.component;
                            return (
                                <Route
                                    key={index}
                                    path={page.path || "/"}
                                    element={
                                        <RoleBaseAuthorize path={page.path} role={["ADMIN"]}>
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        </RoleBaseAuthorize>

                                    }
                                />
                            );
                        })]}
                    </Routes>
                </DarkModeContext.Provider>
            </GlobalContext.Provider>
        </Layout>
    );
}

export default App;
