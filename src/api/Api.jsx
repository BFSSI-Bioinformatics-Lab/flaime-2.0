import axios from "axios";


const ApiInstance = axios.create({ baseURL: process.env.REACT_APP_API_URL });

const ApiQueryGet = async (url, controller, apiExt = "/api/") => {
    const res = await ApiInstance.get(`${apiExt}${url}`, {signal: controller ? controller.signal : null});
    return res.data;
}

export default ApiInstance;
export { ApiQueryGet };