import React, { useEffect, useReducer, useCallback } from 'react';
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

const fetchData = async (dispatch) => {
  try {
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
  } catch (error) {
    console.error("Failed to fetch data:", error);
    // TODO: dispatch an error state or show a message
  }
};

const CategorySelector = ({ onChange }) => {
  const [state, dispatch] = useReducer(categoryReducer, { categories: [], selectedCategories: new Set() });

  const getSelectionState = useCallback((category) => {
    const subcategoryIds = category.subcategories.map(sub => sub.id);
    const selectedSubcategoryCount = subcategoryIds.filter(id => state.selectedCategories.has(id)).length;
    return selectedSubcategoryCount === 0 ? 'none' :
           selectedSubcategoryCount === subcategoryIds.length ? 'full' : 'partial';
  }, [state.selectedCategories]);

  useEffect(() => {
    fetchData(dispatch);
  }, [dispatch]);

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
            checked={getSelectionState(category) === 'full'}
            indeterminate={getSelectionState(category) === 'partial'}
            onChange={() => handleCategorySelect(category)}
            label={category.name}
          />
          <button
            onClick={() => toggleExpand(category)}
            aria-label={category.isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
          >
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
