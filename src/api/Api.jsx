import axios from "axios";

const ApiInstance = axios.create({
    baseURL: "https://localhost:7166/api/"//"https://172.17.10.69:7251/api/"
});

const ApiQueryGet = async (url) => {
    const res = await ApiInstance.get(url);
    return res.data;
}

export default ApiInstance;
export { ApiQueryGet };