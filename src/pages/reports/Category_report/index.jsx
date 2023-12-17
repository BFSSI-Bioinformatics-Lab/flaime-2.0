import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/page/PageContainer'
import SearchFilter from '../../../components/inputs/SearchFilter'
import GroceryLayout from '../../../components/diagrams/GroceryLayout'
import { GetAllCategories } from '../../../api/CategoryService'
import { GetCategoryReportsControlled } from '../../../api/ReportService'
import { categoryReportNutrients } from '../constants'
const Category_report = () => {
  
  const [loadingReport, setLoadingReport] = useState(false);
  const [getCategoryReportsCancel, setGetCategoryReportsCancel] = useState(null);
  const [categoryReport, setCategoryReport] = useState(null);
  const [storeProductCategoryList, setStoreProductCategoryList] = useState([]);
  const [searchFilterCategories, setSearchFilterCategories] = useState([{
    title: "Enter category",
    options: [],
    loading: true
  }]);

  const getCategories = async () => {
    const res = await GetAllCategories();
    if (!res.error){
      setStoreProductCategoryList(res.categories);
    }
  }

  const onCategoryInputChange = async (label, e, category) => {
    if (!category) return;
    try {
      setLoadingReport(true);
      const categoryId = storeProductCategoryList.find(cat => cat.name === category).id;
      getCategoryReportsCancel && getCategoryReportsCancel.fn();
      const [GetCategoryReportsCall, GetCategoryReportsCancel ] = GetCategoryReportsControlled();
      setGetCategoryReportsCancel({ fn: GetCategoryReportsCancel });
      const res = await GetCategoryReportsCall({
        categoryId,
        nutrients: categoryReportNutrients.map(c => c.nutrient),
        dailyValues: categoryReportNutrients.map(c => c.dailyValue).filter(c => !isNaN(c))
      })
      if (res && !res.error)
        setCategoryReport(res.reports[0]);
      setLoadingReport(false);
    } catch (e){
      
    }
  }

  useEffect(() => {
    getCategories();
  }, []);


  useEffect(() => {
    setSearchFilterCategories([
      {
        title: "Enter category",
        options: storeProductCategoryList.map(category => category.name)
      }
    ])
  }, [storeProductCategoryList])

  return (
    <div>
      <PageContainer>
        <h2>Category_report Page</h2>
        <SearchFilter free={false} categories={searchFilterCategories} onInputChange={onCategoryInputChange} />
        <p>
          {loadingReport && "Loading...."}
        </p>
        {
          categoryReport && (
            <div>
              <p>
                The { categoryReport.categoryName } category consists of {categoryReport.productCount} products
                across 6 stores. Of these products, {categoryReport.verification.numVerified} were manually verified 
                and {categoryReport.verification.numPredicted} were predicted to fall in this category using a machine learning model.
                <br/>
                Nutrients: Of the {storeProductCategoryList.length} food categories, {categoryReport.categoryName} have 
                the {categoryReport.sodiumRanking}th highest sodium, {categoryReport.saturatedFatRanking}th highest saturated fat,
                and {categoryReport.sugarRanking}th highest sugar content.
                <br/>
                {categoryReport.atwaterTestResult ? categoryReport.atwaterTestResult.numPassing : 0} products passed the Atwater test,  
                {categoryReport.atwaterTestResult ? categoryReport.atwaterTestResult.numFailing : 0}  failed,  
                and  {categoryReport.atwaterTestResult ? categoryReport.atwaterTestResult.numInsufficientInformation : 0}  had insufficient information
                <br/>
                Ingredients: {categoryReport.cateogryName} typically contain {categoryReport.ingredientStat.commonMin} to 
                {categoryReport.ingredientStat.commonMax} ingredients. The {categoryReport.ingredientStat.mostCommonIngredients.length} most
                common ingredients are {categoryReport.ingredientStat.mostCommonIngredients.join(", ")}
              </p>
            </div>
          ) 
        }
        <GroceryLayout/>
      </PageContainer>
    </div>
  )
}

export default Category_report