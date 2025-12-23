import { Layout, Row, Col, Typography, Space, Input } from "antd";
import { 
    PhoneOutlined, 
    MailOutlined, 
    EnvironmentOutlined,
    FacebookOutlined,
    TwitterOutlined,
    InstagramOutlined,
    LinkedinOutlined
} from "@ant-design/icons";
import style from './style.module.scss';

const { Title, Text, Link } = Typography;
const { Search } = Input;

function Footer() {
    const handleNewsletterSubmit = (value) => {
        console.log("Newsletter subscription:", value);
        // TODO: Implement newsletter subscription API call
    };

    return (
        <Layout.Footer className={style.footer}>
            <div className={style.footerContainer}>
                {/* Top Section - Main Content */}
                <Row gutter={[32, 32]} className={style.mainContent}>
                    {/* Column 1: Brand & Contact */}
                    <Col xs={24} lg={6} className={style.column}>
                        <Title level={4} className={style.brandTitle}>
                            LLM Shop
                        </Title>
                        <Text className={style.tagline}>
                            Your trusted destination for cutting-edge tech.
                        </Text>
                        <Space direction="vertical" size="middle" className={style.contactInfo}>
                            <Space>
                                <PhoneOutlined className={style.icon} />
                                <Text className={style.contactText}>Hotline: 1900 xxxx</Text>
                            </Space>
                            <Space>
                                <MailOutlined className={style.icon} />
                                <Text className={style.contactText}>hoangconglap.dev@gmail.com</Text>
                            </Space>
                            <Space>
                                <EnvironmentOutlined className={style.icon} />
                                <Text className={style.contactText}>Hanoi, Vietnam</Text>
                            </Space>
                        </Space>
                    </Col>

                    {/* Column 2: Customer Service */}
                    <Col xs={24} lg={6} className={style.column}>
                        <Title level={5} className={style.sectionTitle}>
                            Customer Support
                        </Title>
                        <Space direction="vertical" size="small" className={style.linksList}>
                            <Link href="#" className={style.footerLink}>
                                Help Center / FAQs
                            </Link>
                            <Link href="#" className={style.footerLink}>
                                Shipping & Delivery Policy
                            </Link>
                            <Link href="#" className={style.footerLink}>
                                Returns & Refunds
                            </Link>
                            <Link href="#" className={style.footerLink}>
                                Order Tracking
                            </Link>
                        </Space>
                    </Col>

                    {/* Column 3: About Us & Legal */}
                    <Col xs={24} lg={6} className={style.column}>
                        <Title level={5} className={style.sectionTitle}>
                            Company Info
                        </Title>
                        <Space direction="vertical" size="small" className={style.linksList}>
                            <Link href="#" className={style.footerLink}>
                                About LLM Shop
                            </Link>
                            <Link href="#" className={style.footerLink}>
                                Careers
                            </Link>
                            <Link href="#" className={style.footerLink}>
                                Terms of Service
                            </Link>
                            <Link href="#" className={style.footerLink}>
                                Privacy Policy
                            </Link>
                        </Space>
                    </Col>

                    {/* Column 4: Newsletter Signup */}
                    <Col xs={24} lg={6} className={style.column}>
                        <Title level={5} className={style.sectionTitle}>
                            Stay Updated
                        </Title>
                        <Text className={style.newsletterText}>
                            Subscribe for latest tech news and exclusive offers.
                        </Text>
                        <div className={style.newsletterForm}>
                            <Search
                                placeholder="Enter your email"
                                enterButton="Subscribe"
                                size="large"
                                onSearch={handleNewsletterSubmit}
                                className={style.searchInput}
                            />
                        </div>
                    </Col>
                </Row>

                {/* Bottom Section - Copyright & Social */}
                <Row justify="space-between" align="middle" className={style.bottomSection}>
                    <Col xs={24} sm={12} className={style.copyright}>
                        <Text className={style.copyrightText}>
                            © 2025 LLM Shop. All Rights Reserved.
                        </Text>
                    </Col>
                    <Col xs={24} sm={12} className={style.socialSection}>
                        <Space size="large" className={style.socialIcons}>
                            <Link href="#" className={style.socialLink} aria-label="Facebook">
                                <FacebookOutlined className={style.socialIcon} />
                            </Link>
                            <Link href="#" className={style.socialLink} aria-label="Twitter">
                                <TwitterOutlined className={style.socialIcon} />
                            </Link>
                            <Link href="#" className={style.socialLink} aria-label="Instagram">
                                <InstagramOutlined className={style.socialIcon} />
                            </Link>
                            <Link href="#" className={style.socialLink} aria-label="LinkedIn">
                                <LinkedinOutlined className={style.socialIcon} />
                            </Link>
                        </Space>
                        {/* Payment Method Icons Placeholder */}
                        {/* <div className={style.paymentMethods}>
                            Payment method icons (Visa, Mastercard, etc.) would go here
                        </div> */}
                    </Col>
                </Row>
            </div>
        </Layout.Footer>
    );
}

export default Footer;

