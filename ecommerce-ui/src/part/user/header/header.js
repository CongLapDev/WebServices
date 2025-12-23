import image from "../../../assets/image/image.png";
import { React, useState } from "react";
import style from "./header.module.scss";
import { Link } from "react-router-dom";
import { memo } from "react";
import Tippy from "@tippyjs/react/headless";
import { Description, PrefixIcon } from "../../../components";
import clsx from "clsx";
import DarkModeToggle from "../../dark-mode-toggle/index.js";
import { Col, Row, Space } from "antd";
import Logout from "../../logout/Logout.js";
import useAuth from "../../../secure/useAuth.js";
import SearchInput from "../search-input/SearchInput.js";
import useDevice from "../../../hooks/useDevice.js";
import AvatarHolder from "../../../assets/image/avata_placeholderjpg.jpg";
import Logo from "../../../assets/image/logo192.png";
function Header({ searchTrigger }) {
    const [state, user] = useAuth();
    const device = useDevice();
    return (
        <Row className={style.header} gutter={[16, 16]} align="middle">
            <Col order={1} className={clsx(style.item, style.logo, style.left, style.logo)}>
                <Link className={style.box} to="/">
                    <img src={Logo} />
                    <h2 >LLM Shop</h2>
                </Link>
            </Col>
            <Col order={2} className={clsx(style.item, style.left, style.search)} tabIndex={-1}>
                {(device === "MOBILE" || device === "TABLET") ? <div className={style.searchTrigger}>
                    <div className={style.icon} onClick={() => { searchTrigger(search => !search) }}>
                        <i className="fi fi-rr-search"></i>
                    </div>
                </div> : <SearchInput />}
            </Col>
            <Col order={3} className={style.blank} flex={device === "MOBILE" ? 0 : 1} />
            <Col order={4} className={clsx(style.item, style.right)}>
                <Link to={"/cart"} className={clsx(style.link)}>
                    <i className="fi fi-rr-shopping-bag"></i>
                </Link>
            </Col>
            <Tippy
                interactive
                render={(attrs) => (
                    <div tabIndex={-1} {...attrs}>
                        <div className={clsx(style.dropMenu)}>
                            <div className={clsx(style.content)}>
                                {user ? (
                                    <Link to="/user">
                                        <div className={style.menuItem}>
                                            <PrefixIcon><i className="fi fi-rr-user"></i></PrefixIcon>
                                            <Description>
                                                {`${user.lastname} ${user.firstname}`}
                                            </Description>
                                        </div>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className={style.menuItem}
                                    >
                                        <span>
                                            <i className="fi fi-rr-user"></i>
                                        </span>
                                        <Description>
                                            Đăng nhập
                                        </Description>
                                    </Link>
                                )}
                                <div className={clsx(style.menuItem, style.toggle)}>
                                    <div>
                                        <PrefixIcon><i className="fi fi-rr-moon-stars"></i></PrefixIcon>
                                        <Description>Dark mode</Description>
                                    </div>
                                    <div>
                                        <div className="d-flex flex-grow-1 justify-content-end">
                                            <DarkModeToggle />
                                        </div>
                                    </div>
                                </div>
                                {user &&
                                    <div className={style.menuItem}>
                                        <div
                                            className={style.seperate}
                                        ></div>
                                        <Logout trigger={
                                            <div className={style.menuItem}>
                                                <PrefixIcon><i className="fi fi-rs-sign-out-alt"></i></PrefixIcon>
                                                <Description>Logout</Description>
                                            </div>
                                        } />

                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )}
            >
                <Col order={5} className={clsx(style.item, style.right)}>
                    <Link to="/user">
                        <div className={style.avatar}>
                            <img
                                src={(user && user.picture) || AvatarHolder}
                                alt=""
                            ></img>
                        </div>
                    </Link>
                </Col>
            </Tippy>
        </Row>
    );
}

export default memo(Header);
