import { ApiQueryGet } from "../Api";

const GetAllCategories = async () => {
  try {
    const data = await ApiQueryGet("categories/");
    return { error: false, categories: data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GetAllSubcategories = async () => {
  try {
    const data = await ApiQueryGet("subcategories/");
    return { error: false, subcategories: data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export {
  GetAllCategories,
  GetAllSubcategories
};