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

const GetVerificationStats = async (scheme = 9, source = 178) => {
  try {
    const data = await ApiQueryGet(`category-predictions/?scheme=${scheme}&source=${source}&stats_only=true`);
    return { 
      error: false, 
      stats: {
        total: data.total_count || 0,
        verified: data.verified_count || 0,
        pending: (data.total_count || 0) - (data.verified_count || 0)
      }
    };
  } catch (error) {
    return { 
      error: true, 
      message: error.message,
      stats: { total: 0, verified: 0, pending: 0 }
    };
  }
};

export {
  GetCategoriesToVerify,
  SubmitCategoryVerification,
  GetVerificationStats
};