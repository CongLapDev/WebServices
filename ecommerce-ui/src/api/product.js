import APIBase from "./ApiBase";

// Product & category related services

export const fetchProducts = async (params = {}) => {
  const response = await APIBase.get("/api/v1/product", { params });
  return response.data;
};

export const fetchProductDetail = async (id) => {
  const response = await APIBase.get(`/api/v1/product/${id}`);
  return response.data;
};

export const fetchProductOverview = async (params = {}) => {
  const response = await APIBase.get("/api/v2/product", { params });
  return response.data;
};

export const fetchComments = async (productId) => {
  const response = await APIBase.get("/api/v1/comment", {
    params: { product: productId },
  });
  return response.data;
};

export const postComment = async (payload) => {
  const response = await APIBase.post("/api/v1/comment", payload);
  return response.data;
};


