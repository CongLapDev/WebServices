import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input, TreeSelect, Row, Col, Upload, Space } from "antd";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon.js";
import { GlobalContext } from "../../../context/index.js";
import APIBase from "../../../api/ApiBase.js";
import { useNavigate } from "react-router-dom";
import { Error } from "../../../components";

export default function ProductAddForm({ submitHandler, defaultCategory, trigger }) {
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch categories từ API - Load full category tree
    useEffect(() => {
        setLoading(true);
        APIBase.get("api/v1/category/1")
            .then(payload => {
                const rootCategory = payload.data;
                if (rootCategory && rootCategory.children) {
                    // Convert categories thành tree structure cho TreeSelect
                    // Include parent categories as selectable nodes
                    const convertToTree = (categoryList) => {
                        return categoryList.map(category => {
                            const node = {
                                title: category.name,
                                value: category.id,
                                key: category.id,
                                // Parent categories are also selectable
                                selectable: true,
                            };
                            
                            // Recursively add children
                            if (category.children && category.children.length > 0) {
                                node.children = convertToTree(category.children);
                            }
                            
                            return node;
                        });
                    };
                    
                    const tree = convertToTree(rootCategory.children);
                    setCategoryTree(tree);
                }
            })
            .catch(err => {
                console.error("Error fetching categories:", err);
                globalContext.message.error("Failed to load categories");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const validateSchema = Yup.object().shape({
        name: Yup.string()
            .max(45, "Must be 45 characters or less")
            .required("Required"),
        description: Yup.string().required("Required"),
        category: Yup.number()
            .required("Category is required")
            .min(1, "Please select a valid category")
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            manufacturer: "",
            category: (defaultCategory && defaultCategory.id) || null,
            image: null
        },
        validationSchema: validateSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            // Validate category is selected
            if (!values.category || values.category === null) {
                formik.setFieldError("category", "Category is required");
                return;
            }

            let formdata = new FormData();
            
            // Append các fields vào FormData
            // Spring @ModelAttribute với multipart/form-data bind nested properties như "category.id"
            Object.keys(values).forEach((key) => {
                if (key === 'category' && values[key] !== null) {
                    // Gửi category.id để Spring bind thành Category object
                    // Format: category.id = {categoryId}
                    // Spring sẽ tự động tạo Category object với id này
                    formdata.append("category.id", values[key].toString());
                } else if (key === 'image' && values[key] !== null) {
                    // Gửi image file với key "image" để match @RequestPart(value = "image")
                    formdata.append("image", values[key]);
                } else if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
                    // Gửi các field khác (name, description, manufacturer)
                    formdata.append(key, values[key]);
                }
            });
            
            // Debug: Log FormData contents để kiểm tra
            console.log("FormData contents:");
            for (let pair of formdata.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `[File: ${pair[1].name}]` : pair[1]));
            }
            
            if (submitHandler) {
                submitHandler(formdata);
            } else {
                addProduct(formdata);
            }
        },
    });

    // Update category khi defaultCategory thay đổi
    useEffect(() => {
        if (defaultCategory && defaultCategory.id) {
            formik.setFieldValue("category", defaultCategory.id);
        }
    }, [defaultCategory]);

    function addProduct(productFormData) {
        globalContext.loader(true);
        APIBase.post("api/v1/product", productFormData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then(payload => {
                globalContext.message.success("Product created successfully");
                navigate(`/admin/product?id=${payload.data.id}`)
            })
            .catch((e) => {
                const errorMessage = e.response?.data?.message || 
                                   e.response?.data?.error || 
                                   e.message ||
                                   "Error creating product";
                globalContext.message.error(errorMessage);
                console.error("Product creation error:", e);
                console.error("Error response:", e.response?.data);
            })
            .finally(() => {
                globalContext.loader(false);
            })
    }

    // Expose submitForm để có thể trigger từ bên ngoài
    if (trigger) {
        trigger.current = formik.submitForm;
    }

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <Row gutter={[18, 32]}>
                    {/* Image Upload */}
                    <Col span={12}>
                        <Row><label>Image</label></Row>
                        <Upload 
                            action={null} 
                            name="image" 
                            listType="picture"
                            maxCount={1}
                            onChange={({ fileList, file }) => { 
                                if (file && file.originFileObj) {
                                    formik.setFieldValue("image", file.originFileObj);
                                }
                            }}
                            beforeUpload={() => false}
                        >
                            <Button icon={<PrefixIcon><i className="fi fi-rr-inbox-out"></i></PrefixIcon>}>
                                Click to Upload
                            </Button>
                        </Upload>
                    </Col>

                    {/* Manufacturer */}
                    <Col span={12}>
                        <Row><label>Manufacturer</label></Row>
                        <Input
                            name="manufacturer"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.manufacturer}
                            placeholder="Enter manufacturer"
                        />
                        {formik.touched.manufacturer && formik.errors.manufacturer ? (
                            <small className="text-danger">{formik.errors.manufacturer}</small>
                        ) : null}
                    </Col>

                    {/* Product Name */}
                    <Col span={12}>
                        <label>Product's name</label>
                        <Input
                            name="name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.name}
                            placeholder="Enter product name"
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <small className="text-danger">{formik.errors.name}</small>
                        ) : null}
                    </Col>

                    {/* Description */}
                    <Col span={24}>
                        <label>Description</label>
                        <Input.TextArea
                            rows={10}
                            name="description"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            placeholder="Enter product description"
                        />
                        {formik.touched.description && formik.errors.description ? (
                            <Error className="text-danger">{formik.errors.description}</Error>
                        ) : null}
                    </Col>

                    {/* Category TreeSelect */}
                    <Col span={24}>
                        <Row><label>Category <span style={{ color: 'red' }}>*</span></label></Row>
                        <TreeSelect
                            name="category"
                            placeholder="Select a category (parent or child)"
                            treeData={categoryTree}
                            value={formik.values.category}
                            onChange={(value) => {
                                formik.setFieldValue("category", value);
                                formik.setFieldTouched("category", true);
                            }}
                            onBlur={formik.handleBlur}
                            loading={loading}
                            style={{ width: "100%" }}
                            showSearch
                            treeDefaultExpandAll={false}
                            allowClear
                            treeNodeFilterProp="title"
                            // Allow selecting both parent and child nodes
                            treeCheckable={false}
                            // Display format
                            treeLine={{ showLeafIcon: false }}
                            // Search functionality
                            filterTreeNode={(inputValue, treeNode) => {
                                return treeNode.title.toLowerCase().includes(inputValue.toLowerCase());
                            }}
                        />
                        {formik.touched.category && formik.errors.category ? (
                            <Error className="text-danger">{formik.errors.category}</Error>
                        ) : null}
                        {defaultCategory && (
                            <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                Default: {defaultCategory.name} (you can change this)
                            </small>
                        )}
                    </Col>

                    {/* Submit Button */}
                    <Col span={24}>
                        <Row justify="end">
                            <Space>
                                <Button
                                    type="primary"
                                    className="mt-3"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    Save
                                </Button>
                            </Space>
                        </Row>
                    </Col>
                </Row>
            </form>
        </div>
    );
}
