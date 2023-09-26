import { ApiQueryGet } from "./Api";

const GetAllCategories = async () => {
    const data = await ApiQueryGet("CategoryService/GetAllCategoriesAsync")
    return { error: data.statusCode !== 200, categories: data.responseObjects }
}

const GetCategoriesByPagination = async ({ pageNumber, pageSize }) => {
    const data = await ApiQueryGet(`CategoryService/GetCategoriesByPaginationAsync?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    return { error: data.statusCode !== 200, categories: data.responseObjects, pagination: data.pagination };
}


export {
    GetAllCategories,
    GetCategoriesByPagination
}