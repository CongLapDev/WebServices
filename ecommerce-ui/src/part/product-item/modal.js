import { Modal, message, notification } from "antd";
import VariationForm from "./variation-form-modal";
import { useContext, useEffect, useState } from "react";
import APIBase from "../../api/ApiBase";
import { GlobalContext } from "../../context";
function VariationFormModal({ product, setProduct, reload, ...props }) {
    const [variations, setVariations] = useState(null);
    const globalContext = useContext(GlobalContext);
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState(false);
    function onSubmitHandler(data) {
        globalContext.loader("");
        console.log(data)
        APIBase.post(`api/v1/product/${product.id}/item`, data)
            .then((payload) => {
                setProduct(product => {
                    product.productItems.push(payload.data);
                    return product;
                });
                notification.success({
                    message: "Success",
                    description: "Added Product Item",
                    duration: 1
                })
                reload(value => !value)
                return payload.data;
            }).catch((err) => {
                notification.error({
                    message: "Failure",
                    description: "Failure when add new Product Item",
                    duration: 1
                })
            }).finally(() => {
                globalContext.loader(false);
            })

    }
    useEffect(() => {
        APIBase.get(`api/v1/variation`).then(payload => payload.data).then(data => {
            setVariations(data);
        }).catch(console.log)
    }, [])
    return (
        <Modal title="Add variation" {...props} width={800}>
            {product && <VariationForm loading={loading} product={product} submitHandler={onSubmitHandler} />}
        </Modal>);
}

export default VariationFormModal;