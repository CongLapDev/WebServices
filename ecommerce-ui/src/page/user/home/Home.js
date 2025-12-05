import { Row, Col, Card, Typography } from "antd";
import UserCarousel from "../../../part/user/carousel/Carousel";
import { ProductCardv2 } from "../../../components";
import { useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import style from "./style.module.scss";
import useAuth from "../../../secure/useAuth";

const { Title, Text } = Typography;

function Home() {
    const [authState, user, hasRole] = useAuth();
    const [newests, setNewests] = useState({ content: [] });
    const [accessories, setAccessories] = useState({ content: [] });
    const [monitors, setmonitors] = useState({ content: [] });
    
    // Debug logging for Home component
    useEffect(() => {
        console.log("[Home] ===== Home component mounted/updated =====");
        console.log("[Home] Auth state:", authState);
        console.log("[Home] User:", user ? `ID ${user.id}, Name: ${user.firstname} ${user.lastname}` : "null");
        console.log("[Home] User roles:", user?.account?.roles?.map(r => r.name) || []);
        console.log("[Home] hasRole('USER'):", hasRole("USER"));
        console.log("[Home] Current path:", window.location.pathname);
    }, [authState, user, hasRole]);
    
    useEffect(() => {
        console.log("[Home] Fetching products...");
        APIBase.get("api/v2/product?orderBy=id&order=DESC&page=0&size=6").then(payload => {
            setNewests(payload.data);
            console.log("[Home] Newest products loaded:", payload.data?.content?.length || 0);
        }).catch(err => {
            console.error("[Home] Error loading newest products:", err);
        });
        APIBase.get("api/v2/product?orderBy=id&order=DESC&page=0&size=6&category=7").then(payload => {
            setAccessories(payload.data);
            console.log("[Home] Accessories loaded:", payload.data?.content?.length || 0);
        }).catch(err => {
            console.error("[Home] Error loading accessories:", err);
        });
        APIBase.get("api/v2/product?orderBy=id&order=DESC&page=0&size=6&category=6").then(payload => {
            setmonitors(payload.data);
            console.log("[Home] Monitors loaded:", payload.data?.content?.length || 0);
        }).catch(err => {
            console.error("[Home] Error loading monitors:", err);
        });
    }, [])
    
    // Show welcome message if user is logged in
    const isAuthenticated = authState === 1 && user && hasRole("USER");
    const userName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "";
    
    console.log("[Home] Render - isAuthenticated:", isAuthenticated, "userName:", userName);
    
    return (<Row justify="center" gutter={[16, 16]}>
        <Col span={24}><UserCarousel className={style.carousel} /></Col>
        {isAuthenticated && userName && (
            <Col span={24}>
                <Card>
                    <Title level={3} style={{ margin: 0 }}>
                        Welcome back, {userName}! 👋
                    </Title>
                    <Text type="secondary">
                        Ready to shop? Browse our latest products below.
                    </Text>
                </Card>
            </Col>
        )}
        <Col span={24}>
            <Card title="New Items">
                <Row className={style.category} gutter={{ xs: 6, sm: 8, md: 12, lg: 16 }} style={{ overflowX: "scroll" }}>{newests.content.map((product_, index) => <Col span={12} md={{ span: 6 }} lg={{ span: 4 }} key={index}><ProductCardv2 className={style.productCard} data={product_} /></Col>)}</Row>
            </Card>
        </Col>
        <Col span={24}>
            <Card title="Monitor">
                <Row className={style.category} gutter={{ xs: 6, sm: 8, md: 12, lg: 16 }} style={{ overflowX: "scroll" }}>{monitors.content.map((product_, index) => <Col span={12} md={{ span: 6 }} lg={{ span: 4 }} key={index}><ProductCardv2 className={style.productCard} data={product_} /></Col>)}</Row>
            </Card>
        </Col>
        <Col span={24}>
            <Card title="Interesting Accessories">
                <Row className={style.category} gutter={{ xs: 6, sm: 8, md: 12, lg: 16 }} style={{ overflowX: "scroll" }}>{accessories.content.map((product_, index) => <Col span={12} md={{ span: 6 }} lg={{ span: 4 }} key={index}><ProductCardv2 className={style.productCard} data={product_} /></Col>)}</Row>
            </Card>
        </Col>

    </Row>);
}

export default Home;