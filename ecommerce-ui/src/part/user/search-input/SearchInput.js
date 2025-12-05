import Tippy from "@tippyjs/react/headless";
import style from './style.module.scss';
import { Col, Button, Skeleton, Empty } from "antd";
import { memo, useEffect, useRef, useState } from "react";
import APIBase from "../../../api/ApiBase";
import { debounce } from "lodash";
import { Link, useNavigate } from "react-router-dom";

function SearchInput({ }) {
    const inputRef = useRef();
    const searchTrigger = useRef();
    const navigate = useNavigate();
    const [products, setProducts] = useState({
        content: []
    });
    const [loading, setLoading] = useState(null);
    const [visible, setVisible] = useState(false);
    function fetchProduct(name) {
        if (name.trim()) {
            setLoading(true);
            APIBase.get(`/api/v2/product?name=${encodeURIComponent(name)}`)
                .then(payload => payload.data)
                .then(data => {
                    setProducts(data);
                    setLoading(false);
                })
                .catch(e => {
                    setProducts(undefined)
                })
        }
    }

    useEffect(() => {
        const fetch = debounce((e) => {
            fetchProduct(e.target.value)
        }, 1000)

        inputRef.current.addEventListener("input", fetch)
        inputRef.current.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchTrigger.current.click();
            }
        })
        return () => {
            inputRef.current?.removeEventListener("input", fetch);
        }
    }, [])
    return (
        <Tippy
            interactive
            onClickOutside={() => { setVisible(false) }}
            visible={visible}
            render={attr => (
                <Col className={style.searchResult} style={{ maxWidth: "460px", width: "90vw", }} tabIndex={-1} {...attr}>
                    {loading && <Skeleton />}
                    {products.content.length == 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    {<div className={style.result}>
                        {products.content.map(product_ => {
                            return (<Link to={`/product?id=${product_.id}`} onClick={() => setVisible(false)} className={style.productItem} >
                                <div className={style.picture}>
                                    <img src={product_.picture} />
                                </div>
                                <div className={style.spec}>
                                    <div className={style.name} span={24}>{product_.name}</div>
                                    <div className={style.manufacturer} span={24}>{product_.manufacturer}</div>
                                    <div className={style.price} span={24}>{product_.min_price}</div>
                                </div>
                            </Link>)
                        })}
                        {products.content.length != 0 && <Button type="text" block onClick={() => {
                            searchTrigger.current.click()
                        }}>Show All</Button>}
                    </div>}
                </Col>
            )}
        >
            <div onFocus={() => {
                setVisible(true)
            }} tabIndex={0} className={style.container}>
                <input ref={inputRef} />
                <div ref={searchTrigger} id="searchBtn" className={style.icon} onClick={() => {
                    var value = inputRef.current.value;
                    if (value !== "") {
                        setVisible(false);
                        navigate(`/product/search?name=${value}`);
                    }
                }}>
                    <i className="fi fi-rr-search"></i>
                </div>
            </div>
        </Tippy>
    );
}

export default memo(SearchInput);