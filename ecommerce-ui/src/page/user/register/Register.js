import { Alert, Card, Col, Row } from "antd";
import RegisterForm from "../../../part/user/register-form";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../../../context";
import { register as registerApi } from "../../../api/auth";
import { Description } from "../../../components";

function Register() {
    const [error, setError] = useState(false);
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();

    async function onSubmit(data) {
        globalContext.loader(true);
        setError(false);
        try {
            await registerApi(data);
            globalContext.message.success("Registered successfully");
            navigate("/login");
        } catch (e) {
            const message = e?.response?.data?.message || e.message || "Registration failed";
            setError(message);
            globalContext.message.error(message);
        } finally {
            globalContext.loader(false);
        }
    }

    return (
        <Row justify={"center"} align="center" style={{ height: "100vh" }} >
            <Col span={24} md={16} lg={{ span: 10 }}>
                <Card>
                    <Row justify={"center"} gutter={[24, 24]}>
                        <Col span={24}><h2 style={{ textAlign: "center" }}>Register</h2></Col>
                        {error && <Col span={24}><Alert type="error" description={error} /> </Col>}
                        <Col span={24}><RegisterForm onSubmit={onSubmit} /></Col>
                        <Col span={24}>
                            <Description>
                                Already have an account? <Link to="/login">Login</Link>
                            </Description>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
}

export default Register;
