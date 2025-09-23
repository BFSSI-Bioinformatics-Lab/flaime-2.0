import { ApiQueryGet, ApiQueryPost } from "../Api";

const GetCategoriesToVerify = async (scheme = 9, source = 178) => {
  try {
    const data = await ApiQueryGet(`category-predictions/?scheme=${scheme}&source=${source}`);
    return { error: false, products: data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

 const SubmitCategoryVerification = async (verification) => {
  try {
    const response = await ApiQueryPost("category-verifications/", verification);
    return { error: false, data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export {
  GetCategoriesToVerify,
  SubmitCategoryVerification
};