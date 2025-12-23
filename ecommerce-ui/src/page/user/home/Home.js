import { Row, Col, Card, Typography, Button, Carousel, Avatar, Space } from "antd";
import { ProductCardv2 } from "../../../components";
import { useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import style from "./style.module.scss";
import useAuth from "../../../secure/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../api/ApiBase";
import banner1 from '../../../assets/image/banner1.jpg';
import banner2 from '../../../assets/image/banner2.jpg';

const { Title, Text } = Typography;

// Category icons mapping
const getCategoryIcon = (categoryName) => {
    const iconMap = {
        'Laptop': '💻',
        'Smartphone': '📱',
        'Software': '💿',
        'Speaker': '🔊',
        'Display': '🖥️',
        'Accessories': '⌚',
    };
    return iconMap[categoryName] || '📦';
};

function Home() {
    const navigate = useNavigate();
    const [authState, user, hasRole] = useAuth();
    const [newests, setNewests] = useState({ content: [] });
    const [accessories, setAccessories] = useState({ content: [] });
    const [monitors, setmonitors] = useState({ content: [] });
    const [categories, setCategories] = useState([]);
    
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
        APIBase.get("api/v2/product?orderBy=id&order=DESC&page=0&size=8").then(payload => {
            setNewests(payload.data);
            console.log("[Home] Newest products loaded:", payload.data?.content?.length || 0);
        }).catch(err => {
            console.error("[Home] Error loading newest products:", err);
        });
        APIBase.get("api/v2/product?orderBy=id&order=DESC&page=0&size=8&category=7").then(payload => {
            setAccessories(payload.data);
            console.log("[Home] Accessories loaded:", payload.data?.content?.length || 0);
        }).catch(err => {
            console.error("[Home] Error loading accessories:", err);
        });
        APIBase.get("api/v2/product?orderBy=id&order=DESC&page=0&size=8&category=6").then(payload => {
            setmonitors(payload.data);
            console.log("[Home] Monitors loaded:", payload.data?.content?.length || 0);
        }).catch(err => {
            console.error("[Home] Error loading monitors:", err);
        });

        // Fetch categories for category section
        APIBase.get("api/v1/category/1").then(payload => {
            const rootCategory = payload.data;
            if (rootCategory && rootCategory.children) {
                // Get top-level categories (limit to 6 for display)
                const topCategories = rootCategory.children.slice(0, 6).map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    icon: getCategoryIcon(cat.name)
                }));
                setCategories(topCategories);
            }
        }).catch(err => {
            console.error("[Home] Error loading categories:", err);
        });
    }, [])
    
    // Show welcome message if user is logged in
    const isAuthenticated = authState === 1 && user && hasRole("USER");
    const userName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "";
    
    console.log("[Home] Render - isAuthenticated:", isAuthenticated, "userName:", userName);

    const carouselContent = [
        {
            image: banner1,
            title: "Latest Tech Collection",
            subtitle: "Discover cutting-edge technology",
            buttonText: "Shop Now"
        },
        {
            image: banner2,
            title: "Premium Quality",
            subtitle: "Best deals on top brands",
            buttonText: "Explore"
        }
    ];
    
    return (
        <div className={style.homeContainer}>
            {/* Hero Section with Carousel */}
            <div className={style.heroSection}>
                <Carousel 
                    autoplay 
                    effect="fade"
                    className={style.heroCarousel}
                    autoplaySpeed={5000}
                >
                    {carouselContent.map((item, index) => (
                        <div key={index} className={style.heroSlide}>
                            <img 
                                src={item.image} 
                                alt={item.title}
                                className={style.heroImage}
                            />
                            <div className={style.heroOverlay}>
                                <div className={style.heroContent}>
                                    <Title level={1} className={style.heroTitle}>
                                        {item.title}
                                    </Title>
                                    <Text className={style.heroSubtitle}>
                                        {item.subtitle}
                                    </Text>
                                    <Button 
                                        type="primary" 
                                        size="large"
                                        className={style.heroButton}
                                        onClick={() => navigate('/product/search')}
                                    >
                                        {item.buttonText}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Welcome Card (if authenticated) */}
            {isAuthenticated && userName && (
                <Row justify="center" className={style.welcomeSection}>
                    <Col xs={24} sm={22} md={20} lg={18}>
                        <Card className={style.welcomeCard}>
                            <Title level={3} style={{ margin: 0 }}>
                                Welcome back, {userName}! 👋
                            </Title>
                            <Text type="secondary">
                                Ready to shop? Browse our latest products below.
                            </Text>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Category Section */}
            {categories.length > 0 && (
                <div className={style.categorySection}>
                    <Row justify="center">
                        <Col xs={24} sm={22} md={20} lg={18}>
                            <div className={style.sectionHeader}>
                                <Title level={2} className={style.sectionTitle}>
                                    Shop by Category
                                </Title>
                            </div>
                            <Row gutter={[16, 16]} justify="start" className={style.categoryGrid}>
                                {categories.map((category) => (
                                    <Col 
                                        xs={8} 
                                        sm={6} 
                                        md={4} 
                                        lg={4} 
                                        key={category.id}
                                        className={style.categoryItemWrapper}
                                    >
                                        <Link 
                                            to={`/product/search?category=${category.id}`}
                                            className={style.categoryItem}
                                        >
                                            <Avatar 
                                                size={64} 
                                                className={style.categoryAvatar}
                                            >
                                                <span className={style.categoryIcon}>{category.icon}</span>
                                            </Avatar>
                                            <Text className={style.categoryLabel}>
                                                {category.name}
                                            </Text>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </div>
            )}

            {/* New Arrivals Section */}
            <div className={style.productSection}>
                <Row justify="center">
                    <Col xs={24} sm={22} md={20} lg={18}>
                        <div className={style.sectionHeader}>
                            <Title level={2} className={style.sectionTitle}>
                                New Arrivals
                            </Title>
                            <Button 
                                type="link" 
                                className={style.seeAllButton}
                                onClick={() => navigate('/product/search?orderBy=id&order=DESC')}
                            >
                                See All →
                            </Button>
                        </div>
                        <Row gutter={[16, 24]} className={style.productGrid}>
                            {newests.content.map((product, index) => (
                                <Col 
                                    xs={24} 
                                    sm={12} 
                                    md={8} 
                                    lg={6} 
                                    key={product.id || index}
                                >
                                    <ProductCardv2 
                                        data={product} 
                                        className={style.productCard}
                                        showBadge={index < 3} // Show badge for first 3 items
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </div>

            {/* Monitors Section */}
            <div className={`${style.productSection} ${style.productSectionAlt}`}>
                <Row justify="center">
                    <Col xs={24} sm={22} md={20} lg={18}>
                        <div className={style.sectionHeader}>
                            <Title level={2} className={style.sectionTitle}>
                                Trending Monitors
                            </Title>
                            <Button 
                                type="link" 
                                className={style.seeAllButton}
                                onClick={() => navigate('/product/search?category=6')}
                            >
                                See All →
                            </Button>
                        </div>
                        <Row gutter={[16, 24]} className={style.productGrid}>
                            {monitors.content.map((product, index) => (
                                <Col 
                                    xs={24} 
                                    sm={12} 
                                    md={8} 
                                    lg={6} 
                                    key={product.id || index}
                                >
                                    <ProductCardv2 
                                        data={product} 
                                        className={style.productCard}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </div>

            {/* Accessories Section */}
            <div className={style.productSection}>
                <Row justify="center">
                    <Col xs={24} sm={22} md={20} lg={18}>
                        <div className={style.sectionHeader}>
                            <Title level={2} className={style.sectionTitle}>
                                Featured Accessories
                            </Title>
                            <Button 
                                type="link" 
                                className={style.seeAllButton}
                                onClick={() => navigate('/product/search?category=7')}
                            >
                                See All →
                            </Button>
                        </div>
                        <Row gutter={[16, 24]} className={style.productGrid}>
                            {accessories.content.map((product, index) => (
                                <Col 
                                    xs={24} 
                                    sm={12} 
                                    md={8} 
                                    lg={6} 
                                    key={product.id || index}
                                >
                                    <ProductCardv2 
                                        data={product} 
                                        className={style.productCard}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default Home;