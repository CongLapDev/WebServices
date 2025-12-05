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


