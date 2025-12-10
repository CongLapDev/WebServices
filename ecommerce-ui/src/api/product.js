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

// Product Admin APIs
export const createProduct = async (formData) => {
  const response = await APIBase.post("/api/v1/product", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await APIBase.put(`/api/v1/product/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await APIBase.delete(`/api/v1/product/${id}`);
  return response.data;
};


