import { useEffect, useState } from "react"
import { FormControl, Select, MenuItem, Typography, Button } from "@mui/material"
import { GetAllCategories } from "../../api/CategoryService";
import { GetAllStores } from "../../api/StoreService";
import { GetStoreReports } from "../../api/ReportService";
const Report_builder = () => {

  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState("");
  const [reportSubject, setReportSubject] = useState("")
  const [stores, setStores] = useState({});
  const [categories, setCategories] = useState({});

  const getCategories = async () => {
    const request = await GetAllCategories();
    const obj = request.error ? {} : 
        Object.assign({}, ...request.categories.map(category => ({[category.name]: category})));
    console.log(obj);
    setCategories(obj);
    
  }

  const getStores = async () => {
    const request = await GetAllStores();
    const obj = request.error ? {} : 
        Object.assign({}, ...request.stores.map(store => ({[store.name]: store})));
    console.log(obj);
    setStores(obj);
    
  }

  const onReportSubjectChange = (e) => {
    setReportSubject(e.target.value);
  }

  const onBuildReportButtonClick = async () => {
    console.log(reportSubject)
    console.log(stores)
    const request = await GetStoreReports(
      {
        storeId: stores[reportSubject].id, 
        nutrients: ["SODIUM", "SUGARS", "PROTEIN"], 
        dailyValues: [2300, 50, 50]
      });
    !request.error && setReport(request.reports[0]);
    console.log(request.reports)
  }

  useEffect(() => {
    getStores();
    getCategories();
  }, []);
  return (
    <div>
        <h2>Report_builder Page</h2>
        <FormControl>
          <div>
            <Typography variant="subtitle1">Generate Report For</Typography>
            <Select autoWidth>
              <MenuItem value="store">Store</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </Select>
          </div>
          <div>
            <Typography variant="subtitle1">Generate Report For</Typography>
            <Select onChange={onReportSubjectChange}>
              {
                Object.keys(stores).map(store => (
                  <MenuItem value={store}>{store}</MenuItem>
                ))
              }
            </Select>
          </div>
          <Button onClick={onBuildReportButtonClick}>Build Report</Button>
        </FormControl>
        { 
          report && 
          <div>
            <Typography>Report</Typography>
            <div>
              StoreName = {report.storeName}
            </div>
            <div>
              completeProductCount = {report.completeProductCount}
            </div>
            <div>
              nutritionFactTableCount = {report.nutritionFactTableCount}
            </div>
            <div>
              numVerified = {report.verification.numVerified},
              numPredicted = {report.verification.numPredicted}
            </div>
            <div> 
              Most common ingredients = {report.ingredientStat.mostCommonIngredients.join(", ")}
            </div>
          </div>
        }
    </div>
  )
}

export default Report_builder