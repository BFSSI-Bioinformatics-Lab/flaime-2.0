import axios from "axios";

const ApiInstance = axios.create({
    baseURL: "https://172.17.10.69:7251/api/"
});

export default ApiInstance;