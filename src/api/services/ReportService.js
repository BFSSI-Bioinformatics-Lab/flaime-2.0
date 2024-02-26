import { ApiQueryGet } from "../Api";
import { encodeQuery, addSignalController } from "../tools";

const GetStoreReports = encodeQuery(async ({storeId, nutrients = [], dailyValues = [] }, abortController) => {
    const data = await ApiQueryGet(`ReportService/GetStoreReportAsync?storeId=${storeId}` +
        nutrients.map(nutrient => `&nutrient=${nutrient}`).join("") + dailyValues.map(dv => `&dailyValue=${dv}`).join(""),
        abortController
    )
    return { error: data.statusCode !== 200, reports: data.responseObjects }
});

const GetStoreReportsControlled = addSignalController(GetStoreReports);

const GetStoreReportsNutritionFacts = encodeQuery(async ({storeId, nutrients = [], dailyValues = [] }, abortController) => {
    const data = await ApiQueryGet(`ReportService/GetStoreReportCategoryChartAsync?storeId=${storeId}` +
        nutrients.map(nutrient => `&nutrient=${nutrient}`).join("") + dailyValues.map(dv => `&dailyValue=${dv}`).join(""),
        abortController
    )
    return { error: data.statusCode !== 200, reports: data.responseObjects }
});

const GetStoreReportsNutritionFactsControlled = addSignalController(GetStoreReportsNutritionFacts);

const GetCategoryReports = encodeQuery(async ({ categoryId, nutrients = [], dailyValues = [] }, abortController) => {
    const data = await ApiQueryGet(`ReportService/GetCategoryReportAsync?categoryId=${categoryId}` +
        nutrients.map(nutrient => `&nutrient=${nutrient}`).join("") + dailyValues.map(dv => `&dailyValue=${dv}`).join(""),
        abortController
    )
    return { error: data.statusCode !== 200, reports: data.responseObjects }
});

const GetCategoryReportsControlled = addSignalController(GetCategoryReports);

const GetSubcategoryReports = encodeQuery(async ({categoryId, nutrients = [], dailyValues = [] }, abortController) => {
    const data = await ApiQueryGet(`ReportService/GetSubcategoryReportAsync?categoryId=${categoryId}` +
        nutrients.map(nutrient => `&nutrient=${nutrient}`).join("") + dailyValues.map(dv => `&dailyValue=${dv}`).join(""),
        abortController
    )
    return { error: data.statusCode !== 200, reports: data.responseObjects }
})

const GetSubcategoryReportsControlled = addSignalController(GetSubcategoryReports);

export {
    GetStoreReports,
    GetStoreReportsControlled,
    GetStoreReportsNutritionFacts,
    GetStoreReportsNutritionFactsControlled,
    GetCategoryReports,
    GetCategoryReportsControlled,
    GetSubcategoryReports,
    GetSubcategoryReportsControlled
}