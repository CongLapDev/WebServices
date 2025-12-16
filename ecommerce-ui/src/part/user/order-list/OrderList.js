import { Row, Col, Spin } from 'antd';
import { useState, useEffect, useRef, useCallback } from 'react';
import APIBase from '../../../api/ApiBase';
import UserOrder from '../user-order/UserOrder';
function OrderList({ state, user }) {
    const [data, setData] = useState([]);
    const [page, setPage] = useState({
        index: 0,
        isEnd: false,
        loaded: false
    });
    const [load, setLoad] = useState(false);
    const pollingIntervalRef = useRef(null);
    
    function scrollToLoad() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        // Kiểm tra nếu người dùng đã cuộn tới cuối trang
        if (scrollTop + windowHeight >= docHeight) {
            setLoad(true);
            fetchOrder(page);
        }
    }
    
    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);
    
    // Refresh order list (first page only, for status updates)
    const refreshOrderList = useCallback(() => {
        if (!state) return;
        
        // Only refresh first page to get status updates
        // Backend infers userId from JWT SecurityContext
        APIBase.get(`/api/v1/order?status=${state}&page=0`)
            .then(payload => {
                const newOrders = payload.data.content || [];
                // Update existing orders with new data, or add new ones
                setData(currentData => {
                    const updatedData = [...newOrders];
                    // Keep paginated data if we have more pages
                    if (currentData.length > newOrders.length) {
                        // Merge with existing data, but update matching orders
                        const existingIds = new Set(newOrders.map(o => o.id));
                        const additionalData = currentData.filter(o => !existingIds.has(o.id));
                        return [...updatedData, ...additionalData];
                    }
                    return updatedData;
                });
            })
            .catch(err => {
                console.warn('Failed to refresh order list:', err);
            });
    }, [state]);
    
    // Start polling for order status updates
    const startPolling = useCallback(() => {
        stopPolling();
        // Poll every 20 seconds to check for status updates
        pollingIntervalRef.current = setInterval(() => {
            refreshOrderList();
        }, 20000);
    }, [stopPolling, refreshOrderList]);
    
    // Handle window focus - refresh when user returns to tab
    useEffect(() => {
        const handleFocus = () => {
            if (state) {
                refreshOrderList();
            }
        };
        
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [state, refreshOrderList]);
    
    useEffect(() => {
        if (!state) return;
        
        console.log(state);
        setData([]);
        setPage({ index: 0, isEnd: false, loaded: false });
        fetchOrder({ index: 0, isEnd: false, loaded: false });
        
        // Start polling after initial load
        const timer = setTimeout(() => {
            startPolling();
        }, 1000);
        
        window.addEventListener("scroll", scrollToLoad);
        return () => {
            window.removeEventListener("scroll", scrollToLoad);
            stopPolling();
            clearTimeout(timer);
        };
    }, [state, startPolling, stopPolling]);
    
    function fetchOrder(page) {
        if ((!page.isEnd) && (!page.loaded)) {
            setPage(page_ => ({ ...page_, loaded: true }));
            // Backend infers userId from JWT SecurityContext
            APIBase.get(`/api/v1/order?status=${state}&page=${page.index}`)
                .then(payload => {
                    setData(data_ => {
                        return [...data_, ...payload.data.content];
                    })
                    if (payload.data.totalPages - 1 == page.index) {
                        setPage(page_ => {
                            page_.isEnd = true;
                            return page_;
                        })
                    } else {
                        setPage(page_ => {
                            page_.index = page_.index + 1;
                            page_.loaded = false;
                            return page_;
                        })
                    }
                })
                .catch(console.log)
                .finally(() => {
                    setLoad(false);
                })
        } else {
            setLoad(false)
        }
    }
    return (<Row justify="center">
        <Col span={24} lg={{ span: 16 }} >
            {data.map((item) => <UserOrder key={item.id} data={item} />)}
        </Col>
        {load && <Col span={24}>
            <Row justify="center" style={{ padding: "10px" }}><Spin /></Row>
        </Col>}
    </Row>);
}

export default OrderList;