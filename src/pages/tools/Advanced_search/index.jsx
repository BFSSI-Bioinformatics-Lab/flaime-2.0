import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdvancedSearchFilter from "../../../components/inputs/SearchFilter";
import PageContainer from "../../../components/page/PageContainer/index.jsx";
import MainTable from "../../../components/table/MainTable";
import InputPercentRange from "../../../components/inputs/InputPercentRange";
import InputRangeField from "../../../components/inputs/InputRangeField";
import { nutrientsList } from "../../../components/constants/data/nutrients";
import { Autocomplete, TextField, Typography, Grid, FormLabel, Button, Divider } from "@mui/material";
import { formatIngredients } from "../../../components/tools/formatting";
import { GetBrandsByPagination } from "../../../api/services/BrandService";
import { 
    GetAllStoreProductsByPagination, 
    AdvanceSearchStoreProductsControlled
} from "../../../api/services/StoreProductService";
import { GetAllCategories } from "../../../api/services/CategoryService";
import { GetAllSubcategories } from "../../../api/services/SubcategoryService";
import {
    AdvancedSearchSection,
    AddNutrientButton,
    NutrientFiltersGrid,
    SearchButton
} from "./styles.js"

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
    
    const [advancedSearchCancel, setAdvancedSearchCancel] = useState({ fn: () => {} });

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

    const onSearchButtonClick = async () => {
        if (appliedSearchFilters === searchInputs) return;
        getSearchResultsPage(searchInputs, 10, 1, nutrientValueFilters)
            .then((rows) => {
                setAppliedSearchFilters(searchInputs);
                setAppliedNutrientValueFilters(nutrientValueFilters);
                if (rows != null) setTotalTableRows(rows)
            })
            .catch((e) => {
                setTotalTableRows(0)
            });
            
    };

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
        advancedSearchCancel.fn();

        const [advanceSearchProductsCall, advanceSearchProductsCancel] = AdvanceSearchStoreProductsControlled();
        setAdvancedSearchCancel({ fn: advanceSearchProductsCancel });
        setSearchResultsIsLoading(true);

        try {
            const results = await advanceSearchProductsCall(params);
            setSearchResultsIsLoading(false);
            if (results.error) {
                setSearchResults([]);
                return 0;
            } else {
                setSearchResults(results.products);
                return results.pagination.totalRowCount;
            }
        } catch (e) {
            if (e.code !== "ERR_CANCELED") {
                setSearchResultsIsLoading(false);
                return 0;
            }
            return null;
        }
    }
    
    useEffect(() => {
        const searchCategoryNames = ["Name", "Brand", "Category", "Subcategory", "Contains Ingredient(s)"];
        setSearchCategories(searchCategoryNames.map(cat => ({title: cat, options: [], multiple: cat === "Contains Ingredient(s)", loading: true})))
        getCategoryOptions();

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
                    <AddNutrientButton 
                        color="success" 
                        variant="contained" 
                        size="large" 
                        onClick={addNewNutrientDailyValueFilter}
                    >
                        Add Nutrient (+)
                    </AddNutrientButton>
                    {nutrientValueFilters.map((nutrientValue, i) => 
                        (<NutrientFiltersGrid key={`nutrientDV${i}`} container spacing={3} alignItems={"center"}
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
                        </NutrientFiltersGrid>)
                    )}
                </AdvancedSearchSection>
            </AdvancedSearchSection>
            <Divider/>
            <AdvancedSearchSection>
                <SearchButton variant="contained" color="info" size="large" onClick={onSearchButtonClick}>
                    Search
                </SearchButton>
            </AdvancedSearchSection>
            <AdvancedSearchSection>
                <div>
                    <MainTable 
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