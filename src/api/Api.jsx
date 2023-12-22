import axios from "axios";
import config from "./config.json";

const ApiInstance = axios.create({
    baseURL: config.BASE_URL
});

const ApiQueryGet = async (url, controller) => {
    const res = await ApiInstance.get(url, {signal: controller ? controller.signal : null});
    return res.data;
}

export default ApiInstance;
export { ApiQueryGet };