import axios from "axios";


const ApiInstance = axios.create({ baseURL: process.env.REACT_APP_API_URL });

const ApiQueryGet = async (url, controller, apiExt = "/api/") => {
    console.log(`Making API call to: ${apiExt}${url}`);
    const res = await ApiInstance.get(`${apiExt}${url}`, {signal: controller ? controller.signal : null});
    console.log(`API response for ${url}:`, res.data);
    return res.data;
}

export default ApiInstance;
export { ApiQueryGet };