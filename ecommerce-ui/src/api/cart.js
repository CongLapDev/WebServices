import APIBase from "./ApiBase";

// Cart services

export const fetchUserCart = async ({ userId, page = 0, size = 10 }) => {
  const response = await APIBase.get("/api/v1/cart", {
    params: { userId, page, size },
  });
  return response.data;
};

export const addToCart = async (cartItem) => {
  const response = await APIBase.post("/api/v1/cart", cartItem);
  return response.data;
};

export const updateCartItem = async (id, cartItem) => {
  const response = await APIBase.put(`/api/v1/cart/${id}`, cartItem);
  return response.data;
};

export const deleteCartItem = async (id) => {
  const response = await APIBase.delete(`/api/v1/cart/${id}`);
  return response.data;
};


