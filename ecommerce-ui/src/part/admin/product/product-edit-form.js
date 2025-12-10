import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input, TreeSelect, Row, Col, Space, Image } from "antd";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon.js";
import { GlobalContext } from "../../../context/index.js";
import APIBase, { getImageUrl } from "../../../api/ApiBase.js";
import { useNavigate } from "react-router-dom";
import { Error } from "../../../components";
import PlaceHolder from "../../../assets/image/product_placeholder.png";

export default function ProductEditForm({ product, submitHandler, trigger }) {
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageRemoved, setImageRemoved] = useState(false);

    // Fetch categories từ API - Load full category tree (same as product-add-form)
    useEffect(() => {
        setLoading(true);
        APIBase.get("api/v1/category/1")
            .then(payload => {
                const rootCategory = payload.data;
                if (rootCategory && rootCategory.children) {
                    // Convert categories thành tree structure cho TreeSelect
                    const convertToTree = (categoryList) => {
                        return categoryList.map(category => {
                            const node = {
                                title: category.name,
                                value: category.id,
                                key: category.id,
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
            name: product?.name || "",
            description: product?.description || "",
            manufacturer: product?.manufacturer || "",
            category: product?.category?.id || null,
            picture: product?.picture || null
        },
        enableReinitialize: true,
        validationSchema: validateSchema,
        onSubmit: (values) => {
            // Validate category is selected
            if (!values.category || values.category === null) {
                formik.setFieldError("category", "Category is required");
                return;
            }

            // Build product object for JSON update (NO file upload in PUT)
            const productData = {
                name: values.name,
                description: values.description || null,
                manufacturer: values.manufacturer || null,
                picture: imageRemoved ? null : values.picture, // Set to null if removed
                category: {
                    id: values.category
                }
            };
            
            if (submitHandler) {
                submitHandler(productData);
            } else {
                updateProduct(product.id, productData);
            }
        },
    });

    // Update form values when product changes
    useEffect(() => {
        if (product) {
            formik.setValues({
                name: product.name || "",
                description: product.description || "",
                manufacturer: product.manufacturer || "",
                category: product.category?.id || null,
                picture: product.picture || null
            });
            setImageRemoved(false);
        }
    }, [product]);

    function updateProduct(productId, productData) {
        globalContext.loader(true);
        APIBase.put(`api/v1/product/${productId}`, productData)
            .then(payload => {
                globalContext.message.success("Product updated successfully");
                // Reload page to show updated data
                window.location.reload();
            })
            .catch((e) => {
                const errorMessage = e.response?.data?.message || 
                                   e.response?.data?.error || 
                                   e.message ||
                                   "Error updating product";
                globalContext.message.error(errorMessage);
                console.error("Product update error:", e);
                console.error("Error response:", e.response?.data);
            })
            .finally(() => {
                globalContext.loader(false);
            })
    }

    function handleRemoveImage() {
        setImageRemoved(true);
        formik.setFieldValue("picture", null);
    }

    // Expose submitForm để có thể trigger từ bên ngoài
    if (trigger) {
        trigger.current = formik.submitForm;
    }

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <Row gutter={[18, 32]}>
                    {/* Image Display (Read-only, can remove) */}
                    <Col span={12}>
                        <Row><label>Current Image</label></Row>
                        {formik.values.picture && !imageRemoved ? (
                            <div>
                                <Image 
                                    src={getImageUrl(formik.values.picture)} 
                                    alt="Product"
                                    style={{ maxWidth: "200px", marginBottom: "8px" }}
                                />
                                <div>
                                    <Button 
                                        type="danger" 
                                        size="small"
                                        onClick={handleRemoveImage}
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <img 
                                    src={PlaceHolder} 
                                    alt="No image" 
                                    style={{ maxWidth: "200px", marginBottom: "8px" }}
                                />
                                <div>
                                    <small style={{ color: "#999" }}>
                                        {imageRemoved ? "Image will be removed on save" : "No image"}
                                    </small>
                                </div>
                            </div>
                        )}
                        <small style={{ color: "#666", display: "block", marginTop: "8px" }}>
                            Note: Image upload is not available in edit mode. Use Remove to delete current image.
                        </small>
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
                            placeholder="Select a category"
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
                            treeCheckable={false}
                            treeLine={{ showLeafIcon: false }}
                            filterTreeNode={(inputValue, treeNode) => {
                                return treeNode.title.toLowerCase().includes(inputValue.toLowerCase());
                            }}
                        />
                        {formik.touched.category && formik.errors.category ? (
                            <Error className="text-danger">{formik.errors.category}</Error>
                        ) : null}
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
                                    Update Product
                                </Button>
                            </Space>
                        </Row>
                    </Col>
                </Row>
            </form>
        </div>
    );
}

