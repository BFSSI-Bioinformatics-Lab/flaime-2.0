import { ApiQueryGet } from "./Api";
import { encodeQuery } from "./tools";

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
    { storeid = -1, scrapebatchid = -1, mostrecentonly = true, includedetails = false, pageNumber = 1, pageSize = 25 }
) => {
    const data = await ApiQueryGet(
        `StoreProductService/GetStoreProductsAsync?storeid=${storeid}&scrapebatchid=${scrapebatchid}`
        + `&mostrecentonly=${mostrecentonly}&includeDetails=${includedetails}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
    return { error: data.statusCode !== 200, products: data.responseObjects, pagination: data.pagination };
});

const AdvanceSearchStoreProducts = encodeQuery(async (
    { 
        storeid = -1, scrapebatchid = -1, mostrecentonly = true, includeDetails = false, pageNumber = 1, pageSize = 25,
        productSiteName = "", storeName = "", brandName = "", categoryName = "", subcategoryName = "", ingredientEn = "",
        nutrientName = [], nutrientRange = []
     }
) => {
    console.log(nutrientRange)
    const url = `StoreProductService/AdvanceSearchStoreProductsAsync?storeid=${storeid}&scrapebatchid=${scrapebatchid}`
    + `&mostrecentonly=${mostrecentonly}&includeDetails=${includeDetails}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    + `&productSiteName=${productSiteName}&storeName=${storeName}&brandName=${brandName}&categoryName=${categoryName}`
    + `&subcategoryName=${subcategoryName}&ingredientEn=${ingredientEn}&` 
    + `${nutrientName.map((ntr, i) => `nutrientName=${ntr}&nutrientRange=${nutrientRange.length > i ? nutrientRange[i] : ""}`).join("&")}`;
    console.log(url);
    const data = await ApiQueryGet(url);
    console.log(data)
    return { error: data.statusCode !== 200, products: data.responseObjects, pagination: data.pagination };

});

const SearchStoreProducts = encodeQuery(async (
    { searchTerm, pageSize, pageNumber, storeid = -1, scrapebatchid = -1, mostrecentonly = true, includedetails = false}
) => {
    const url = `StoreProductService/SearchStoreProductsAsync?storeid=${storeid}&scrapebatchid=${scrapebatchid}`
    + `&mostrecentonly=${mostrecentonly}&includeDetails=${includedetails}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    + `&searchterm=${searchTerm}`;
    const data = await ApiQueryGet(url);
    return { error: data.statusCode !== 200, products: data.responseObjects, pagination: data.pagination };
});

export {
    GetAllStoreProducts,
    GetAllStoreProductsByPagination,
    AdvanceSearchStoreProducts,
    SearchStoreProducts
}