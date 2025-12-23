import { Col, Flex, Pagination, Row, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import ProductFilter from "../../../part/user/product-filter/ProductFilter";
import { useContext, useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";
import { GlobalContext } from "../../../context";
import { ProductCardv2 } from "../../../components";
import style from './style.module.scss';

// Helper function to recursively collect all category IDs (parent + all descendants)
function getAllCategoryIds(category) {
    const ids = [category.id];
    if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
            ids.push(...getAllCategoryIds(child));
        });
    }
    return ids;
}

function SearchProductPage() {
    const [urlParams, setUrlParams] = useSearchParams();
    const [data, setData] = useState({
        content: [],
        pageable: {
            pageSize: 0,
            pageNumber: 0
        },
        totalElements: 0,
        totalPages: 0
    });
    const globalContext = useContext(GlobalContext);
    
    useEffect(() => {
        // Build API parameters from URL params
        const apiParam = new URLSearchParams(urlParams);
        
        // Get category parameter
        const categoryId = apiParam.get('category');
        
        // If category is specified, fetch category details to get all subcategories
        if (categoryId) {
            APIBase.get(`/api/v1/category/${categoryId}`)
                .then(categoryResponse => {
                    const category = categoryResponse.data;
                    
                    // Collect all category IDs (parent + all children recursively)
                    const allCategoryIds = getAllCategoryIds(category);
                    
                    console.log('[SearchProductPage] Category:', category.name);
                    console.log('[SearchProductPage] All category IDs (including subcategories):', allCategoryIds);
                    
                    // Remove the single category param and add all category IDs
                    apiParam.delete('category');
                    allCategoryIds.forEach(id => {
                        apiParam.append('category', id.toString());
                    });
                    
                    // Ensure default page size if not specified
                    if (!apiParam.has('size')) {
                        apiParam.set('size', '20');
                    }
                    
                    // Ensure default page number if not specified
                    if (!apiParam.has('page')) {
                        apiParam.set('page', '0');
                    }
                    
                    console.log('[SearchProductPage] API params with all category IDs:', apiParam.toString());
                    
                    // Fetch products with all category IDs
                    return APIBase.get(`/api/v2/product?${apiParam.toString()}`)
                        .then(payload => {
                            console.log('[SearchProductPage] Products received:', payload.data?.content?.length || 0, 'products');
                            return payload.data;
                        });
                })
                .then(setData)
                .catch(e => {
                    console.error('[SearchProductPage] Error fetching products:', e);
                    console.error('[SearchProductPage] Error response:', e.response?.data);
                    globalContext.message.error("Error while fetching products");
                });
        } else {
            // No category specified, fetch products normally
            // Ensure default page size if not specified
            if (!apiParam.has('size')) {
                apiParam.set('size', '20');
            }
            
            // Ensure default page number if not specified
            if (!apiParam.has('page')) {
                apiParam.set('page', '0');
            }
            
            console.log('[SearchProductPage] No category filter, fetching all products');
            console.log('[SearchProductPage] API params:', apiParam.toString());
            
            APIBase.get(`/api/v2/product?${apiParam.toString()}`)
                .then(payload => {
                    console.log('[SearchProductPage] Products received:', payload.data?.content?.length || 0, 'products');
                    return payload.data;
                })
                .then(setData)
                .catch(e => {
                    console.error('[SearchProductPage] Error fetching products:', e);
                    console.error('[SearchProductPage] Error response:', e.response?.data);
                    globalContext.message.error("Error while fetching products");
                });
        }
    }, [urlParams, globalContext])

    return (
        <Row gutter={{ xs: 6, sm: 8, md: 12, lg: 16 }}>
            <Col span={24}>
                <h2>Search Result</h2>
            </Col>
            <Col span={24}>
                <Row className={style.filter} gutter={[16, 16]}>
                    <Col span={12} md={{ span: 8 }} style={{ overflowX: "scroll" }}>
                        <ProductFilter onFilter={params_ => {
                            setUrlParams(prev => {
                                const newParams = new URLSearchParams(prev);
                                params_.entries().forEach(([key, value]) => {
                                    if (value) newParams.set(key, value);
                                    else newParams.delete(key);
                                });
                                return newParams;
                            })
                        }} />
                    </Col>
                    <Col span={12} md={{ span: 6 }}>
                        <Select
                            style={{ width: "100%" }}
                            options={[
                                {
                                    label: "From Top",
                                    value: 1,

                                }, {
                                    label: "From Bottom",
                                    value: 2
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row gutter={[16, 16]}>
                    {data.content.map((product_, index) => <Col key={index} span={12} md={{ span: 6 }} lg={{ span: 4 }} ><ProductCardv2 data={product_} /></Col>)}
                </Row>
            </Col>
            <Col span={24}>
                {data && data.pageable && (
                    <Flex justify="end">
                        <Pagination 
                            pageSize={data.pageable?.pageSize || 20} 
                            current={(data.pageable?.pageNumber || 0) + 1} 
                            total={data.totalElements || 0}
                            showSizeChanger={false}
                            onChange={(page, pageSize) => {
                                setUrlParams(prev => {
                                    const newParams = new URLSearchParams(prev);
                                    newParams.set('page', String(page - 1)); // Backend uses 0-based indexing
                                    if (pageSize) {
                                        newParams.set('size', String(pageSize));
                                    }
                                    return newParams;
                                });
                            }}
                        />
                    </Flex>
                )}
            </Col>
        </Row>);
}

export default SearchProductPage;