import { useEffect, useState, useReducer } from "react";
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
import { GetAllStores } from "../../../api/services/StoreService.js";
import { GetAllCategories } from "../../../api/services/CategoryService";
import { GetAllSources } from "../../../api/services/SourceService.js";
import { GetAllSubcategories } from "../../../api/services/SubcategoryService";
import {
    AdvancedSearchSection,
    AddNutrientButton,
    NutrientFiltersGrid,
    SearchButton,
    FileUploadButton,
    FileUploadInput,
    FileUploadContainer,
    FilterCollapsibleSummary,
    FilterStyles,
    CategorySearchStyle
} from "./styles.js"
import {TextListInput} from "../../../components/inputs/TextListInput/index.jsx";
import CheckBoxGroup from "../../../components/inputs/CheckBoxGroup/index.jsx";
import {MultiSelectDropdownTree, getDropDownTreeIndices} from "../../../components/inputs/MultiSelectDropdownTree/index.jsx";
import DateRangePicker from "../../../components/inputs/DateRangePicker/index.jsx";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as d3 from "d3"

const nutrientNames = nutrientsList.map(nutrient => nutrient.name);

const helpTxt = {
    "Name": `A list of product names to search. Make sure each product is seperated by a newline. If you upload a .txt file, make sure each product name is seperated by a new line. If you upload
a CSV file, make sure the product names are under a column called 'Product Name'`,
    "Sources": `The sources for where the data is retrieved (Scrape or FLIP)`,
    "NFT": `Whether to only show products with NFTs (Nutrition Facts Table)`,
    "Stores": `The stores for where the products come from`,
    "DateRange": `The date range of when the data for the products are retrieved from`,
    "GeoLocations": `The geographic location of the products`,
    "Categories": `Filters the products based on their food group`
}

const Advanced_search = () => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [searchCategories, setSearchCategories] = useState({
        "Name": {
            title: "Name",
            options: [],
            multiple: false,
            loading: true
        },
        "Brand": {
            title: "Brand",
            options: [],
            multiple: false,
            loading: true
        },            
        "Category": {
            title: "Category",
            options: [],
            multiple: false,
            loading: true
        },
        "Categories": {
            title: "Categories",
            options: [],
            multiple: false,
            loading: true
        },            
        "Subcategory": {
            title: "Subcategory",
            options: [],
            multiple: false,
            loading: true
        },            
        "Ingredients": {
            title: "Contains Ingredient(s)",
            options: [],
            multiple: false,
            loading: true
        },
        "Stores": {
            title: "Store",
            options: [],
            multiple: false,
            loading: true
        },
        "Sources": {
            title: "Sources",
            options: [],
            multiple: false,
            loading: true
        },
        "GeoLocations": {
            title: "GeoLocations",
            options: [],
            multiple: false,
            loading: true
        }
    });
    const [searchInputs, setSearchInputs] = useState(
        {
            Names: {
                value: []
            },
            Categories: {
                value: new Set()
            },
            SubCategories: {
                value: new Set()
            },
            Sources: {
                value: new Set()
            },
            ShowNFT: {
                value: false
            },
            Stores: {
                value: new Set()
            },
            StartDate: {
                value: ""
            },
            EndDate: {
                value: ""
            },
            GeoLocations: {
                value: new Set()
            },

            // TODO: Remove the below names once the frontend is updated with
            //  the new advanced search API call
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

    // used to quickly select all the values in a dropdown
    const [dropdownValues, setDropdownValues] = useState({
        Stores: [],
        GeoLocations: [],
        Categories: []
    });

    const [appliedSearchFilters, setAppliedSearchFilters] = useState([]);
    const [appliedNutrientValueFilters, setAppliedNutrientValueFilters] = useState([]);

    const [nutrientValueFilters, setNutrientValueFilters] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsIsLoading, setSearchResultsIsLoading] = useState(false);
    const [totalTableRows, setTotalTableRows] = useState(0);
    
    const [advancedSearchCancel, setAdvancedSearchCancel] = useState({ fn: () => {} });
    
    const [productTextBoxContent, setProductTextBoxContent] = useState("");

    // product names that come from Txt or CSV files
    const [attachedProductFiles, setAttachedProductFiles] = useState([]);
    const [attachedProducts, setAttachedProducts] = useState([]);

    let optionsLoaded = false;

    // static options for the filters
    const nftOptions = [{name: "Show only products with Nutrition Facts Table", value: "NFT"}];

    // File inputs for uploading product names as CSV or Txt files
    const csvComponent = (
        <FileUploadContainer>
            <FileUploadInput id="csvFileUpload" onChange={readCSVFile} type="file" accept=".csv"></FileUploadInput>
            <FileUploadButton for="csvFileUpload">Load CSV File</FileUploadButton>
        </FileUploadContainer>
    );

    const txtComponent = (
        <FileUploadContainer>
            <FileUploadInput id="txtFileUpload" onChange={readTxtFile} type="file" accept=".txt"></FileUploadInput>
            <FileUploadButton for="txtFileUpload">Load TXT file</FileUploadButton>
        </FileUploadContainer>
    );

    const productNameInputAdditionalFeats = [
        {component: csvComponent},
        {component: txtComponent}
    ];

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
    
    function readCSVFile(event) {
        const files = event.target.files;
        for (const file of files) {
            const fileReader = new FileReader();

            // parse the CSV file
            fileReader.addEventListener('load', (fileLoadEvent) => {
                const fileTxt = fileLoadEvent.target.result;
                const table = d3.csvParse(fileTxt);
                
                const products = new Set();
                for (const row of table) {
                    products.add(row["Product Name"]);
                }

                // add the new product names
                attachedProductFiles.push(file.name);
                setAttachedProductFiles(attachedProductFiles);

                attachedProducts.push({fileName: file.name, products});
                setAttachedProducts(attachedProducts);
                forceUpdate();
            });

            fileReader.readAsText(file);
        }
    }

    function readTxtFile(event) {
        const files = event.target.files;
        for (const file of files) {
            const fileReader = new FileReader();

            // parse the txt in the file
            fileReader.addEventListener('load', (fileLoadEvent) => {
                const fileTxt = fileLoadEvent.target.result
                const products = new Set(fileTxt.split('\n'));

                // add the new product names
                attachedProductFiles.push(file.name);
                setAttachedProductFiles(attachedProductFiles);

                attachedProducts.push({fileName: file.name, products});
                setAttachedProducts(attachedProducts);
                forceUpdate();
            });

            fileReader.readAsText(file);
        }
    }

    function removeAttachment(attachment, attachmentInd) {
        attachedProducts.splice(attachmentInd, 1);
        setAttachedProducts(attachedProducts);

        attachedProductFiles.splice(attachmentInd, 1);
        setAttachedProductFiles(attachedProductFiles);
    }

    function onProductTextBoxChange(event) {
        setProductTextBoxContent(event.target.value);
    }

    function onStoreChange(currentNode, selectedNodes) {
        if (currentNode.allSelected !== undefined && currentNode.checked) {
            searchInputs.Stores.value = new Set(dropdownValues.Stores);
        } else if (currentNode.allSelected !== undefined) {
            searchInputs.Stores.value.clear();
        } else if (currentNode.checked) {
            searchInputs.Stores.value.add(currentNode.value);
        } else {
            searchInputs.Stores.value.delete(currentNode.value);
        }

        setSearchInputs(searchInputs);
    }

    function onGeoChange(currentNode, selectedNodes) {
        if (currentNode.allSelected !== undefined && currentNode.checked) {
            searchInputs.GeoLocations.value = new Set(dropdownValues.GeoLocations);
        } else if (currentNode.allSelected !== undefined) {
            searchInputs.GeoLocations.value.clear();
        } else if (currentNode.checked) {
            searchInputs.GeoLocations.value.add(currentNode.value);
        } else {
            searchInputs.GeoLocations.value.delete(currentNode.value);
        }

        setSearchInputs(searchInputs);
    }

    function onDateRangeChange(startDate, endDate) {
        searchInputs.StartDate.value = startDate;
        searchInputs.EndDate.value = endDate;
        setSearchInputs(searchInputs);
    }

    function onCategoryChange(currentNode, selectedNodes) {
        const isAllSelected = currentNode.allSelected !== undefined;
        const subCategoryDepth = 2;
        const categoryDepth = 1;

        // set the subcategories
        if (isAllSelected) {
            searchInputs.SubCategories.value.clear();
        } else if (currentNode._depth == subCategoryDepth && currentNode.checked) {
            searchInputs.SubCategories.value.add(currentNode.value);
        } else if (currentNode._depth == subCategoryDepth) {
            // retrieve the parent category
            const parentNodeId = currentNode._parent;
            const parentIndices = getDropDownTreeIndices(parentNodeId); 
            const parentNode = searchCategories.Categories.options[parentIndices[categoryDepth]];
            const parent = parentNode.value;

            // get all the children subcategories of the parent
            const children = parentNode.children.map((child) => child.value);

            // remove the parent and add the rest of the parent's children except for the target node that is unselected
            searchInputs.Categories.value.delete(parent);
            for (const child of children) {
                searchInputs.SubCategories.value.add(child);
            }

            searchInputs.SubCategories.value.delete(currentNode.value);
        }

        // set the categories
        if (isAllSelected && currentNode.checked) {
            searchInputs.Categories.value = new Set(dropdownValues.Categories);
        } else if (isAllSelected) {
            searchInputs.Categories.value.clear();
        } else if (currentNode._depth == categoryDepth) {
            // retrieve the children subcategories for the category
            const children = currentNode._children.map((nodeId) => {
                const nodeIndices = getDropDownTreeIndices(nodeId);
                return searchCategories.Categories.options[nodeIndices[categoryDepth]].children[nodeIndices[subCategoryDepth]].value;
            });

            for (const child of children) {
                searchInputs.SubCategories.value.delete(child);
            }

            if (currentNode.checked) {
                searchInputs.Categories.value.add(currentNode.value);
            } else {
                searchInputs.Categories.value.delete(currentNode.value);
            }
        }

        setSearchInputs(searchInputs);
    }

    function onNFTChange(nftOption, ind) {
        searchInputs.ShowNFT.value = !searchInputs.ShowNFT.value;
        setSearchInputs(searchInputs);
    }

    function onSourceChange(sourceOption, ind) {
        const sourceValue = sourceOption.value;
        if (!searchInputs.Sources.value.has(sourceValue)) {
            searchInputs.Sources.value.add(sourceValue);
            setSearchInputs(searchInputs);
        } else {
            searchInputs.Sources.value.delete(sourceValue);
        }

        setSearchInputs(searchInputs);
    }

    const onSearchButtonClick = async () => {
        if (JSON.stringify(appliedSearchFilters) === JSON.stringify(searchInputs)) return;
        getSearchResultsPage(searchInputs, 1, 10, nutrientValueFilters)
            .then((rows) => {
                // Adjust here to extract and structure data correctly
                const formattedResults = rows.map(row => ({
                    ...row._source,
                    productEntity: {
                        categoryEntity: {
                            name: row._source.categories?.[0]?.name || 'No category'
                        },
                        subCategoryEntity: {
                            name: row._source.subcategories?.[0]?.name || 'No subcategory'
                        },
                        ingredientEn: row._source.ingredient_en
                    }
                }));
                setSearchResults(formattedResults);
                setAppliedSearchFilters(searchInputs);
                setAppliedNutrientValueFilters(nutrientValueFilters);
                if (rows != null) setTotalTableRows(rows)
            })
            .catch((e) => {
                console.error(e);
                setTotalTableRows(0);
            });
    };
    

    const searchResultsGetRowHeight = () => {
        return "auto";
    }



    const getSearchResultsPage = async (searchFilters, pageNumber, pageSize) => {
        // Log initial state
        console.log("Starting search with filters:", searchFilters);
    
        // Prepare the list of product names from textbox and files
        const productNames = new Set([...productTextBoxContent.split("\n"), ...attachedProducts.flatMap(fileData => fileData.products)]);
        console.log("Compiled product names for search:", Array.from(productNames));
    
        // Construct the Elasticsearch query
        const buildFilters = (filters) => {
            const filterClauses = [];
            if (filters.categories && filters.categories.length > 0) {
                filterClauses.push({
                    nested: {
                        path: "categories",
                        query: { terms: { "categories.name": filters.categories } }
                    }
                });
            }
            if (filters.subcategories && filters.subcategories.length > 0) {
                filterClauses.push({
                    nested: {
                        path: "subcategories",
                        query: { terms: { "subcategories.name": filters.subcategories } }
                    }
                });
            }
            if (filters.stores && filters.stores.length > 0) {
                filterClauses.push({
                    nested: {
                        path: "stores",
                        query: { terms: { "stores.name": filters.stores } }
                    }
                });
            }
            return filterClauses;
        };
        
        const queryBody = {
            from: (pageNumber - 1) * pageSize,
            size: pageSize,
            query: {
                bool: {
                    must: [
                        { terms: { "site_name.keyword": Array.from(productNames) } }
                    ],
                    filter: buildFilters(searchFilters)
                }
            }
        };
        
        console.log("Elasticsearch filters applied:", buildFilters(searchFilters));
        console.log("Elasticsearch query body:", JSON.stringify(queryBody, null, 2));
    
    
        // Make the Elasticsearch request
        try {
            const search_url = `${process.env.REACT_APP_ELASTIC_URL}_search/`;
            console.log(`Search url: ${search_url}`);
            const response = await fetch(search_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryBody)
            });
    
            const data = await response.json(); // Parse the JSON response
            if (response.ok) {
                console.log("Search successful, hits:", data.hits.hits);
                setSearchResults(data.hits.hits.map(hit => hit._source)); // Process and set the results
                return data.hits.total.value; // Return the total count for pagination
            } else {
                console.error('Search failed:', data);
                setSearchResults([]);
                return 0;
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            return 0;
        }
    };
    
    useEffect(() => {
        if (!optionsLoaded) {
            optionsLoaded = true;
        }
    }, []);

    return (
        <PageContainer>
            <AdvancedSearchSection>
                <Typography variant="h4">Metadata</Typography>
                <AdvancedSearchSection>
                    <TextListInput title="Product Names" category={searchCategories["Name"].options } placeholder={"List of Product Names (each seperated by a newline)..."} 
                        additionalOptions={productNameInputAdditionalFeats} inputWidth="100%" helpTxt={helpTxt['Name']} attachments={attachedProductFiles} onAttachmentDelete={removeAttachment}
                        onTextChange={onProductTextBoxChange}></TextListInput>
                    <Accordion>
                        <FilterCollapsibleSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Additional Filters
                        </FilterCollapsibleSummary>
                        <AccordionDetails>
                            <CheckBoxGroup title="Source" items={searchCategories['Sources'].options} sx={FilterStyles} helpTxt={helpTxt['Sources']} onChecked={onSourceChange}></CheckBoxGroup>
                            <CheckBoxGroup title="Nutrition Facts Table (NFT)" items={nftOptions} sx={FilterStyles} helpTxt={helpTxt['NFT']} onChecked={onNFTChange}></CheckBoxGroup>
                            <MultiSelectDropdownTree title="Stores" items={searchCategories['Stores'].options} onChange={onStoreChange} sx={FilterStyles} 
                                helpTxt={helpTxt['Stores']} texts={{placeholder: 'Stores...'}}></MultiSelectDropdownTree>
                            <DateRangePicker title="Date Range" onChange={onDateRangeChange} sx={FilterStyles} helpTxt={helpTxt['DateRange']}></DateRangePicker>
                            <MultiSelectDropdownTree title="Geographic Locations" items={searchCategories.GeoLocations.options} onChange={onGeoChange} sx={FilterStyles} 
                                helpTxt={helpTxt['GeoLocations']} texts={{placeholder: 'Geographic Locations...'}}></MultiSelectDropdownTree>
                        </AccordionDetails>
                    </Accordion>
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