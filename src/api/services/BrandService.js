import { ApiQueryGet } from "../Api";

const GetBrandsByPagination = async ({ pageNumber, pageSize }) => {
    const data = await ApiQueryGet(`BrandService/GetBrandsByPaginationAsync?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    return { error: data.statusCode !== 200, brands: data.responseObjects, pagination: data.pagination };
}

export {
    GetBrandsByPagination
}