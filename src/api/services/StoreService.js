import { ApiQueryGet } from "../Api";
import { addSignalController } from "../tools";


const GetAllStores = async () => {
    const data = await ApiQueryGet("StoreService/GetAllStoresAsync")
    return { error: data.statusCode !== 200, stores: data.responseObjects }
}

const GetAllStoresControlled = addSignalController(GetAllStores);


export {
    GetAllStores,
    GetAllStoresControlled
}