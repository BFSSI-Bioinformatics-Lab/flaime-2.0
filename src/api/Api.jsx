import axios from "axios";


const ApiInstance = axios.create({ baseURL: process.env.REACT_APP_API_URL });

const ApiQueryGet = async (url, controller) => {
    const res = await ApiInstance.get(url, {signal: controller ? controller.signal : null});
    return res.data;
}

export default ApiInstance;
export { ApiQueryGet };