import { ApiQueryGet } from "./Api";
import { encodeQuery } from "./tools";

const GetStoreReports = encodeQuery(async ({ storeId, nutrients = [], dailyValues = [] }) => {
    console.log(nutrients)
    console.log(dailyValues)
    const data = await ApiQueryGet(`ReportService/GetStoreReportAsync?storeId=${storeId}` +
        nutrients.map(nutrient => `&nutrient=${nutrient}`).join("") + dailyValues.map(dv => `&dailyValue=${dv}`).join("")
    )
    return { error: data.statusCode !== 200, reports: data.responseObjects }
})

export {
    GetStoreReports
}