import React, { useContext, useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input, TreeSelect, Row, Col, Space, Image, Upload } from "antd";
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
    const [newImage, setNewImage] = useState(null); // Track new image file for upload

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
            picture: product?.picture || null,
            image: null // For new image upload
        },
        enableReinitialize: true,
        validationSchema: validateSchema,
        onSubmit: (values) => {
            // Validate category is selected
            if (!values.category || values.category === null) {
                formik.setFieldError("category", "Category is required");
                return;
            }

            // Check if we have a new image to upload
            if (newImage) {
                // Use multipart/form-data for image upload
                const formData = new FormData();
                formData.append("image", newImage);
                
                const productData = {
                    name: values.name,
                    description: values.description || null,
                    manufacturer: values.manufacturer || null,
                    picture: null, // Will be set from uploaded image
                    category: {
                        id: values.category
                    }
                };
                formData.append("product", JSON.stringify(productData));
                
                if (submitHandler) {
                    // For custom submit handler, we need to handle FormData
                    updateProductWithImage(product.id, formData);
                } else {
                    updateProductWithImage(product.id, formData);
                }
            } else {
                // No new image - use JSON update
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
            }
        },
    });

    // Track previous product ID to avoid resetting imageRemoved unnecessarily
    const previousProductId = useRef(product?.id);
    
    // Update form values when product changes (only reset imageRemoved if product ID actually changed)
    useEffect(() => {
        if (product) {
            // Only reset imageRemoved if this is a different product (ID changed)
            const productIdChanged = previousProductId.current !== product.id;
            previousProductId.current = product.id;
            
            // If imageRemoved is true and we're updating the same product, preserve the null picture
            // Otherwise, use the product's picture
            const pictureValue = (imageRemoved && !productIdChanged) ? null : (product.picture || null);
            
            formik.setValues({
                name: product.name || "",
                description: product.description || "",
                manufacturer: product.manufacturer || "",
                category: product.category?.id || null,
                picture: pictureValue,
                image: null // Reset image upload when product changes
            });
            
            // Reset new image when product changes
            if (productIdChanged) {
                setNewImage(null);
            }
            
            // Only reset imageRemoved if we're loading a different product
            if (productIdChanged) {
                setImageRemoved(false);
            }
        }
    }, [product?.id]); // Only depend on product ID, not the entire product object

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
    
    function updateProductWithImage(productId, formData) {
        globalContext.loader(true);
        APIBase.put(`api/v1/product/${productId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then(payload => {
                globalContext.message.success("Product updated successfully");
                // Reset new image state
                setNewImage(null);
                setImageRemoved(false);
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
        setNewImage(null); // Clear any new image
        formik.setFieldValue("picture", null);
        formik.setFieldValue("image", null);
    }
    
    function handleImageChange(info) {
        const file = info?.fileList?.[0]?.originFileObj;
        if (file) {
            setNewImage(file);
            setImageRemoved(false); // Cancel removal if new image is selected
            formik.setFieldValue("image", file);
        } else {
            setNewImage(null);
            formik.setFieldValue("image", null);
        }
    }

    // Expose submitForm để có thể trigger từ bên ngoài
    if (trigger) {
        trigger.current = formik.submitForm;
    }

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <Row gutter={[18, 32]}>
                    {/* Image Upload/Display */}
                    <Col span={12}>
                        <Row><label>Product Image</label></Row>
                        {newImage ? (
                            // Show preview of new image
                            <div>
                                <Image 
                                    src={URL.createObjectURL(newImage)} 
                                    alt="New product image"
                                    style={{ maxWidth: "200px", marginBottom: "8px" }}
                                />
                                <div>
                                    <Button 
                                        type="danger" 
                                        size="small"
                                        onClick={() => {
                                            setNewImage(null);
                                            formik.setFieldValue("image", null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                <small style={{ color: "#52c41a", display: "block", marginTop: "4px" }}>
                                    New image will be uploaded on save
                                </small>
                            </div>
                        ) : formik.values.picture && !imageRemoved ? (
                            // Show current image
                            <div>
                                <Image 
                                    src={getImageUrl(formik.values.picture)} 
                                    alt="Product"
                                    style={{ maxWidth: "200px", marginBottom: "8px" }}
                                />
                                <div style={{ marginBottom: "8px" }}>
                                    <Button 
                                        type="danger" 
                                        size="small"
                                        onClick={handleRemoveImage}
                                        style={{ marginRight: "8px" }}
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Show placeholder
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
                        <Upload 
                            action=""
                            name="image"
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false}
                            fileList={newImage ? [{
                                uid: '-1',
                                name: newImage.name || 'image',
                                status: 'done',
                                originFileObj: newImage,
                            }] : []}
                            onChange={handleImageChange}
                        >
                            <Button 
                                icon={<PrefixIcon><i className="fi fi-rr-inbox-out"></i></PrefixIcon>}
                                style={{ marginTop: "8px" }}
                            >
                                {formik.values.picture && !imageRemoved ? "Change Image" : "Upload Image"}
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

