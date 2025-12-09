import APIBase from "./ApiBase";

// Category services

export const fetchCategories = async () => {
  const response = await APIBase.get("/api/v1/category");
  return response.data;
};

export const fetchCategoryDetail = async (id) => {
  const response = await APIBase.get(`/api/v1/category/${id}`);
  return response.data;
};

export const createCategory = async (category) => {
  const response = await APIBase.post("/api/v1/category", category);
  return response.data;
};

export const updateCategory = async (id, category) => {
  const response = await APIBase.put(`/api/v1/category/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id) => {
  await APIBase.delete(`/api/v1/category/${id}`);
};


