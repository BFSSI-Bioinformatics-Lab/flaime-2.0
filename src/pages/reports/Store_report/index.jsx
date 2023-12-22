import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/page/PageContainer'
import SearchFilter from '../../../components/inputs/SearchFilter'
import { GetAllStores } from '../../../api/services/StoreService'
import { GetStoreReportsControlled, GetStoreReportsNutritionFactsControlled } from '../../../api/services/ReportService'
import { storeReportNutrients } from '../constants'
const Store_report = () => {
  
  const [loadingReport, setLoadingReport] = useState(false);
  const [getStoreReportsCancel, setGetStoreReportsCancel] = useState(null);
  const [getStoreReportsNutritionFactsCancel, setGetStoreReportsNutritionFactsCancel] = useState(null);

  const [storeReport, setStoreReport] = useState(null);
  const [storeReportNutritionFacts, setStoreReportNutritionFacts] = useState(null);

  const [storesList, setStoresList] = useState([]);
  const [searchFilterCategories, setSearchFilterCategories] = useState([{
    title: "Enter store",
    options: [],
    loading: true
  }]);

  const getStores = async () => {
    const res = await GetAllStores();
    if (!res.error){
        setStoresList(res.stores);
    }
  }

  const onStoreInputChange = async (label, e, store) => {
    if (!store) return;
    try {
        setLoadingReport(true);
        const storeId = storesList.find(s => s.name === store).id;
        getStoreReportsCancel && getStoreReportsCancel.fn();
        getStoreReportsNutritionFactsCancel && getStoreReportsNutritionFactsCancel.fn();
    
        const [GetStoreReportsCall, GetStoreReportsCancel ] = GetStoreReportsControlled();
        const [GetStoreReportsNutritionFactsCall, GetStoreReportsNutritionFactsCancel ] = GetStoreReportsNutritionFactsControlled();
    
        setGetStoreReportsCancel({ fn: GetStoreReportsCancel });
        setGetStoreReportsNutritionFactsCancel({ fn: GetStoreReportsNutritionFactsCancel })
        const params = {
            storeId,
            nutrients: storeReportNutrients.map(c => c.nutrient),
            dailyValues: storeReportNutrients.map(c => c.dailyValue).filter(c => !isNaN(c))
        }
        GetStoreReportsCall(params).then(res => {
            if (res && !res.error)
                setStoreReport(res.reports[0]);
            setLoadingReport(false);
        });
        GetStoreReportsNutritionFactsCall(params).then(res => {
            if (res && !res.error)
                setStoreReportNutritionFacts(res.reports[0])
        })
    } catch (e){
        
    }
    
  }

    useEffect(() => {
        getStores();
    }, []);


    useEffect(() => {
        setSearchFilterCategories([
            {
                title: "Enter store",
                options: storesList.map(category => category.name)
            }
        ])
    }, [storesList])

    return (
        <div>
            <PageContainer>
                <h2>Store_report Page</h2>
                <SearchFilter free={false} categories={searchFilterCategories} onInputChange={onStoreInputChange} />
                <p>
                    {loadingReport && "Loading...."}
                </p>
                {
                    storeReport && (
                        <div>
                            <p>
                                Overview: {storeReport.storeName} has a total of {storeReport.productCount} products 
                                across 27 food categories. {storeReport.verification.numVerified} of the store's products were manually 
                                verified and the rest were assigned categories using a machine learning model.
                                <br/>
                                Ingredients: Of the products with nutritional ingredients, {storeReport.ingredientListCount} contain
                                ingredient lists. {storeReport.allergyInformationCount} of these contain allergy information 
                                or warnings.
                                <br/>
                                Products: Of the {storeReport.storeName} products with nutrition fact tables, {storeReportNutritionFacts.reportNutritionFactEntities.map(
                                    nutrientInfo => (
                                        <span>
                                            {nutrientInfo.nutritionStatsByGroup.find(n => n.groupName === "All Categories").numUpperThreshold} are over 15% {nutrientInfo.nutrientEntity.name.toLowerCase()},
                                        </span>
                                    )
                                )}
                                <br/>
                                Nutrition:  {storeReport.nutritionFactTableCount} have nutrition information.
                                <br/> 
                                {storeReport.atwaterTestResult ? storeReport.atwaterTestResult.numPassing : 0} products passed the Atwater test,  
                                {storeReport.atwaterTestResult ? storeReport.atwaterTestResult.numFailing : 0}  failed,  
                                and  {storeReport.atwaterTestResult ? storeReport.atwaterTestResult.numInsufficientInformation : 0}  had insufficient information                            
                                <br/>
                                Brands: The top {storeReport.topBrands.length} brands are {storeReport.topBrands.map(
                                    brandStat => (
                                        <span>
                                            {brandStat.brandEntity.name} ({brandStat.brandCount} products),
                                        </span>
                                    )
                                )}
                                <br/>
                                Images: {storeReport.storeName} have on average {storeReport.hasImagesCount / storeReport.productCount} images, 
                                with {storeReport.productCount - storeReport.hasImagesCount} products missing images for the front of package.
                            </p>
                        </div>
                    ) 
                    /*"storeName": "NOFRILLS",
            "completeProductCount": 5345,
            "nutritionFactTableCount": 8456,
            "ingredientListCount": 12344,
            "allergyInformationCount": null,
            "hasImagesCount": 9344,
            "topBrands": [
                {
                    "brandEntity": {
                        "id": 1638,
                        "name": "president choice",
                        "origName": "",
                        "hasName": true,
                        "createdDateTime": "0001-01-01T00:00:00",
                        "createdBy": null,
                        "modifiedDateTime": "0001-01-01T00:00:00",
                        "modifiedBy": null,
                        "deletedDateTime": null,
                        "deletedBy": null,
                        "deleted": false
                    },
                    "brandCount": 970
                },
                {
                    "brandEntity": {
                        "id": 1636,
                        "name": "no name",
                        "origName": "",
                        "hasName": true,
                        "createdDateTime": "0001-01-01T00:00:00",
                        "createdBy": null,
                        "modifiedDateTime": "0001-01-01T00:00:00",
                        "modifiedBy": null,
                        "deletedDateTime": null,
                        "deletedBy": null,
                        "deleted": false
                    },
                    "brandCount": 435
                },
                {
                    "brandEntity": {
                        "id": 1657,
                        "name": "farmer market",
                        "origName": "",
                        "hasName": true,
                        "createdDateTime": "0001-01-01T00:00:00",
                        "createdBy": null,
                        "modifiedDateTime": "0001-01-01T00:00:00",
                        "modifiedBy": null,
                        "deletedDateTime": null,
                        "deletedBy": null,
                        "deleted": false
                    },
                    "brandCount": 75
                },
                {
                    "brandEntity": {
                        "id": 2004,
                        "name": "ziggy",
                        "origName": "",
                        "hasName": true,
                        "createdDateTime": "0001-01-01T00:00:00",
                        "createdBy": null,
                        "modifiedDateTime": "0001-01-01T00:00:00",
                        "modifiedBy": null,
                        "deletedDateTime": null,
                        "deletedBy": null,
                        "deleted": false
                    },
                    "brandCount": 57
                },
                {
                    "brandEntity": {
                        "id": 1771,
                        "name": "club house",
                        "origName": "",
                        "hasName": true,
                        "createdDateTime": "0001-01-01T00:00:00",
                        "createdBy": null,
                        "modifiedDateTime": "0001-01-01T00:00:00",
                        "modifiedBy": null,
                        "deletedDateTime": null,
                        "deletedBy": null,
                        "deleted": false
                    },
                    "brandCount": 55
                }
            ],
            "reportNutritionFactEntities": null,
            "productCount": 14300,
            "verification": {
                "numVerified": 7888,
                "numPredicted": null
            },
            "atwaterTestResult": null*/
                }
            </PageContainer>
        </div>
    )
}

export default Store_report