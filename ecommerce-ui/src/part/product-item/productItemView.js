import { Image, Button, notification, Space, Input } from "antd";
import APIBase from "../../api/ApiBase";
import PrefixIcon from "../../components/prefix-icon/PrefixIcon";
import { useRef, useState } from "react";
function ProductItemView({ productItem, setData }) {
    const [api, contextHolder] = notification.useNotification();
    const [editable, setEditable] = useState(false);
    const inputRef = useRef();
    function deleteItem(id) {
        APIBase.delete(`/api/v1/product/0/item/${id}`).then(() => {
            setData(product => {
                for (var i = 0; i < product.productItems.length; i++) {
                    if (product.productItems[i].id == productItem.id) {
                        product.productItems.splice(i, 1)
                    }
                }
                return product;
            })
            notification.success({
                message: "Success",
                description: "Product Item was successfully deleted",
                duration: 3,
            })
        }).catch((err) => {
            notification.error({
                message: "Failure",
                description: "Product Item was failure deleted",
                duration: 3,
            })
        })
    }

    function changePrice() {
        setEditable(false);
        APIBase.put(`/api/v1/product/item/${productItem.id}`, {
            price: inputRef.current.input.value
        }).then(() => {
            productItem.price = inputRef.current.input.value
        }).catch(console.log)
    }
    return (productItem && <>
        <tr>
            <td rowSpan={Array.isArray(productItem.options) ? productItem.options.length : 0}>
                {productItem.id}
            </td>
            <td rowSpan={Array.isArray(productItem.options) ? productItem.options.length : 0}>
                <Image width="100px" src={productItem.picture} />
            </td>
            <td>
                {productItem.options[0].variation.name}
            </td>
            <td>
                {productItem.options[0].value}
            </td>
            <td rowSpan={Array.isArray(productItem.options) ? productItem.options.length : 0}>
                {productItem.originalPrice}
            </td>
            <td onDoubleClick={() => setEditable(true)} rowSpan={Array.isArray(productItem.options) ? productItem.options.length : 0}>
                <Space><Input ref={inputRef} disabled={!editable} defaultValue={productItem.price} /><Button onClick={changePrice} type="primary" style={{ display: editable ? "block" : "none" }} icon={<PrefixIcon><i style={{ color: "white" }} className="fi fi-br-check"></i></PrefixIcon>} /></Space>
            </td>
            <td rowSpan={Array.isArray(productItem.options) ? productItem.options.length : 0}>
                <Button type="text" onClick={() => deleteItem(productItem.id)}>Delete</Button>
            </td>
        </tr>
        {productItem.options.map((item, index) => {
            if (index === 0) return false;
            return <tr key={index}>
                <td>{item.variation.name}</td>
                <td>{item.value}</td>
            </tr>
        })}
    </>)

}

export default ProductItemView;