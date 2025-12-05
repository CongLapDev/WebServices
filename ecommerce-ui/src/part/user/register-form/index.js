import { Col, Row, Input, Button, Select, DatePicker } from "antd";
import { Error, PrefixIcon } from "../../../components";
import * as Yup from "yup";
import { useFormik } from "formik";

function RegisterForm({ onSubmit, ...props }) {
    const schema = Yup.object().shape({
        username: Yup.string()
            .required("Username is required")
            .min(6, "Username must be at least 6 characters"),
        password: Yup.string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters in length"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], "Passwords must match")
            .required("Please confirm your password"),
        user: Yup.object().shape({
            firstname: Yup.string().required("First name can't be blank"),
            lastname: Yup.string().required("Last name is required"),
            dateOfBirth: Yup.string().required("Date of birth is required"),
            phoneNumber: Yup.string().required("Phone number is required"),
            email: Yup.string().email("Invalid email address"),
        }),
    });

    const initvalue = {
        username: "",
        password: "",
        confirmPassword: "",
        user: {
            firstname: "",
            lastname: "",
            dateOfBirth: "",
            gender: "Male",
            phoneNumber: "",
            email: "",
        },
    };

    function submitHandler(data) {
        if (onSubmit) {
            // Strip confirmPassword before sending to backend
            const { confirmPassword, ...rest } = data;
            onSubmit(rest);
        }
    }

    const formik = useFormik({
        initialValues: initvalue,
        onSubmit: submitHandler,
        validationSchema: schema,
    });

    return (
        <form onSubmit={formik.handleSubmit} >
            <Row gutter={[16, 32]}>
                <Col span={24} md={{ span: "12" }}>
                    <Input
                        size="large"
                        status={formik.touched.user?.firstname && formik.errors.user?.firstname ? "error" : ""}
                        type="text"
                        id="firstname"
                        name="user.firstname"
                        placeholder="First Name"
                        onChange={formik.handleChange}
                        value={formik.values.user.firstname}
                        onBlur={formik.handleBlur}
                    />
                    <Error>{formik.touched.user?.firstname && formik.errors.user?.firstname}</Error>
                </Col>
                <Col span={24} md={{ span: "12" }}>
                    <Input
                        size="large"
                        status={formik.touched.user?.lastname && formik.errors.user?.lastname ? "error" : ""}
                        type="text"
                        id="lastname"
                        name="user.lastname"
                        placeholder="Last Name"
                        onChange={formik.handleChange}
                        value={formik.values.user.lastname}
                        onBlur={formik.handleBlur}
                    />
                    <Error>{formik.touched.user?.lastname && formik.errors.user?.lastname}</Error>
                </Col>
                <Col span={24}>
                    <Input
                        prefix={<PrefixIcon><i className="fi fi-rr-envelope"></i></PrefixIcon>}
                        size="large"
                        status={formik.touched.user?.email && formik.errors.user?.email ? "error" : ""}
                        type="text"
                        id="email"
                        name="user.email"
                        placeholder="Email"
                        onChange={formik.handleChange}
                        value={formik.values.user.email}
                        onBlur={formik.handleBlur}
                    />
                    <Error>{formik.touched.user?.email && formik.errors.user?.email}</Error>
                </Col>
                <Col span={24}>
                    <Input
                        size="large"
                        prefix={<PrefixIcon><i className="fi fi-rr-phone-office"></i></PrefixIcon>}
                        status={formik.touched.user?.phoneNumber && formik.errors.user?.phoneNumber ? "error" : ""}
                        type="text"
                        id="phoneNumber"
                        placeholder="Phone Number"
                        name="user.phoneNumber"
                        onChange={formik.handleChange}
                        value={formik.values.user.phoneNumber}
                        onBlur={formik.handleBlur}
                    />
                    <Error>{formik.touched.user?.phoneNumber && formik.errors.user?.phoneNumber}</Error>
                </Col>
                <Col span={24} md={{ span: "12" }}>
                    <Row>
                        <Select
                            size="large"
                            style={{ width: "100%" }}
                            name="user.gender"
                            placeholder="Gender"
                            value={formik.values.user.gender}
                            onChange={(e) => formik.setFieldValue("user.gender", e)}
                        >
                            <Select.Option value="Male">Male</Select.Option>
                            <Select.Option value="Female">Female</Select.Option>
                            <Select.Option value="Other">Other</Select.Option>
                        </Select>
                    </Row>
                    <Error>{formik.touched.user?.gender && formik.errors.user?.gender}</Error>
                </Col>
                <Col span={24} md={{ span: "12" }} >
                    <DatePicker
                        status={formik.touched.user?.dateOfBirth && formik.errors.user?.dateOfBirth ? "error" : ""}
                        style={{ width: "100%" }}
                        size="middle"
                        name="user.dateOfBirth"
                        onChange={(value) => {
                            formik.setFieldValue("user.dateOfBirth", value ? value.toISOString() : "");
                        }}
                    />

                    <Error>{formik.touched.user?.dateOfBirth && formik.errors.user?.dateOfBirth}</Error>
                </Col>
                <Col span={24} md={{ span: "12" }}>
                    <Input
                        prefix={<PrefixIcon><i className="fi fi-rr-user"></i></PrefixIcon>}
                        size="large"
                        status={formik.touched.username && formik.errors.username ? "error" : ""}
                        type="text"
                        name="username"
                        placeholder="User Name"
                        onChange={formik.handleChange}
                        value={formik.values.username}
                        onBlur={formik.handleBlur}
                    />
                    <Error>{formik.touched.username && formik.errors.username}</Error>
                </Col>
                <Col span={24} md={{ span: "12" }}>
                    <Input
                        prefix={<PrefixIcon><i className="fi fi-rr-lock"></i></PrefixIcon>}
                        size="large"
                        status={formik.touched.password && formik.errors.password ? "error" : ""}
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        onBlur={formik.handleBlur}
                    />

                    <Error>{formik.touched.password && formik.errors.password}</Error>
                </Col>
                <Col span={24} md={{ span: "12" }}>
                    <Input
                        prefix={<PrefixIcon><i className="fi fi-rr-lock"></i></PrefixIcon>}
                        size="large"
                        status={formik.touched.confirmPassword && formik.errors.confirmPassword ? "error" : ""}
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        onChange={formik.handleChange}
                        value={formik.values.confirmPassword}
                        onBlur={formik.handleBlur}
                    />

                    <Error>{formik.touched.confirmPassword && formik.errors.confirmPassword}</Error>
                </Col>
                <Col span={24}>
                    <Row justify="end">
                        <Col><Button htmlType="submit" type="primary" className="mt-2">Register</Button></Col>
                    </Row>
                </Col>
            </Row>
        </form >
    );
}

export default RegisterForm;
