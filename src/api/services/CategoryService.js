import { Api } from "../Api";

const GetAllCategories = async () => {
  try {
    const categories = await Api.get("categories/");
    return { error: false, categories };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export { GetAllCategories };