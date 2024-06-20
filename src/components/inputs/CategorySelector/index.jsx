import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, Card, CardContent, CardHeader, Divider, Button } from '@mui/material';
import { GetAllCategories, GetAllSubcategories } from '../../../api/services/CategoryService';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';


const categoryReducer = (state, action) => {
  console.log(`Reducer action type: ${action.type}`);
  switch (action.type) {
    case 'FETCH_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };
    case 'TOGGLE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat => {
          if (cat.id === action.payload) {
            return { ...cat, isExpanded: !cat.isExpanded };
          }
          return cat;
        }),
      };
    case 'SELECT_CATEGORY':
      console.log(`Selecting categories with payload: ${action.payload}`);
      return {
        ...state,
        selectedCategories: new Set(action.payload),
      };
    default:
      return state;
  }
};

const fetchData = async (dispatch, categoryScheme) => {
  try {
    console.log(`Fetching categories and subcategories for scheme: ${categoryScheme}...`);

    const categoriesData = await GetAllCategories();
    const subcategoriesData = await GetAllSubcategories();

    // console.log(`Categories fetched: ${JSON.stringify(categoriesData.categories)}`);
    // console.log(`Subcategories fetched: ${JSON.stringify(subcategoriesData.subcategories)}`);

    // TODO: uncomment this once the schemes are loaded properly
    const filteredCategories = categoriesData.categories;
    // const filteredCategories = categoriesData.categories.filter(cat => cat.scheme === categoryScheme);
    // console.log(`Filtered categories based on scheme '${categoryScheme}': ${JSON.stringify(filteredCategories)}`);

    const categoriesWithSubcategories = filteredCategories.map(cat => ({
      ...cat,
      subcategories: subcategoriesData.subcategories.filter(sub => sub.categoryEntity.id === cat.id),
      isExpanded: false,
    }));

    console.log("Categories with subcategories loaded:", categoriesWithSubcategories);
    dispatch({ type: 'FETCH_CATEGORIES', payload: categoriesWithSubcategories });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    // TODO: dispatch an error state or show a message
  }
};

const CategorySelector = ({ onChange }) => {
  const [categoryScheme, setCategoryScheme] = useState('RA');

  const [state, dispatch] = useReducer(categoryReducer, { categories: [], selectedCategories: new Set() });

  const getSelectionState = useCallback((category) => {
    const subcategoryIds = category.subcategories.map(sub => sub.id);
    const selectedSubcategoryCount = subcategoryIds.filter(id => state.selectedCategories.has(id)).length;
    return selectedSubcategoryCount === 0 ? 'none' :
           selectedSubcategoryCount === subcategoryIds.length ? 'full' : 'partial';
  }, [state.selectedCategories]);

  useEffect(() => {
    fetchData(dispatch, categoryScheme);
  }, [dispatch, categoryScheme]);

  const handleCategorySchemeChange = (event) => {
    setCategoryScheme(event.target.value);
  };
  
  const handleCategorySelect = (category, isSubcategory = false) => {
    const newSelectedCategories = new Set(state.selectedCategories);

    if (!isSubcategory) {
      if (category.subcategories.every(sub => newSelectedCategories.has(sub.id))) {
        category.subcategories.forEach(sub => newSelectedCategories.delete(sub.id));
      } else {
        category.subcategories.forEach(sub => newSelectedCategories.add(sub.id));
      }
    } else {
      if (newSelectedCategories.has(category.id)) {
        newSelectedCategories.delete(category.id);
      } else {
        newSelectedCategories.add(category.id);
      }
    }

    dispatch({
      type: 'SELECT_CATEGORY',
      payload: Array.from(newSelectedCategories),
    });
    onChange(Array.from(newSelectedCategories));
  }

  const toggleExpand = (category) => {
    console.log(`Toggling expansion for category: ${category.id}`);
    dispatch({ type: 'TOGGLE_CATEGORY', payload: category.id });
  };
  
  return (
    <Card variant="outlined">
      <CardHeader title="Select Categories" />
      <CardContent style={{ paddingTop: '0' }}>
        <p>Select the categories to filter by. Top level categories can be expanded to sub-categories. Note that the switch between RA and Sodium categories is currently non-functional.</p>
        <Divider style={{ width: '300px', margin: ' 5px auto' }}/>
        <FormControl>
          <RadioGroup row value={categoryScheme} onChange={handleCategorySchemeChange} name="categoryScheme">
            <FormControlLabel value="reference amount" control={<Radio />} label="Reference Amount" />
            <FormControlLabel value="Sodium" control={<Radio />} label="Sodium" />
            {/* <FormControlLabel value="nielsen" control={<Radio />} label="Nielsen" /> */}
          </RadioGroup>
        </FormControl>
        <Divider />
        <div style={{ height: '300px', overflowY: 'auto' }}>
          {state.categories.map(category => (
            <div key={category.id} style={{ margin: '5px 0' }}>
              <IndeterminateCheckbox
                id={`category-${category.id}`}
                checked={getSelectionState(category) === 'full'}
                indeterminate={getSelectionState(category) === 'partial'}
                onChange={() => handleCategorySelect(category)}
                label={`${category.scheme} `}
              />
              <span style={{ fontSize: '15px', margin: '0 4px'}}>
              {category.name}
              </span>
              
              <Button variant='outlined' size='small' style={{ marginLeft: '5px', minWidth: '22px', padding: '0' }}
                onClick={() => toggleExpand(category)}
                aria-label={category.isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
              >
                {category.isExpanded ? '-' : '+'}
              </Button>
              {category.isExpanded && (
                <div style={{ marginLeft: '20px' }}>
                  {category.subcategories.map(sub => (
                    <div key={sub.id} style={{ display: 'block' }}>
                      <IndeterminateCheckbox
                        id={`subcategory-${sub.id}`}
                        checked={state.selectedCategories.has(sub.id)}
                        onChange={() => handleCategorySelect(sub, true)}
                        label={sub.name}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySelector;
