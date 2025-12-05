import APIBase from "./ApiBase";

// Payment & ZaloPay services

export const fetchPaymentMethods = async () => {
  const response = await APIBase.get("/api/v1/payment");
  return response.data;
};

export const fetchUserPayments = async (userId) => {
  const response = await APIBase.get(`/api/v1/payment/user/${userId}`);
  return response.data;
};

export const createZaloPayOrder = async (orderId) => {
  const response = await APIBase.get(`/api/v1/purchase/${orderId}/zalopay`);
  return response.data;
};

export const getZaloPayStatus = async (appTransId) => {
  const response = await APIBase.get("/api/v1/purchase/zalopay/status", {
    params: { app_trans_id: appTransId },
  });
  return response.data;
};

export const refundZaloPayOrder = async (orderId) => {
  const response = await APIBase.get("/api/v1/purchase/zalopay/refund", {
    params: { orderId },
  });
  return response.data;
};


