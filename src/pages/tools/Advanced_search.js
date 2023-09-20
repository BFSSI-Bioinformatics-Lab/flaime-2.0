import { useEffect, useState } from "react";
import ApiInstance from "../../api/Api";
import AdvancedSearchFilter from "../../components/SearchFilter";
import PageContainer from "../../components/page/PageContainer";

const Advanced_search = () => {

    const [searchCategories, setSearchCategories] = useState([]);
    const [searchInputs, setSearchInputs] = useState([]);

    const getProductNames = async () => {
        return ["Apples", "Oranges", "Dumplings"];
        const request = `StoreProductService/GetStoreProductsAsync?storeid=-1&scrapebatchid=-1&mostrecentonly=true`
        const products = await ApiInstance.get(request);
        console.log(products);
        return products;
    }

    const getBrandNames = async () => {
        return ["Presidents Choice", "No Name", "VOILA", "Nestle"];
    }

    const getCategoryNames = async () => {
        return ["Rice", "Fruits and vegetables", "Bakery Products", "Other"];
    }

    const getSubcategoryNames = async () => {
        return ["Rice", "Fruits and vegetables", "Bakery Products", "Other"];
    }

    const getIngredientNames = async () => {
        return ["Sugar", "Water", "Salt", "Milk", "Apples"]
    }

    const getCategoryOptions = async () => {
        const productNames =  await getProductNames();
        const brandNames = await getBrandNames();
        const categoryNames = await getCategoryNames();
        const subcategoryNames = await getSubcategoryNames();
        const ingredientNames = await getIngredientNames();
        
        setSearchCategories([
            {
                title: "Name",
                options: productNames
            },
            {
                title: "Brand",
                options: brandNames
            },            
            {
                title: "Category",
                options: categoryNames
            },            
            {
                title: "Subcategory",
                options: subcategoryNames
            },            
            {
                title: "Contains Ingredient(s)",
                options: ingredientNames,
                multiple: true
            }, 
        ])
    }

    const onSearchChange = (filter, e, newInput) => {
        console.log(filter);
        console.log(e);
        console.log(newInput);
        setSearchInputs({...searchInputs, [filter]: newInput})
    }

    useEffect(() => {
        getCategoryOptions();
        setSearchInputs({
            Name: "",
            Brand: "",
            Category: "",
            Subcategory: "",
            "Contains Ingredient(s)": ""
        })
    }, []);

    return (
        <PageContainer>
            <AdvancedSearchFilter categories={searchCategories} onInputChange={onSearchChange}/>
            <div>
                Name={searchInputs.Name}
                Brand={searchInputs.Brand}
                Category={searchInputs.Category}
                Subcategory={searchInputs.Subcategory}
                Ingredients={searchInputs["Contains Ingredient(s)"]}

            </div>
        </PageContainer>
    )
}

export default Advanced_search;