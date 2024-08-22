import { ApiQueryGet } from "../Api";

const GetStoreProductByID = async (productId, controller = null) => {
    try {
      const data = await ApiQueryGet(`storeproducts/${productId}/`, controller);
      return { error: false, data: data };
    } catch (error) {
      return { error: true, message: error.message };
    }
  };
  
export {
    GetStoreProductByID,
};