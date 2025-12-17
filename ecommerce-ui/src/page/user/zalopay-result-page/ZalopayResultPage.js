import { Button, Flex, Result, Spin } from "antd";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import APIBase from "../../../api/ApiBase";

function ZalopayResultPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [urlparams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Read apptransid from URL query params (ZaloPay redirects with this)
        const appTransId = urlparams.get("apptransid");
        
        console.log("[ZalopayResultPage] Component mounted");
        console.log("[ZalopayResultPage] apptransid from URL:", appTransId);
        
        if (!appTransId) {
            console.error("[ZalopayResultPage] ❌ No apptransid in URL params");
            setError("Payment transaction ID is missing. Please check your order history.");
            setLoading(false);
            return;
        }

        // Call backend to verify payment status
        console.log(`[ZalopayResultPage] Fetching payment status: /api/v1/purchase/zalopay/result?apptransid=${appTransId}`);
        setLoading(true);
        
        APIBase.get(`/api/v1/purchase/zalopay/result?apptransid=${appTransId}`)
            .then(response => {
                console.log("[ZalopayResultPage] ✓ Payment status response:", response.data);
                const data = response.data;
                
                if (!data) {
                    throw new Error("Empty response from server");
                }
                
                setOrderData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("[ZalopayResultPage] ❌ Error fetching payment status:", err);
                setError(
                    err.response?.data?.message || 
                    err.message || 
                    "Failed to verify payment status. Please check your order history."
                );
                setLoading(false);
            });
    }, [urlparams]);

    // Loading state
    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
                <Spin size="large" tip="Verifying payment status..." />
            </Flex>
        );
    }

    // Error state
    if (error) {
        return (
            <Flex justify="center">
                <Result
                    status="error"
                    title="Payment Verification Failed"
                    subTitle={error}
                    extra={[
                        <Link to="/cart" key="orders">
                            <Button type="primary">Go to Order History</Button>
                        </Link>
                    ]}
                />
            </Flex>
        );
    }

    // Success state - Payment is PAID
    if (orderData?.paymentStatus === "PAID") {
        return (
            <Flex justify="center">
                <Result
                    status="success"
                    title="Successfully Ordered"
                    subTitle="If you have any question, please contact 0393497961 for more"
                    extra={[
                        <Link to="/" key="home">
                            <Button>Home</Button>
                        </Link>
                    ]}
                />
            </Flex>
        );
    }

    // Processing state - Payment is still PROCESSING
    if (orderData?.paymentStatus === "PROCESSING") {
        return (
            <Flex justify="center">
                <Result
                    status="info"
                    title="Payment Processing"
                    subTitle="Your payment is being processed. Please wait..."
                    extra={[
                        <Link to="/" key="home">
                            <Button>Home</Button>
                        </Link>
                    ]}
                />
            </Flex>
        );
    }

    // Cancelled state
    if (orderData?.paymentStatus === "CANCELLED") {
        return (
            <Flex justify="center">
                <Result
                    status="warning"
                    title="Payment Cancelled"
                    subTitle="Your payment was cancelled. The order has not been paid."
                    extra={[
                        <Link to="/" key="home">
                            <Button>Home</Button>
                        </Link>
                    ]}
                />
            </Flex>
        );
    }

    // Unknown state
    return (
        <Flex justify="center">
            <Result
                status="info"
                title="Payment Status Unknown"
                subTitle="Unable to determine payment status. Please check your order history."
                extra={[
                    <Link to="/" key="home">
                        <Button>Home</Button>
                    </Link>
                ]}
            />
        </Flex>
    );
}

export default ZalopayResultPage;

