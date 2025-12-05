import { useFormik } from "formik";
import { Button, Col, Input, Row, Select } from "antd";
import * as Yup from 'yup';
import { Error } from '../../../components';
function UserAddressForm({ onSubmit }) {
    const validateSchema = Yup.object({
        city: Yup.string().required(),
        postalCode: Yup.string().required(),
        addressLine1: Yup.string().required()
    })
    var formik = useFormik({
        initialValues: {
            city: " ",
            country: {
                id: 1
            }
        },
        validationSchema: validateSchema
        ,
        onSubmit: (value) => {
            if (onSubmit) {
                onSubmit(value)
            }
        }
    })
    return (<form onSubmit={formik.handleSubmit}>

        <Row gutter={24}>
            <Col span={24} md={{ span: 12 }} lg={{ span: 8 }}>
                <Row> <label>Phone Number</label></Row>
                <Input name="phoneNumber" onChange={formik.handleChange} value={formik.values.phoneNumber} />
            </Col>
            <Col span={24} md={{ span: 12 }} lg={{ span: 8 }}>
                <Row> <label>Country</label></Row>
                <Row>
                    <Select style={{ width: "100%" }} value={formik.values.country.id} onChange={value => formik.setFieldValue("country.id", Number.parseInt(value))}>
                        <Select.Option label="Viet Nam" value="1" />
                        <Select.Option value="2">America</Select.Option>
                    </Select>
                </Row>
            </Col>
            <Col span={24} md={{ span: 12 }} lg={{ span: 8 }}>
                <label>Building</label>
                <Input name="building" onChange={formik.handleChange} value={formik.values.building} />
            </Col>
            <Col span={24} md={{ span: 12 }} lg={{ span: 8 }}>
                <label>City</label>
                <Input status={formik.errors.city && "error"} name="city" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.city} />
                {formik.errors.city && <Error>{formik.errors.city}</Error>}
            </Col>
            <Col span={24} md={{ span: 12 }} lg={{ span: 8 }}>
                <label>Postal Code</label>
                <Input status={formik.errors.postalCode && "error"} name="postalCode" onChange={formik.handleChange} value={formik.values.postalCode} />
                {formik.errors.postalCode && <Error>{formik.errors.postalCode}</Error>}
            </Col>
            <Col span={24} md={{ span: 12 }} lg={{ span: 8 }}>
                <label>Region</label>
                <Input name="region" onChange={formik.handleChange} value={formik.values.region} />
            </Col>
            <Col span={24}>
                <label>Line 1</label>
                <Input.TextArea as="textarea" status={formik.errors.addressLine1 && "error"} rows={3} name="addressLine1" onChange={formik.handleChange} value={formik.values.addressLine1} />
                {formik.errors.addressLine1 && <Error>{formik.errors.addressLine1}</Error>}
            </Col>
            <Col span={24}>
                <label>Line 2</label>
                <Input.TextArea as="textarea" rows={3} name="addressLine2" onChange={formik.handleChange} value={formik.values.addressLine2} />
            </Col>
        </Row>



        <Row justify="end"><Button shape="round" style={{ margin: "8px" }} type="primary" htmlType="submit">Submit</Button></Row>
    </form>);
}

export default UserAddressForm;