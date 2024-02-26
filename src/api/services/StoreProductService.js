import { ApiQueryGet } from "../Api";
import { encodeQuery, addSignalController } from "../tools";

const GetAllStoreProducts = encodeQuery(async (
    { storeid = -1, scrapebatchid = -1, mostrecentonly = true, includedetails = false }
) => {
    const data = await ApiQueryGet(
        `StoreProductService/GetAllStoreProductsAsync?storeid=${storeid}&scrapebatchid=${scrapebatchid}`
        + `&mostrecentonly=${mostrecentonly}&includeDetails=${includedetails}`
    )
    return { error: data.statusCode !== 200, products: data.responseObjects };
});

const GetAllStoreProductsByPagination = encodeQuery(async (
    { storeid = -1, scrapebatchid = -1, mostrecentonly = true, includedetails = false, pageNumber = 1, pageSize = 25 },
    abortController
) => {
    const data = await ApiQueryGet(
        `StoreProductService/GetStoreProductsAsync?storeid=${storeid}&scrapebatchid=${scrapebatchid}`
        + `&mostrecentonly=${mostrecentonly}&includeDetails=${includedetails}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
        abortController
    )
    return { error: data.statusCode !== 200, products: data.responseObjects, pagination: data.pagination };
});

const GetAllStoreProductsByPaginationControlled = addSignalController(GetAllStoreProductsByPagination);

const AdvanceSearchStoreProducts = encodeQuery(async (
    { 
        storeid = -1, scrapebatchid = -1, mostrecentonly = true, includeDetails = false, pageNumber = 1, pageSize = 25,
        productSiteName = "", storeName = "", brandName = "", categoryName = "", subcategoryName = "", ingredientEn = "",
        nutrientName = [], nutrientRange = []
    },
    abortController
) => {
    const url = `StoreProductService/AdvanceSearchStoreProductsAsync?storeid=${storeid}&scrapebatchid=${scrapebatchid}`
    + `&mostrecentonly=${mostrecentonly}&includeDetails=${includeDetails}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    + `&productSiteName=${productSiteName}&storeName=${storeName}&brandName=${brandName}&categoryName=${categoryName}`
    + `&subcategoryName=${subcategoryName}&ingredientEn=${ingredientEn}&` 
    + `${nutrientName.map((ntr, i) => `nutrientName=${ntr}&nutrientRange=${nutrientRange.length > i ? nutrientRange[i] : ""}`).join("&")}`;
    const data = await ApiQueryGet(url, abortController);
    return { error: data.statusCode !== 200, products: data.responseObjects, pagination: data.pagination };

});

const AdvanceSearchStoreProductsControlled = addSignalController(AdvanceSearchStoreProducts);

const SearchStoreProducts = encodeQuery(async (
    { searchTerm, pageSize, pageNumber, storeid = -1, scrapebatchid = -1, mostrecentonly = true, includedetails = false},
    abortController
) => {
    const url = `StoreProductService/SearchStoreProductsAsync?storeid=${storeid}&scrapebatchid=${scrapebatchid}`
    + `&mostrecentonly=${mostrecentonly}&includeDetails=${includedetails}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    + `&searchterm=${searchTerm}`;
    const data = await ApiQueryGet(url, abortController);
    return { error: data.statusCode !== 200, products: data.responseObjects, pagination: data.pagination };
});

const SearchStoreProductsControlled = addSignalController(SearchStoreProducts);

export {
    GetAllStoreProducts,
    GetAllStoreProductsByPagination,
    GetAllStoreProductsByPaginationControlled,
    AdvanceSearchStoreProducts,
    AdvanceSearchStoreProductsControlled,
    SearchStoreProducts,
    SearchStoreProductsControlled
}