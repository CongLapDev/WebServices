import { Row, Col, Dropdown } from "antd";
import globalStyle from '../../../assets/style/base.module.scss';
import style from './style.module.scss';
import clsx from "clsx";
import { Link } from "react-router-dom";
import { Fragment } from "react";
import styled from "styled-components";
const Div = styled.div``;
function CategoryBar({ className }) {
    const categories = [
        {
            label: "Phone",
            icon: <i className="fi fi-rr-mobile-button"></i>,
            children: [
                {
                    key: "1",
                    label: <Link to="/product/search?category=12">Apple</Link>
                },
                {
                    key: "2",
                    label: <Link to="/product/search?category=13">Samsung</Link>
                },
                {
                    key: "3",
                    label: <Link to="/product/search?category=14">Xiaomi</Link>
                },
                {
                    key: "4",
                    label: <Link to="/product/search?category=15">Oppo</Link>
                },
                {
                    key: "5",
                    label: <Link to="/product/search?category=16">Sony</Link>
                }
            ]
        },
        {
            label: "Laptop",
            icon: <i className="fi fi-rr-laptop"></i>,
            children: [
                {
                    key: "1",
                    label: <Link to="/product/search?category=8">Macbook</Link>
                },
                {
                    key: "2",
                    label: <Link to="/product/search?category=9">Acer</Link>
                },
                {
                    key: "3",
                    label: <Link to="/product/search?category=10">HP</Link>
                },
                {
                    key: "4",
                    label: <Link to="/product/search?category=11">DELL</Link>
                }
            ]
        },
        {
            label: "Accessory",
            icon: <i className="fi fi-rr-sparkles"></i>,
            href: "/product/search?category=7"
        },
        {
            label: "Software",
            icon: <i className="fi fi-brands-photoshop-camera"></i>,
            href: "/product/search?category=4"
        },
        {
            label: "Speaker",
            icon: <i className="fi fi-rr-speaker"></i>,
            children: [
                {
                    key: "1",
                    label: <Link to="/product/search?category=17">Sony</Link>
                },
                {
                    key: "2",
                    label: <Link to="/product/search?category=18">Beat</Link>
                }
            ]

        },
        {
            label: "Monitor",
            icon: <i className="fi fi-rr-desktop-wallpaper"></i>,
            href: "/product/search?category=6"
        }
    ]
    return (
        <Row justify="center" className={clsx(style.container, className)}>
            <Row className={style.category}>
                {
                    categories.map((category_, key) => {
                        let Wrap = category_.children ? Dropdown : Fragment;
                        let Item = category_.href ? Link : Div;
                        return <Col key={key} span={8} md={{ span: 6 }} lg={{ span: 4 }} className={style.category}>
                            <Wrap {...category_.children ? { menu: { items: category_.children } } : {}}>
                                <Item to={category_.href} className={clsx(globalStyle.listItem, style.categoryItem)}>
                                    <span className={globalStyle.icon}>{category_.icon}</span>
                                    <span>{category_.label}</span>
                                </Item>
                            </Wrap>
                        </Col>
                    })
                }
            </Row>
        </Row>
    );
}

export default CategoryBar;