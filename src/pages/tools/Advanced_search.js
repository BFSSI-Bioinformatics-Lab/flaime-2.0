import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ApiInstance from "../../api/Api";
import AdvancedSearchFilter from "../../components/inputs/SearchFilter/SearchFilter";
import PageContainer from "../../components/page/PageContainer";
import TempTable from "../../components/table/TempTable";
import InputPercentRange from "../../components/inputs/InputPercentRange";
import InputRangeField from "../../components/inputs/InputRangeField";
import { nutrientsList } from "../../components/constants/data/nutrients";
import { Autocomplete, TextField, Typography, Grid, FormLabel, Button, Divider, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { formatIngredients } from "../../components/tools/formatting";
import { GetBrandsByPagination } from "../../api/BrandService";
import { 
    GetAllStoreProductsByPagination, 
    AdvanceSearchStoreProducts
} from "../../api/StoreProductService";
import { GetAllCategories } from "../../api/CategoryService";
import { GetAllSubcategories } from "../../api/SubcategoryService";

const AdvancedSearchSection = styled(Box)(({theme}) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
}));

const nutrientNames = nutrientsList.map(nutrient => nutrient.name);

const Advanced_search = () => {

    const [searchCategories, setSearchCategories] = useState([]);
    const [searchInputs, setSearchInputs] = useState(
        {
            Name: {
                id: "productSiteName",
                value: ""
            },
            Brand: {
                id: "brandName",
                value: ""
            },
            Category: {
                id: "categoryName",
                value: ""
            },
            Subcategory: {
                id: "subcategoryName",
                value: ""
            },
            "Contains Ingredient(s)": {
                id: "ingredientEn", 
                value: ""
            }
        }
    );
    const [appliedSearchFilters, setAppliedSearchFilters] = useState([]);
    const [appliedNutrientValueFilters, setAppliedNutrientValueFilters] = useState([]);

    const [nutrientValueFilters, setNutrientValueFilters] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsIsLoading, setSearchResultsIsLoading] = useState(false);
    const [totalTableRows, setTotalTableRows] = useState(0);

    const searchTableColumns = [
        { 
            field: 'id', 
            headerName: 'Id', 
            flex: 1,
            minWidth: 130,
            renderCell: (params) => 
            <Link to={`/tools/product-browser/${params.row.id}`}>{params.row.id}</Link>,
        },
        { 
            field: 'storeProductCode', 
            headerName: 'Code', 
            minWidth: 120,
            flex: 2 
        },
        { 
            field: 'siteName', 
            headerName: 'Name', 
            minWidth: 150,
            flex: 3 
        },
        { 
            field: 'rawBrand', 
            headerName: 'Brand', 
            minWidth: 150,
            flex: 2 
        },
        {
            field: "categoryPredictionEntityId",
            headerName: "Category",
            minWidth: 150,
            flex: 3,
            renderCell: (params) => params.row.productEntity.categoryEntity ? params.row.productEntity.categoryEntity.name : null
        },
        {
            field: "subcategoryPredictionEntityId",
            headerName: "Subcategory",
            minWidth: 160,
            flex: 3,
            renderCell: (params) => params.row.productEntity.subCategoryEntity ? params.row.productEntity.subCategoryEntity.name : null
        },
        { 
            field: 'ingredientEn', 
            headerName: 'Ingredients', 
            minWidth: 350,
            flex: 5,
            renderCell: (params) => params.row.productEntity && params.row.productEntity.ingredientEn ? formatIngredients(params.row.productEntity.ingredientEn) : null
        }
      ];
      
    const getProductNames = async () => {
        const products = await GetAllStoreProductsByPagination({ pageNumber: 1, pageSize: 25 });

        return products.error ? [] : products.products.map((product) => product.siteName);
    }

    const getBrands = async () => {
        const brands = await GetBrandsByPagination({ pageNumber: 1, pageSize: 25 });
        return brands.error ? [] : brands.brands.map(brand => brand.name);
    }

    const getCategories = async () => {
        const categories = await GetAllCategories();
        return categories.error ? [] : categories.categories.map(category => category.name);
    }

    const getSubcategories = async () => {
        const categories = await GetAllSubcategories();
        return categories.error ? [] : categories.subcategories.map(category => category.name);
    }

    const getIngredients = async () => {
        return ["Sugar", "Water", "Salt", "Milk", "Apples"]
    }

    const getCategoryOptions = async () => {
        Promise.all([
            getProductNames(),
            getBrands(),
            getCategories(),
            getSubcategories(),
            getIngredients()
        ])
        .then(([products, brands, categories, subcategories, ingredients]) => {
            setSearchCategories([
                {
                    title: "Name",
                    options: products
                },
                {
                    title: "Brand",
                    options: brands
                },            
                {
                    title: "Category",
                    options: categories
                },            
                {
                    title: "Subcategory",
                    options: subcategories
                },            
                {
                    title: "Contains Ingredient(s)",
                    options: ingredients,
                    multiple: true
                }, 
            ])
        })
    }

    const addNewNutrientDailyValueFilter = () => {
        setNutrientValueFilters(
            [
                ...nutrientValueFilters, 
                {
                    nutrient: "SODIUM",
                    min: 0,
                    max: 100
                }
            ]
        )
    }

    const onDailyValuePercentageChange = (index, percentRange) => {
        setNutrientValueFilters(
            nutrientValueFilters.toSpliced(index, 1, 
                { 
                    ...nutrientValueFilters[index], 
                    min: percentRange[0],
                    max: percentRange[1]
                }
            )
        )  
    }

    const onNutrientNameChange = (index, name) => {
        setNutrientValueFilters(
            nutrientValueFilters.toSpliced(index, 1, 
                { 
                    ...nutrientValueFilters[index], 
                    nutrient: name
                }
            )
        )  
    }

    const onSearchFilterChange = (filter, e, newInput) => {
        setSearchInputs({...searchInputs, [filter]: { ...searchInputs[filter], value: newInput} })
    }

    const onNutrientDeleteButtonClick = (index) => {
        setNutrientValueFilters(nutrientValueFilters.filter((n, i) => i !== index));
    }

    const onSearchButtonClick = useCallback(async () => {
        if (appliedSearchFilters === searchInputs) return;

        setSearchResultsIsLoading(true);
        getSearchResultsPage(searchInputs, 10, 1, nutrientValueFilters)
            .then((rows) => {
                setAppliedSearchFilters(searchInputs);
                setAppliedNutrientValueFilters(nutrientValueFilters);
                setTotalTableRows(rows)
            })
            .catch((e) => {
                setTotalTableRows(0)
            })
            .finally(() => setSearchResultsIsLoading(false));
            
    }, [nutrientValueFilters, searchInputs]);

    const searchResultsGetRowHeight = () => {
        return "auto";
    }

    const getSearchResultsPage = async (searchFilters, pageSize, pageNumber, nutrients) => {
        const params = Object.fromEntries([
            ["pageNumber", pageNumber],
            ["pageSize", pageSize],
            ["includeDetails", true],
            ["nutrientName", nutrients.map(ntr => ntr.nutrient)],
            ["nutrientRange", nutrients.map(ntr => [ntr.min / 100,ntr.max])],
                ...Object.values(searchFilters).map(filter => 
            ([filter.id, filter.value])
        )]);
        /*if (nutrients.length > 0) {
            params["nutrientName"] = nutrients[0].nutrient;
        }  */     
        console.log(params);
        const results = await AdvanceSearchStoreProducts(params);
        console.log(results);
        if (results.error) {
            setSearchResults([]);
            return 0;
        } else {
           /* if (nutrients.length > 0) {
                results.products = results.products.filter(product => {
                    const productNutrientNames = product.storeProductNutritionFactEntities.map(
                        n => n.nutrientEntity.name
                    );
                    return nutrientValueFilters.every(
                        nutrient => productNutrientNames.includes(nutrient.nutrient)
                    )
                })
            }*/
            setSearchResults(results.products);
            return results.pagination.totalRowCount;
        }
    }
    
    useEffect(() => {
        const searchCategoryNames = ["Name", "Brand", "Category", "Subcategory", "Contains Ingredient(s)"];
        setSearchCategories(searchCategoryNames.map(cat => ({title: cat, options: [], multiple: cat === "Contains Ingredient(s)", loading: true})))
        getCategoryOptions();
        onSearchButtonClick();
    }, []);

    return (
        <PageContainer>
            <AdvancedSearchSection>
                <Typography variant="h4">Metadata</Typography>
                <AdvancedSearchSection>
                    <AdvancedSearchFilter categories={searchCategories} onInputChange={onSearchFilterChange}/>
                </AdvancedSearchSection>
            </AdvancedSearchSection>
            <Divider/>
            <AdvancedSearchSection>
                <Typography variant="h4">Nutrient Daily Value (DV) Filtering</Typography>
                <AdvancedSearchSection>
                    <Button 
                        color="success" 
                        variant="contained" 
                        size="large" 
                        sx={{ fontSize: 16, marginBottom: 2 }} 
                        onClick={addNewNutrientDailyValueFilter}
                    >
                        Add Nutrient (+)
                    </Button>
                    {nutrientValueFilters.map((nutrientValue, i) => 
                        (<Grid key={`nutrientDV${i}`} container spacing={3} alignItems={"center"} sx={{ paddingBottom: 2}}
                        >
                            <Grid item xs={12} md={3}>
                                <FormLabel>Nutrient</FormLabel>
                                <Autocomplete
                                    id={nutrientValue.title}
                                    size="small"
                                    options={nutrientNames}
                                    onInputChange={(e, val) => onNutrientNameChange(i, val)}
                                    value={nutrientValue.nutrient}
                                    renderInput={(params => <TextField {...params} />)}
                                    disableClearable
                                />
                            </Grid>
                            <Grid item xs={12} md={2} >
                                <InputRangeField label={"Minimum value (%)"} value={`${nutrientValue.min}%` ?? "0%"}/>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <InputRangeField label={"Maximum value (%)"} value={`${nutrientValue.max}%` ?? "100%"}/>
                            </Grid>
                            <Grid item xs={12} md={3} alignSelf={"flex-end"}>
                                <InputPercentRange 
                                    min={nutrientValue.min} 
                                    max={nutrientValue.max} 
                                    onChange={(e, value) => onDailyValuePercentageChange(i, value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Grid container justifyContent={"flex-end"}>
                                    <Button 
                                        variant="contained" 
                                        color="error" 
                                        size="large" 
                                        onClick={() => onNutrientDeleteButtonClick(i)}
                                    >
                                        Delete (-)
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>)
                    )}
                </AdvancedSearchSection>
            </AdvancedSearchSection>
            <Divider/>
            <AdvancedSearchSection>
                <Button variant="contained" color="info" size="large" sx={{ fontSize: 16 }} onClick={onSearchButtonClick} disabled={searchResultsIsLoading}>
                    Search
                </Button>
            </AdvancedSearchSection>
            <AdvancedSearchSection>
                <div>
                    <TempTable 
                        rows={searchResults} 
                        columns={searchTableColumns} 
                        onPageChange={(pageNumber, pageSize) => 
                            getSearchResultsPage(appliedSearchFilters, pageNumber, pageSize, appliedNutrientValueFilters)
                        } 
                        getRowHeight={searchResultsGetRowHeight}
                        loading={searchResultsIsLoading}
                        setLoading={setSearchResultsIsLoading}
                        pageSize={10}
                        totalRows={totalTableRows}
                        searchBar={false}
                    />
                </div>
            </AdvancedSearchSection>
        </PageContainer>
    )
}

export default Advanced_search;