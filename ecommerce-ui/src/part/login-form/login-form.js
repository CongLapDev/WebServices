import { useFormik } from "formik";
import * as Yup from "yup";
import APIBase, { BaseURL } from "../../api/ApiBase";
import clsx from "clsx";
import { Error, PrefixIcon, Description } from "../../components";
import google from "../../assets/image/google.png";
import style from "./style.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../context";
import { Col, Row, Input, Button } from "antd";
import useAuth from "../../secure/useAuth";
import { login as loginApi } from "../../api/auth";

const handleGoogleLogin = async () => {
    try {
        // Make a request to the backend server to initiate the Google OAuth2 flow
        const response = await APIBase.get('/auth/google');
        window.location.href = response.data.redirectUrl;
    } catch (error) {
        console.error('Error initiating Google login:', error);
    }
};

function LoginForm({ className, success, isAdminLogin = false }) {
    const navigate = useNavigate();
    const [, user, hasRole, requestAuth] = useAuth();
    const globalContext = useContext(GlobalContext);
    const authObject = Yup.object().shape({
        username: Yup.string().required("Username is required"),
        password: Yup.string()
            .min(6, "Password is too short")
            .required("Password is required"),
    });
    
    // Auto-redirect if user is already logged in (for page refresh scenarios)
    useEffect(() => {
        if (user && hasRole) {
            if (hasRole("ADMIN")) {
                navigate("/admin");
            } else if (hasRole("USER")) {
                navigate("/");
            }
        }
    }, [user, hasRole, navigate]);

    const formik = useFormik({
        validateOnBlur: true,
        initialValues: {
            username: "",
            password: "",
        },
        onSubmit: async (values) => {
            globalContext.loader(true);
            try {
                // Login API returns User object with account.roles
                const userData = await loginApi(values);
                
                // Determine user roles from the response
                const userRoles = userData?.account?.roles?.map(r => r.name) || [];
                const isAdmin = userRoles.includes("ADMIN");
                const isUser = userRoles.includes("USER");
                
                // Update Redux state with user data
                await requestAuth();
                
                // Redirect based on role
                if (isAdmin) {
                    navigate("/admin");
                    globalContext.message.success("Admin login successful");
                } else if (isUser) {
                    navigate("/");
                    globalContext.message.success("Login successful");
                } else {
                    // No role found, still show success but stay on login page
                    globalContext.message.warning("Login successful but no role assigned");
                }
                
                if (success) success();
            } catch (error) {
                console.error("Login error:", error);
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Username or password is incorrect";
                globalContext.message.error(message);
            } finally {
                globalContext.loader(false);
            }
        },
        validationSchema: authObject,
    });
    
    return (
        <div className={clsx("w-100", className)}>
            <form noValidate onSubmit={formik.handleSubmit}>
                <Row gutter={[0, 24]} justify={"center"}>
                    <Col span={24}>
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
                    <Col span={24}>
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
                    <Col span={24}>
                        <Row justify={isAdminLogin ? "center" : "space-between"} gutter={[8, 8]}>
                            <Col className={style.loginBtn} span={isAdminLogin ? 24 : undefined}>
                                <Button htmlType="submit" type="primary" className="w-full">
                                    {isAdminLogin ? "Admin Login" : "Login"}
                                </Button>
                            </Col>
                            {!isAdminLogin && (
                                <Col>
                                    <Button
                                        type="default"
                                        className="w-full border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
                                        onClick={() => navigate("/register")}
                                    >
                                        Create Account
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </Col>
                    {!isAdminLogin && (
                        <>
                            <Col span={24}>
                                <Description className="">
                                    Don't have an account yet? <Link to='/register'>Register</Link>
                                </Description>
                            </Col>
                            <Col span={24}>
                                <Description className="">
                                    Forgot your password? <Link to='/forgot-password'>Reset it</Link>
                                </Description>
                            </Col>
                            <Col span={24}><Description>Or login with</Description></Col>
                            <Col span={16}>
                                <Row>
                                    <Col span={6}>
                                        <Button type="text"
                                            icon={<PrefixIcon><img style={{ width: "100%" }} src={google} alt="Login with google" /></PrefixIcon>}
                                            href={`${BaseURL}/oauth2/authorize/google`} />
                                    </Col>
                                </Row>
                            </Col>
                        </>
                    )}
                    {isAdminLogin && (
                        <Col span={24}>
                            <Description className="" style={{ textAlign: "center" }}>
                                <Link to='/login'>User Login</Link>
                            </Description>
                        </Col>
                    )}
                </Row>
            </form>
        </div>
    );
}

export default LoginForm;
