import { ApiQueryGet } from "./Api";

const GetAllSubcategories = async () => {
    const data = await ApiQueryGet("SubcategoryService/GetAllSubcategoriesAsync")
    return { error: data.statusCode !== 200, subcategories: data.responseObjects }
}

export {
    GetAllSubcategories
}