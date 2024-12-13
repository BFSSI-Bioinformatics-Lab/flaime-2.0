import { Api } from "../Api";

const GetAllStores = async () => {
  try {
    const stores = await Api.get("stores/");
    return { error: false, stores };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export { GetAllStores };