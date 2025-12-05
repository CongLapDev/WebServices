import { Col } from "antd";
import ProductAddForm from "../../../part/product/product-add-form";
import { useContext } from "react";
import clsx from "clsx";
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
function AddProduct() {
    const globalContext = useContext(GlobalContext);
    function submit(formdata) {
        globalContext.loader("Uploading product");
        APIBase.post("/api/v1/product", formdata)
            .then((data) => {
                alert("ok");
            })
            .errors(() => {
            })
            .finally(() => {
                globalContext(false);
            })
    }
    return (<Col>
        <ProductAddForm submitHandler={submit} />

    </Col>);
}

export default AddProduct;