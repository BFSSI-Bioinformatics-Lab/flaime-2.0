import { ApiQueryGet } from "./Api";

const GetAllSources = async () => {
    const data = await ApiQueryGet("SourceService/GetAllSourcesAsync")
    return { error: data.statusCode !== 200, sources: data.responseObjects }
}

export {
    GetAllSources
}