import { Card, Col, Row } from "antd";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../../context";
import ForgotPasswordForm from "../../../part/user/forgot-password-form/ForgotPasswordForm";

function ForgotPasswordPage() {
  const globalContext = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    globalContext.loader(true);
    try {
      await values.onSubmit(); // delegated inside form
      navigate("/login");
    } finally {
      globalContext.loader(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ height: "100vh" }}>
      <Col span={24} md={16} lg={{ span: 8 }}>
        <Card>
          <Row justify="center" gutter={[24, 24]}>
            <Col span={24}>
              <h2 style={{ textAlign: "center" }}>Forgot Password</h2>
            </Col>
            <Col span={24}>
              <ForgotPasswordForm onSubmit={handleSubmit} />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default ForgotPasswordPage;


