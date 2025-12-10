import { useState, useEffect, useLayoutEffect, useContext } from "react";
import { Button, Card, Col, Image, Row, Table, Tabs, Modal } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import APIBase, { getImageUrl } from "../../../api/ApiBase";
import VariationFormModal from "../../../part/product-item/modal";
import VariationForm from "../../../part/product-item/variation-form-modal";
import ProductItemView from "../../../part/product-item/productItemView";
import ProductEditForm from "../../../part/admin/product/product-edit-form";
import { updateProduct, deleteProduct } from "../../../api/product";
import { GlobalContext } from "../../../context";
import clsx from "clsx";
import style from './style.module.scss';
import PlaceHolder from "../../../assets/image/product_placeholder.png";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";

function ProductDetailPage() {
    const [urlParams, setUrlParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [variationForm, setVariationForm] = useState(false);
    const [load, reload] = useState(false);
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();
    
    useLayoutEffect(() => {
        fetchProduct()
    }, [])
    
    async function fetchProduct() {
        APIBase.get(`api/v1/product/${urlParams.get("id")}`)
            .then((payload) => {
                setData(payload.data)
            }).catch(console.log)
    }
    
    function handleUpdateProduct(productData) {
        globalContext.loader(true);
        updateProduct(data.id, productData)
            .then((updatedProduct) => {
                globalContext.message.success("Product updated successfully");
                setData(updatedProduct);
            })
            .catch((e) => {
                const errorMessage = e.response?.data?.message || 
                                   e.response?.data?.error || 
                                   e.message ||
                                   "Error updating product";
                globalContext.message.error(errorMessage);
                console.error("Product update error:", e);
            })
            .finally(() => {
                globalContext.loader(false);
            });
    }
    
    function handleDeleteProduct() {
        if (!data || !data.id) return;
        
        Modal.confirm({
            title: "Delete Product",
            content: `Are you sure you want to delete "${data.name}"? This action cannot be undone.`,
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => {
                globalContext.loader(true);
                deleteProduct(data.id)
                    .then(() => {
                        globalContext.message.success("Product deleted successfully");
                        // Redirect to product list page
                        navigate("/admin/product-manage");
                    })
                    .catch((e) => {
                        const errorMessage = e.response?.data?.message || 
                                           e.response?.data?.error || 
                                           e.message ||
                                           "Error deleting product";
                        globalContext.message.error(errorMessage);
                        console.error("Product delete error:", e);
                    })
                    .finally(() => {
                        globalContext.loader(false);
                    });
            }
        });
    }
    
    const tabItems = [
        {
            key: 'view',
            label: 'View',
            children: (
                <Row gutter={24}>
                    <Col span={24}>
                        <Row gutter={[24, 32]} className="p-3">
                            <Col md={4} className="p-3">
                                {data && (
                                    <Image 
                                        className="w-100" 
                                        src={getImageUrl(data.picture) || PlaceHolder}
                                        alt={data.name}
                                    />
                                )}
                            </Col>
                            <Col md={8} className="p-3">
                                <div>
                                    <p>{data?.description}</p>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24}>
                        <Row justify="space-between">
                            <h4>Variation</h4>
                            <Col sm={4}>
                                <Button 
                                    type="primary" 
                                    className="align-self-end" 
                                    onClick={() => { setVariationForm(true) }}
                                >
                                    Add variation
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    {data && (
                        <VariationFormModal 
                            reload={reload} 
                            setProduct={setData} 
                            product={data} 
                            open={variationForm} 
                            footer={null} 
                            onCancel={() => { setVariationForm(false) }} 
                        />
                    )}
                    <table className={clsx(style.productItemTable)}>
                        <thead>
                            <tr>
                                <td>ID</td>
                                <td>Image</td>
                                <td>Properties</td>
                                <td>Value</td>
                                <td>Original Price</td>
                                <td>Price</td>
                                <td>Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {data && Array.isArray(data.productItems) && data.productItems.map((item, index) => (
                                <ProductItemView setData={setData} key={index} productItem={item} />
                            ))}
                        </tbody>
                    </table>
                </Row>
            )
        },
        {
            key: 'edit',
            label: 'Edit',
            children: data ? (
                <ProductEditForm 
                    product={data} 
                    submitHandler={handleUpdateProduct}
                />
            ) : null
        }
    ];
    
    return (
        data && (
            <Card 
                title={
                    <Row justify="space-between" align="middle">
                        <Col>
                            <h3>{data.name}</h3>
                            <p>{data.manufacturer}</p>
                        </Col>
                        <Col>
                            <Button 
                                type="primary" 
                                danger
                                icon={<PrefixIcon><i className="fi fi-rr-trash"></i></PrefixIcon>}
                                onClick={handleDeleteProduct}
                            >
                                Delete Product
                            </Button>
                        </Col>
                    </Row>
                }
            >
                <Tabs items={tabItems} />
            </Card>
        )
    );
}

export default ProductDetailPage;