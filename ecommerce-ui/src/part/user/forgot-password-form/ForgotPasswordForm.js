import { Col, Row, Input, Button } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Error, PrefixIcon, Description } from "../../../components";
import { forgotPassword } from "../../../api/auth";
import { useContext } from "react";
import { GlobalContext } from "../../../context";

function ForgotPasswordForm({ onSubmit }) {
  const globalContext = useContext(GlobalContext);

  const schema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await forgotPassword({ email: values.email });
        globalContext.message.success(
          "If this email exists, reset instructions have been sent."
        );
        if (onSubmit) {
          onSubmit({
            ...values,
            onSubmit: async () => forgotPassword({ email: values.email }),
          });
        }
      } catch (error) {
        const message = error?.message || "Unable to process forgot password request.";
        globalContext.message.error(message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Input
            prefix={
              <PrefixIcon>
                <i className="fi fi-rr-envelope"></i>
              </PrefixIcon>
            }
            size="large"
            status={formik.touched.email && formik.errors.email ? "error" : ""}
            type="email"
            name="email"
            placeholder="Enter your registered email"
            onChange={formik.handleChange}
            value={formik.values.email}
            onBlur={formik.handleBlur}
          />
          <Error>{formik.touched.email && formik.errors.email}</Error>
        </Col>
        <Col span={24}>
          <Description>
            We&apos;ll send you a link to reset your password if the email is
            registered.
          </Description>
        </Col>
        <Col span={24}>
          <Row justify="end">
            <Col>
              <Button htmlType="submit" type="primary" className="mt-2">
                Send Reset Link
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </form>
  );
}

export default ForgotPasswordForm;


