import { Button, Flex, Result, Col, Row, Spin } from "antd";
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";

function ZaloPayProcess() {
    const [state, setState] = useState(3); // 1=success, 2=error, 3=processing
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [urlparams] = useSearchParams();
    const intervalRef = useRef(null);

    useEffect(() => {
        const orderId = urlparams.get("id");
        
        console.log("[ZaloPayProcess] Component mounted");
        console.log("[ZaloPayProcess] Order ID:", orderId);
        
        if (!orderId) {
            console.error("[ZaloPayProcess] ❌ No order ID in URL params");
            setError("Order ID is missing");
            setLoading(false);
            return;
        }

        // Fetch ZaloPay order details
        console.log(`[ZaloPayProcess] Fetching: /api/v1/purchase/${orderId}/zalopay`);
        setLoading(true);
        
        APIBase.get(`/api/v1/purchase/${orderId}/zalopay`)
            .then(payload => {
                console.log("[ZaloPayProcess] ✓ API Response:", payload.data);
                const responseData = payload.data;
                
                if (!responseData) {
                    throw new Error("Empty response from server");
                }
                
                setData(responseData);
                setLoading(false);
                
                // Check if order was created successfully (v2 API returns success field)
                if (responseData.success === true && responseData.return_code === 1) {
                    console.log("[ZaloPayProcess] ✓ Order created successfully");
                    console.log("[ZaloPayProcess] app_trans_id:", responseData.app_trans_id);
                    console.log("[ZaloPayProcess] order_url:", responseData.order_url);
                    
                    // ZaloPay v2 does NOT return qr_code - redirect to order_url instead
                    if (responseData.order_url) {
                        console.log("[ZaloPayProcess] Redirecting to ZaloPay payment page:", responseData.order_url);
                        // Redirect user to ZaloPay payment page
                        window.location.href = responseData.order_url;
                        return; // Exit early after redirect
                    }
                    
                    // Clear any existing interval
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    
                    // Start polling for payment status ONLY after CREATE success (if order_url not available)
                    if (responseData.app_trans_id) {
                        intervalRef.current = setInterval(() => {
                            console.log("[ZaloPayProcess] Polling status for:", responseData.app_trans_id);
                            
                            APIBase.get(`/api/v1/purchase/zalopay/status?app_trans_id=${responseData.app_trans_id}`)
                                .then(payload => {
                                    console.log("[ZaloPayProcess] Status response:", payload.data);
                                    const statusData = typeof payload.data === 'string' 
                                        ? JSON.parse(payload.data) 
                                        : payload.data;
                                    
                                    // return_code: 1=success, 2=failed, 3=processing
                                    if (statusData.return_code !== 3) {
                                        console.log("[ZaloPayProcess] Payment finalized with return_code:", statusData.return_code);
                                        setState(statusData.return_code);
                                        
                                        // Stop polling
                                        if (intervalRef.current) {
                                            clearInterval(intervalRef.current);
                                            intervalRef.current = null;
                                        }
                                    } else {
                                        console.log("[ZaloPayProcess] Payment still processing...");
                                    }
                                })
                                .catch(err => {
                                    console.error("[ZaloPayProcess] ❌ Status polling error:", err);
                                });
                        }, 4000);
                    }
                } else {
                    console.error("[ZaloPayProcess] ❌ Order creation failed, success:", responseData.success, "return_code:", responseData.return_code);
                    setState(2); // Error state
                }
            })
            .catch(err => {
                console.error("[ZaloPayProcess] ❌ Failed to fetch ZaloPay order:", err);
                console.error("[ZaloPayProcess] Error details:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(err.response?.data?.message || err.message || "Failed to load payment information");
                setLoading(false);
                setState(2); // Error state
            });

        // Cleanup interval on unmount
        return () => {
            console.log("[ZaloPayProcess] Component unmounting, cleaning up interval");
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [urlparams])

    console.log("[ZaloPayProcess] Rendering - state:", state, "loading:", loading, "hasData:", !!data, "hasOrderUrl:", !!data?.order_url);

    return (
        <Row gutter={{ xs: 0, sm: 0, md: 8, lg: 12 }} align="middle" justify="center" style={{ minHeight: '400px', padding: '24px' }}>
            {/* Loading State */}
            {loading && (
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Spin size="large" tip="Loading payment information..." />
                </Col>
            )}

            {/* Error State */}
            {!loading && error && (
                <Col span={24}>
                    <Result 
                        status="error" 
                        title="Failed to Load Payment" 
                        subTitle={error}
                        extra={
                            <Button type="primary" onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        }
                    />
                </Col>
            )}

            {/* Success State - Payment Completed */}
            {!loading && !error && state === 1 && (
                <Col span={24}>
                    <Result 
                        status="success" 
                        title="Payment Successful!" 
                        subTitle="Your order has been paid. Purchase information will be updated within 15 minutes."
                        extra={
                            <Link to="/cart">
                                <Button type="primary">View My Orders</Button>
                            </Link>
                        }
                    />
                </Col>
            )}

            {/* Error State - Payment Failed */}
            {!loading && !error && state === 2 && (
                <Col span={24}>
                    <Result 
                        status="error" 
                        title="Payment Failed" 
                        subTitle="There was an error processing your payment. Please try again."
                        extra={
                            <Link to="/cart">
                                <Button type="primary">Back to Orders</Button>
                            </Link>
                        }
                    />
                </Col>
            )}

            {/* Processing State - Redirect to order_url (ZaloPay v2 does NOT return qr_code) */}
            {!loading && !error && state === 3 && data && (
                <>
                    {data.order_url ? (
                        <>
                            <Col span={24} style={{ marginBottom: '24px' }}>
                                <Flex justify="center" align="center" vertical gap={16}>
                                    <h2 style={{ margin: 0 }}>Redirecting to ZaloPay</h2>
                                    <p style={{ color: '#666', margin: 0 }}>You will be redirected to ZaloPay payment page...</p>
                                </Flex>
                            </Col>
                            <Col span={24} style={{ textAlign: 'center' }}>
                                <Button 
                                    type="primary" 
                                    size="large"
                                    onClick={() => window.location.href = data.order_url}
                                >
                                    Go to ZaloPay Payment Page →
                                </Button>
                            </Col>
                            <Col span={24} style={{ marginTop: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: '#999' }}>
                                    If you are not redirected automatically, click the button above
                                </p>
                            </Col>
                        </>
                    ) : (
                        <Col span={24}>
                            <Result 
                                status="warning" 
                                title="Payment URL Not Available" 
                                subTitle="Payment information is incomplete. Please contact support."
                            />
                        </Col>
                    )}
                </>
            )}
        </Row>
    );
}

export default ZaloPayProcess;