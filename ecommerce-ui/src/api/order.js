import APIBase from "./ApiBase";

// Order services

export const createOrder = async (order) => {
  const response = await APIBase.post("/api/v1/order", order);
  return response.data;
};

export const fetchOrders = async (params = {}) => {
  const response = await APIBase.get("/api/v1/order", { params });
  return response.data;
};

export const fetchOrderDetail = async (id) => {
  const response = await APIBase.get(`/api/v1/order/${id}`);
  return response.data;
};


