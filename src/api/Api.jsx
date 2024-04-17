import axios from "axios";


const ApiInstances = [];
const ApiURLs = process.env.REACT_APP_API_URLS.split(";");


// setupApiInstancess(): Setup multiple API Urls directed to the same machine
function setupApiInstances() {
    for (const url of ApiURLs) {
        const apiInstance = axios.create({ baseURL: url });
        ApiInstances.push(apiInstance);
    }
}

setupApiInstances();

const ApiQueryGet = async (url, controller) => {
    let lastError;
    let res;

    // Go through each API instance synchronously instead of asynchronously using "Promise.any"
    //  since the API Urls are all directed to the same machine and we do not want multiple requests
    //  going to that the machine at the same time in the case all of the URLs for the API work
    for (const apiInstance of ApiInstances) {
        try {
            res = await apiInstance.get(url, {signal: controller ? controller.signal : null});
        } catch (e) {
            lastError = e;
            continue;
        }

        lastError = undefined;
        break;
    }

    if (lastError !== undefined) {
        throw lastError;
    }

    return res.data;
}

export default ApiInstances;
export { ApiQueryGet };