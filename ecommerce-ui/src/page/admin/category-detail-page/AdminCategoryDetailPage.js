import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Tabs, Modal } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";
import CategoryList from "../../../part/category-list/CategoryList";
import ProductListBigIcon from "../../../part/product-list-bigicon/product-list-big-icon";
import ProductAddForm from "../../../part/admin/product/product-add-form";
import { GlobalContext } from "../../../context";
import CategoryAddModal from "../../../part/admin/category/modal";
function AdminCategoryDetailPage() {
    const globalContext = useContext(GlobalContext);
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [products, setProducts] = useState(null);
    const [productDiag, setProductDiag] = useState(false);
    const [categoryDiag, setCategoryDiag] = useState(false);

    function addNestedCategory(child) {
        setData(data => {
            data.children.push(child);
            return data;
        })
    }
    useEffect(() => {
        if (id !== undefined) {
            try {
                const id_parms = encodeURIComponent(id);
                APIBase.get(`api/v1/category/${id_parms}`)
                    .then(payload => { setData(payload.data); })
                    .catch(console.log)
                APIBase.get(`api/v1/category/${id_parms}/product`)
                    .then(payload => setProducts(payload.data))
                    .catch(console.log);
            } catch {

            }

        }
    }, [id])

    const items = [
        {
            key: 1,
            label: "Categories",
            children: <>
                <Col className="py-3" onClick={() => setCategoryDiag(true)}><Button>Add Nested Category</Button></Col>
                <Card>
                    {data && Array.isArray(data.children) && <CategoryList items={data.children} />}
                </Card>
                {data && <CategoryAddModal state={categoryDiag} setState={setCategoryDiag} parent={data} addNestedCategory={addNestedCategory} />}</>
        }
        ,
        {
            key: 2,
            label: "Products",
            children: <>
                <Col className="py-3"><Button onClick={() => { setProductDiag(true) }}>Add Product</Button></Col>
                <Card title='Product List'>
                    {products && <ProductListBigIcon>{products}</ProductListBigIcon>}
                </Card>
                <Modal title="Add new product" size="lg" open={productDiag} onCancel={() => { setProductDiag(false) }} footer={null} >
                    <ProductAddForm defaultCategory={data} />
                </Modal>
            </>
        }

    ]
    return (data &&
        <Card title={data.name}>
            <Tabs
                defaultActiveKey={"Products"}
                className="mt-5"
                items={items}
            >
            </Tabs>

        </Card>);
}

export default AdminCategoryDetailPage;