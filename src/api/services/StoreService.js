import { ApiQueryGet } from "../Api";

const GetAllStores = async () => {
    const data = await ApiQueryGet("StoreService/GetAllStoresAsync")
    return { error: data.statusCode !== 200, stores: data.responseObjects }
}

export {
    GetAllStores
}