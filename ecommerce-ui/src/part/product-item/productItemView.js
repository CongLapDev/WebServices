import { Image, Button, notification, Space, Input } from "antd";
import APIBase, { getImageUrl } from "../../api/ApiBase";
import PrefixIcon from "../../components/prefix-icon/PrefixIcon";
import { useRef, useState } from "react";
function ProductItemView({ productItem, setData }) {
    const [api, contextHolder] = notification.useNotification();
    const [editable, setEditable] = useState(false);
    const inputRef = useRef();
    
    // Safety check: ensure options array exists and has at least one item
    const options = Array.isArray(productItem?.options) ? productItem.options : [];
    const firstOption = options[0] || null;
    const rowSpan = options.length > 0 ? options.length : 1;
    
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
    
    // Don't render if productItem is invalid or has no options
    if (!productItem || !firstOption) {
        return null;
    }
    
    return (
        <>
            <tr>
                <td rowSpan={rowSpan}>
                    {productItem.id}
                </td>
                <td rowSpan={rowSpan}>
                    <Image width="100px" src={getImageUrl(productItem.picture)} />
                </td>
                <td>
                    {firstOption.variation?.name || "N/A"}
                </td>
                <td>
                    {firstOption.value || "N/A"}
                </td>
                <td rowSpan={rowSpan}>
                    {productItem.originalPrice || 0}
                </td>
                <td onDoubleClick={() => setEditable(true)} rowSpan={rowSpan}>
                    <Space>
                        <Input 
                            ref={inputRef} 
                            disabled={!editable} 
                            defaultValue={productItem.price} 
                        />
                        <Button 
                            onClick={changePrice} 
                            type="primary" 
                            style={{ display: editable ? "block" : "none" }} 
                            icon={<PrefixIcon><i style={{ color: "white" }} className="fi fi-br-check"></i></PrefixIcon>} 
                        />
                    </Space>
                </td>
                <td rowSpan={rowSpan}>
                    <Button type="text" onClick={() => deleteItem(productItem.id)}>Delete</Button>
                </td>
            </tr>
            {options.map((item, index) => {
                if (index === 0) return null;
                return (
                    <tr key={index}>
                        <td>{item.variation?.name || "N/A"}</td>
                        <td>{item.value || "N/A"}</td>
                    </tr>
                );
            })}
        </>
    )

}

export default ProductItemView;