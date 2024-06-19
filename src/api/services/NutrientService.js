import { ApiQueryGet } from "../Api";
import { addSignalController } from "../tools";


const GetAllNutrients = async () => {
    const data = await ApiQueryGet("NutrientService/GetAllNutrientsAsync");
    return { error: data.statusCode !== 200, sources: data.responseObjects }
}


const GetAllNutrientsControlled = addSignalController(GetAllNutrients);


export {
    GetAllNutrients,
    GetAllNutrientsControlled
}