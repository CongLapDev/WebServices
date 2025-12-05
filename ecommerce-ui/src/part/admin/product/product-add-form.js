import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input, Select, Row, Col, Upload, Space } from "antd";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon.js";
import { GlobalContext } from "../../../context/index.js";
import APIBase from "../../../api/ApiBase.js";
import { useNavigate } from "react-router-dom";
import { Error } from "../../../components";
export default function ProductAddForm({ submitHandler, defaultCategory, trigger }) {
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();
    const validateSchema = Yup.object().shape({
        name: Yup.string()
            .max(45, "Must be 45 characters or less")
            .required("Required"),
        description: Yup.string().required()
    })
    const formik = useFormik({
        initialValues: {
            name: "",
            category: (defaultCategory && defaultCategory.id) || 1
        },
        validationSchema: validateSchema,
        onSubmit: (values) => {
            let formdata = new FormData();
            Object.keys(values).forEach((key) => {
                formdata.append(key, values[key]);
            });
            addProduct(formdata);
        },
    });
    function addProduct(product) {
        globalContext.loader(true);
        APIBase.post("api/v1/product", product)
            .then(payload => {
                navigate(`/admin/product?id=${payload.data.id}`)
            })
            .catch((e) => {
                globalContext.message.error("Error");
                console.log(e)
            })
            .finally(() => {
                globalContext.loader(false);
            })
    }
    trigger = formik.submitForm
    return (
        <div>
            <div>
                <form onSubmit={formik.handleSubmit}>
                    <Row gutter={[18, 32]}>
                        <Col span={12}>
                            <Row><label>Image</label></Row>
                            <Upload action={null} name="image" onChange={({ fileList, file }) => { formik.setFieldValue("image", file.originFileObj) }} >
                                <Button icon={<PrefixIcon><i className="fi fi-rr-inbox-out"></i></PrefixIcon>}>Click to Upload</Button>
                            </Upload>
                        </Col>
                        <Col span={12}>
                            <Row><label>Manufacturer</label></Row>
                            <Input
                                name="manufacturer"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.manufacturer}
                            />
                            {formik.touched.manufacturer && formik.errors.manufacturer ? (
                                <small className="text-danger">{formik.errors.manufacturer}</small>
                            ) : (
                                ""
                            )}
                        </Col>
                        <Col span={12}>
                            <label>Product's name</label>
                            <Input
                                name="name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                            />
                            {formik.touched.name && formik.errors.name ? (
                                <small className="text-danger">{formik.errors.name}</small>
                            ) : (
                                ""
                            )}
                        </Col>

                        <Col span={24}>
                            <label>Description</label>
                            <Input.TextArea
                                as="textarea"
                                rows={10}
                                name="description"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.description}
                            />
                            {formik.touched.description && formik.errors.description ? (
                                <Error className="text-danger">{formik.errors.description}</Error>
                            ) : <></>}
                        </Col>

                        <Col span={24}>
                            <Row><label>Category</label></Row>
                            <Select
                                as="select"
                                rows={10}
                                name="category"
                                onChange={(e) =>
                                    formik.setFieldValue(
                                        "category",
                                        e
                                    )
                                }
                                value={formik.values.category}
                            >
                                {defaultCategory && <Select.Option value={defaultCategory?.id || null}>{defaultCategory.name || "default"}</Select.Option>}
                            </Select>
                            {formik.touched.category && formik.errors.category ? (
                                <Error className="text-danger">{formik.errors.category}</Error>
                            ) : ""}
                        </Col>

                        <Col span={24}>
                            <Row justify="end" >
                                <Space>
                                    <Button
                                        type="primary"
                                        className="mt-3"
                                        htmlType="submit"
                                    >
                                        Save
                                    </Button>
                                </Space>
                            </Row>
                        </Col>
                    </Row>
                </form>
            </div>
        </div >
    );
}
