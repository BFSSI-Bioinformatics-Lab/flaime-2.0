import React, { useEffect, useReducer } from 'react';
import { GetAllCategories, GetAllSubcategories } from '../../../api/services/CategoryService';
import { IndeterminateCheckbox  } from './IndeterminateCheckbox';


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

const CategorySelector = ({ onChange }) => {
  const [state, dispatch] = useReducer(categoryReducer, { categories: [], selectedCategories: new Set() });

  const getSelectionState = (category) => {
    const subcategoryIds = category.subcategories.map(sub => sub.id);
    const selectedSubcategoryCount = subcategoryIds.filter(id => state.selectedCategories.has(id)).length;
  
    if (selectedSubcategoryCount === 0) {
      return 'none';
    } else if (selectedSubcategoryCount === subcategoryIds.length) {
      return 'full';
    } else {
      return 'partial';
    }
  }
  
  

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching categories and subcategories...");
      const categoriesData = await GetAllCategories();
      const subcategoriesData = await GetAllSubcategories();
      const categoriesWithSubcategories = categoriesData.categories.map(cat => ({
        ...cat,
        subcategories: subcategoriesData.subcategories.filter(sub => sub.categoryEntity.id === cat.id),
        isExpanded: false,
      }));
      console.log("Categories with subcategories loaded:", categoriesWithSubcategories);
      dispatch({ type: 'FETCH_CATEGORIES', payload: categoriesWithSubcategories });
    };
    fetchData();
  }, []);

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
    <div style={{ height: '300px', overflowY: 'auto' }}>
      {state.categories.map(category => (
        <div key={category.id}>
          <IndeterminateCheckbox
            id={`category-${category.id}`}
            checked={getSelectionState(category, state.selectedCategories) === 'full'}
            indeterminate={getSelectionState(category, state.selectedCategories) === 'partial'}
            onChange={() => handleCategorySelect(category)}
            label={category.name}
          />
          <button onClick={() => toggleExpand(category)}>
            {category.isExpanded ? '-' : '+'}
          </button>
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
  );
};


export default CategorySelector;
