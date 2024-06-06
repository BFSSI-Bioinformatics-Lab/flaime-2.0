import { ApiQueryGet } from "../Api";
import { addSignalController } from "../tools";

const GetAllSources = async () => {
    const data = await ApiQueryGet("SourceService/GetAllSourcesAsync", null, "");
    return { error: data.statusCode !== 200, sources: data.responseObjects }
}


const GetAllSourcesControlled = addSignalController(GetAllSources);


export {
    GetAllSources,
    GetAllSourcesControlled
}