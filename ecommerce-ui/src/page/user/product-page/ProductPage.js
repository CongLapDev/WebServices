import { Col, Row, Card, Image, Button, Rate, Avatar, Divider } from "antd";
import style from './style.module.scss';
import { useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import APIBase, { getImageUrl } from "../../../api/ApiBase";
import ProductItemSelect from "../../../part/product-item-selection/ProductItemSelect";
import InputNumber from "../../../components/input-number/InputNumber";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";
import Currency from "../../../components/currency/Currency";
import { GlobalContext } from "../../../context";
import useAuth from "../../../secure/useAuth";
import CommentForm from "../../../part/user/comment-form/CommentForm";
import ProductPlaceHolder from '../../../assets/image/product_placeholder.png';
import AvatarPlaceHolder from '../../../assets/image/avata_placeholderjpg.jpg';
function ProductPage() {
    const navigate = useNavigate();
    const [state, user, hasRole] = useAuth();
    const [urlParams, setUrlParams] = useSearchParams();
    const [qty, setQty] = useState(1);
    const [product, setProduct] = useState(null);
    const [selectedItem, setSelectedItem] = useState();
    const globalContext = useContext(GlobalContext);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        APIBase.get(`api/v1/product/${urlParams.get("id")}`)
            .then(payload => {
                setProduct(payload.data);
                return payload.data;
            }).catch(err => err)
        APIBase.get(`api/v1/comment?product=${urlParams.get("id")}`)
            .then(payload => {
                setComments(payload.data);
            }).catch(console.log)
    }, [urlParams])


    function isAvailable() {
        return selectedItem.warehouses.reduce((pre, warehouseItem) => {
            if (warehouseItem && warehouseItem.qty) return pre + warehouseItem.qty;
            return pre;
        }, 0) > 0
    }
    function addCard() {
        if (selectedItem && isAvailable()) {
            let cartItem = {
                productItem: {
                    id: selectedItem.id
                },
                user: {
                    id: user.id
                },
                qty: qty
            }
            console.log(cartItem)
            globalContext.message.success(`Add ${product.name} to cart successfully !`);
            APIBase.post("/api/v1/cart", cartItem)
                .then(payload => {
                })
                .catch(e => {
                    console.error(e)
                    globalContext.message.error(`Error while operating action`);
                })
        } else {
            globalContext.message.info("We are so sorry Your selection has yet available")
        }
    }
    function orderNow() {
        if (selectedItem && isAvailable()) {
            const item = new Array()
            item.push({
                qty: qty,
                id: 0,
                productItem: {
                    id: selectedItem.id,
                    product: product,
                    price: selectedItem.price,
                    originalPrice: selectedItem.originalPrice,
                    options: selectedItem.options.map(option_ => ({
                        value: option_.value,
                        variation: {
                            name: option_.name
                        }
                    }))
                }
            })
            navigate("/checkout", {
                state: {
                    data: item
                }
            })
        } else {
            globalContext.message.info("We sorry Your selection has yet available")
        }
    }
    function postComment(data) {
        APIBase.post(`api/v1/comment`, {
            ...data,
            user: user,
            product: {
                id: urlParams.get("id")
            }
        }).then(payload => {
            setComments(comments => [payload.data, ...comments])
        })
    }
    return (product &&
        <Row gutter={[16, 16]} >
            <Col md={{ span: 10 }} span={24} order={1}>
                <Card className={style.card}
                    cover={<div className={style.productImage}>
                        <img style={{ aspectRatio: "1/1", objectFit: "cover", width: " 100%" }} src={getImageUrl(product.picture) || ProductPlaceHolder} alt={product.name} />
                    </div>}
                >
                    <Row className={style.pictureSlide} gutter={[16, 16]}>
                        {product.productItems.map((item, index) => {
                            if (item.picture) return <Col className="p-2 rounded border-1 border-primary-600" sm={6} lg={3} key={index}><Image className="w-100 h-100 ratio-1x1" src={getImageUrl(item.picture)} /></Col>
                        })}
                    </Row>
                </Card>
            </Col>
            <Col md={{ span: 10 }} span={24} order={3}>
                <Card title={<small>Description</small>}>
                    {product.description}
                </Card>
            </Col>
            <Col md={{ span: 14 }} span={24} order={2}>
                <Card title={<span className={style.pdName}>{product.name}</span>} className={clsx(style.productDetail)}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}><Currency className={style.price} value={selectedItem?.price || (product && product.productItems[0].price)} /></Col>
                        <Col span={24}>
                            <ProductItemSelect onChange={setSelectedItem} productItems={product.productItems} />
                        </Col>
                        <Col>
                            <InputNumber value={qty} style={{ fontSize: "1rem" }} type="number" onChange={setQty} />
                        </Col>
                        <Col span={24}>
                            <Row justify="end">
                                <Button style={{ backgroundColor: "#333", marginRight: "5px" }} shape="round" icon={<PrefixIcon style={{ color: "white" }}><i className="fi fi-rr-shopping-cart-add"></i></PrefixIcon>} className="mt-2" onClick={() => {
                                    if (hasRole("USER")) addCard();
                                    else globalContext.message.info("You need to login first");
                                }} />
                                <Button type="primary" shape="round" onClick={() => {
                                    if (hasRole("USER")) orderNow();
                                    else globalContext.message.info("You need to login first");
                                }}>Order Now</Button>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col md={{ span: 14 }} span={24} order={4} id="comment">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card title="Comment">
                            <CommentForm onSubmit={postComment} />
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card title={<Row><span>Comment</span> <></></Row>}>
                            {comments.map(comment_ =>
                                <>
                                    <Card.Meta title={`${comment_.user.firstname} ${comment_.user.lastname}`} avatar={<Avatar src={comment_.user.picture || AvatarPlaceHolder} />} description={<Rate disabled value={comment_.rate} />} />
                                    <div style={{ paddingTop: "6px" }}>{comment_.comment}</div>
                                    <Divider />
                                </>
                            )}

                        </Card>
                    </Col>
                </Row>
            </Col>


        </Row>);
}

export default ProductPage;