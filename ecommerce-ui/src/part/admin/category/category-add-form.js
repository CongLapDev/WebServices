import { Form, useFormik } from "formik";
import { Button, Input, Row, Col } from "antd";
import { Error } from "../../../components";
import * as Yup from 'yup';
import { useEffect } from "react";
function CategoryForm({ parent, submitHandler, initialValues: propInitialValues }) {
    var initialValues = propInitialValues || {
        "name": "",
        "description": ""
    }
    var validationSchema = Yup.object().shape({
        "name": Yup.string().required("Required")
    })
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: submitHandler
    })
    
    useEffect(() => {
        if (propInitialValues) {
            formik.setValues(propInitialValues);
        }
    }, [propInitialValues])
    return (
        <form onSubmit={formik.handleSubmit}>
            <Row gutter={[16, 16]} align="bottom">
                <Col span={24}>
                    <label>Category's name</label>
                    <Input name="name"
                        value={formik.values.name}
                        status={formik.errors.name && "error"}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.name && <Error>{formik.errors.name}</Error>}
                </Col>
                <Col span={20}>
                    <label>Description</label>
                    <Input.TextArea name="description"
                        value={formik.values.description}
                        status={formik.errors.description && "error"}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.description && <Error>{formik.errors.description}</Error>}
                </Col>
                <Col span={4}>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </Col>
            </Row>
        </form>);
}

export default CategoryForm;