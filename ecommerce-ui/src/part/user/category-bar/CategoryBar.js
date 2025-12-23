import { Row, Col, Dropdown } from "antd";
import globalStyle from '../../../assets/style/base.module.scss';
import style from './style.module.scss';
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import APIBase from "../../../api/ApiBase";
import useDevice from "../../../hooks/useDevice";

// Icon mapping for common category names
const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('phone') || name.includes('mobile')) {
        return <i className="fi fi-rr-mobile-button"></i>;
    } else if (name.includes('laptop') || name.includes('notebook')) {
        return <i className="fi fi-rr-laptop"></i>;
    } else if (name.includes('accessory') || name.includes('accessories')) {
        return <i className="fi fi-rr-sparkles"></i>;
    } else if (name.includes('software') || name.includes('app')) {
        return <i className="fi fi-brands-photoshop-camera"></i>;
    } else if (name.includes('speaker') || name.includes('audio')) {
        return <i className="fi fi-rr-speaker"></i>;
    } else if (name.includes('monitor') || name.includes('display')) {
        return <i className="fi fi-rr-desktop-wallpaper"></i>;
    } else if (name.includes('tablet')) {
        return <i className="fi fi-rr-tablet"></i>;
    } else if (name.includes('camera') || name.includes('photo')) {
        return <i className="fi fi-rr-camera"></i>;
    } else if (name.includes('headphone') || name.includes('earphone')) {
        return <i className="fi fi-rr-headphones"></i>;
    } else {
        return <i className="fi fi-rr-folder"></i>; // Default icon
    }
};

// Transform API category data to component format
const transformCategory = (category) => {
    const hasChildren = category.children && category.children.length > 0;
    
    const transformed = {
        label: category.name,
        icon: getCategoryIcon(category.name),
        id: category.id,
        href: `/product/search?category=${category.id}` // Always provide href for parent category
    };
    
    if (hasChildren) {
        // Category has children - create dropdown menu items
        // Add parent category as first item, then children
        transformed.children = [
            {
                key: `parent-${category.id}`,
                label: <Link to={`/product/search?category=${category.id}`}>All {category.name}</Link>
            },
            ...category.children.map((child, index) => ({
                key: `child-${child.id}-${index}`,
                label: <Link to={`/product/search?category=${child.id}`}>{child.name}</Link>
            }))
        ];
    }
    
    return transformed;
};

function CategoryBar({ className }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const device = useDevice();
    
    // Use click trigger on mobile/tablet, hover on desktop
    const dropdownTrigger = device === "MOBILE" || device === "TABLET" ? ['click'] : ['hover'];

    useEffect(() => {
        // Fetch categories from API
        setLoading(true);
        APIBase.get("api/v1/category/1")
            .then(payload => {
                const rootCategory = payload.data;
                if (rootCategory && rootCategory.children) {
                    // Transform API response to component format
                    const transformedCategories = rootCategory.children.map(transformCategory);
                    setCategories(transformedCategories);
                } else {
                    setCategories([]);
                }
            })
            .catch(err => {
                console.error("Error fetching categories:", err);
                // Fallback to empty array on error
                setCategories([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);
    // Show loading state or empty state
    if (loading) {
        return (
            <Row justify="center" className={clsx(style.container, className)}>
                <Row className={style.category}>
                    <Col span={24} style={{ textAlign: 'center', padding: '20px' }}>
                        <span>Loading categories...</span>
                    </Col>
                </Row>
            </Row>
        );
    }

    return (
        <Row justify="center" className={clsx(style.container, className)}>
            <Row className={style.category}>
                {
                    categories.length > 0 ? categories.map((category_, key) => {
                        const hasChildren = category_.children && category_.children.length > 0;
                        
                        return (
                            <Col key={category_.id || key} span={8} md={{ span: 6 }} lg={{ span: 4 }} className={style.category}>
                                {hasChildren ? (
                                    <Dropdown 
                                        menu={{ items: category_.children }}
                                        trigger={dropdownTrigger}
                                        placement="bottomLeft"
                                    >
                                        <Link 
                                            to={category_.href} 
                                            className={clsx(globalStyle.listItem, style.categoryItem)}
                                        >
                                            <span className={globalStyle.icon}>{category_.icon}</span>
                                            <span>{category_.label}</span>
                                            <span className={style.dropdownIndicator}>
                                                <i className="fi fi-rr-angle-small-down"></i>
                                            </span>
                                        </Link>
                                    </Dropdown>
                                ) : (
                                    <Link 
                                        to={category_.href} 
                                        className={clsx(globalStyle.listItem, style.categoryItem)}
                                    >
                                        <span className={globalStyle.icon}>{category_.icon}</span>
                                        <span>{category_.label}</span>
                                    </Link>
                                )}
                            </Col>
                        );
                    }) : (
                        <Col span={24} style={{ textAlign: 'center', padding: '20px' }}>
                            <span>No categories available</span>
                        </Col>
                    )
                }
            </Row>
        </Row>
    );
}

export default CategoryBar;