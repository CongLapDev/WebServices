import { Row, Col, Card } from "antd";
import LoginForm from "../../../part/login-form/login-form";
import style from "../../Login/style.module.scss";
import { Description } from "../../../components";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../secure/useAuth";

function AdminLoginPage() {
    const navigate = useNavigate();
    const [state, user, hasRole] = useAuth();
    
    return (
        <Row justify="center" style={{ height: "100vh" }} align="middle">
            <Col span={24} lg={{ span: 6 }} md={{ span: 8 }}>
                <Row justify="center" align="center" className={style.formContainer}>
                    <Card>
                        <Col>
                            <Col className={style.header}>
                                <h2>Admin Login</h2>
                                <Description style={{ paddingBottom: "8px" }}>
                                    Login to your admin account
                                </Description>
                            </Col>
                            <div style={{ paddingTop: "20px" }}>
                                <LoginForm
                                    isAdminLogin={true}
                                    success={() => {
                                        // Role-based redirection handled in LoginForm component
                                    }}
                                />
                            </div>
                        </Col>
                    </Card>
                </Row>
            </Col>
        </Row>
    );
}

export default AdminLoginPage;

