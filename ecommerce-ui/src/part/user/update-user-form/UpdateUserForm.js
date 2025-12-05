import { Col, Button, Row, Select, Input } from "antd";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { Error } from "../../../components";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";
function UpdateUserForm({ user, onSubmit }) {
    const schema = Yup.object().shape({
        firstname: Yup.string().required("first name cant be blank"),
        lastname: Yup.string().required("required"),
        dateOfBirth: Yup.string().required("required"),
        phoneNumber: Yup.string().required(),
        email: Yup.string().email()
    });
    const formik = useFormik({
        initialValues: {
            firstname: user.firstname,
            lastname: user.lastname,
            dateOfBirth: user.dateOfBirth,
            phoneNumber: user.phoneNumber,
            email: user.email
        },
        validationSchema: schema,
        onSubmit: (data) => {
            if (onSubmit) onSubmit(data);
        }
    })
    return (<form onSubmit={formik.handleSubmit}>
        <Row gutter={[16, 16]}>
            <Col span={24} md={{ span: "12" }}>
                <Input
                    size="large"
                    status={(formik.errors && formik.errors.firstname) ? "error" : ""}
                    type="text"
                    id="firstname"
                    name="firstname"
                    placeholder="First Name"
                    onChange={formik.handleChange}
                    value={formik.values.firstname}
                />
                <Error>{formik.errors.firstname}</Error>
            </Col>
            <Col span={24} md={{ span: "12" }}>
                <Input
                    size="large"
                    status={(formik.errors.lastname) ? "error" : ""}
                    type="text"
                    id="lastname"
                    name="lastname"
                    placeholder="Last Name"
                    onChange={formik.handleChange}
                    value={formik.values.lastname}
                />
                <Error>{formik.errors.lastname}</Error>
            </Col>
            <Col span={24}>
                <Input
                    prefix={<PrefixIcon><i className="fi fi-rr-envelope"></i></PrefixIcon>}
                    size="large"
                    status={(formik.errors.email) ? "error" : ""}
                    type="text"
                    id="email"
                    name="email"
                    placeholder="email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
                <Error>{formik.errors.email}</Error>
            </Col>
            <Col span={24}>
                <Input
                    size="large"
                    prefix={<PrefixIcon><i className="fi fi-rr-phone-office"></i></PrefixIcon>}
                    status={(formik.errors.phoneNumber) ? "error" : ""}
                    type="text"
                    id="phoneNumber"
                    placeholder="Phone Number"
                    name="phoneNumber"
                    onChange={formik.handleChange}
                    value={formik.values.phoneNumber}
                />
                <Error>{formik.errors.phoneNumber}</Error>
            </Col>
            <Col span={24} md={{ span: "12" }}>
                <Row>
                    <Select
                        size="large"
                        style={{ width: "100%" }}
                        name="gender"
                        placeholder="Gender"
                        value={formik.values.gender}
                        onChange={e => formik.setFieldValue('gender', e)}
                    >
                        <Select.Option value="Male"></Select.Option>
                        <Select.Option value="Female"></Select.Option>
                        <Select.Option value="Other"></Select.Option>
                    </Select>
                </Row>
                <Error>{formik.errors.gender}</Error>
            </Col>
            <Col span={24} md={{ span: "12" }} >
                <Input
                    type="date"
                    size="large"
                    name="dateOfBirth"
                    placeholder="Date of Birth"
                    value={formik.values.dateOfBirth}
                    status={(formik.errors.dateOfBirth) ? "error" : ""}
                    onChange={(e) => { formik.setFieldValue('dateOfBirth', e.target.value) }}
                />

                <Error>{formik.errors.dateOfBirth}</Error>
            </Col>
            <Row justify="end">
                <Button htmlType="submit" type="primary">Submit</Button>
            </Row>
        </Row>
    </form>);
}

export default UpdateUserForm;