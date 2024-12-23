import { Api } from "../Api";

const GetStoreProductByID = async (productId, controller = null) => {
    try {
        const data = await Api.get(`storeproducts/${productId}/`, controller);
        return { error: false, data };
    } catch (error) {
        console.error(`Error in GetStoreProductByID: ${error.message}`);
        return { error: true, message: error.message };
    }
};
  
export { GetStoreProductByID };