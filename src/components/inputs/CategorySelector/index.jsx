import React, { useState, useEffect } from 'react';
import { GetAllCategories, GetAllSubcategories } from '../../../api/services/CategoryService';


const CategorySelector = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [subcategories, setSubCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState(new Set());

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    console.log('Selected Categories:', Array.from(selectedCategories));
  }, [selectedCategories]);

  const fetchCategories = async () => {
    try {
      const data = await GetAllCategories();
      setCategories(data.categories.map(category => ({
        ...category,
        subcategories: [],
        isExpanded: false
      })));
    } catch (error) {
      console.error('Failed to fetch categories', error);
      setCategories([]);
    }
  };
  
  const fetchSubcategories = async () => {
    try {
      const data = await GetAllSubcategories();
      setSubCategories(data.subcategories);
    } catch (error) {
      console.error('Failed to fetch subcategories', error);
      setSubCategories([]);
    }
  };

  const handleCategorySelect = (categoryId, isParent = false) => {
    const newSelectedCategories = new Set(selectedCategories);
    
    if (newSelectedCategories.has(categoryId)) {
        newSelectedCategories.delete(categoryId);
    } else {
        newSelectedCategories.add(categoryId);
    }

    if (isParent) {
        const category = categories.find(cat => cat.id === categoryId);
        if (category && category.subcategories) {
            category.subcategories.forEach(sub => {
                if (newSelectedCategories.has(categoryId)) {
                    newSelectedCategories.add(sub.id);
                } else {
                    newSelectedCategories.delete(sub.id);
                }
            });
        }
    }

    setSelectedCategories(newSelectedCategories);
};
  
  const toggleExpand = (category) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === category.id) {
        return {
          ...cat,
          isExpanded: !cat.isExpanded,
          subcategories: cat.isExpanded ? [] : subcategories.filter(sub => sub.categoryEntity.id === cat.id)
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  return (
    <div style={{ height: '300px', overflowY: 'auto' }}>
      {categories.map(category => (
        <div key={category.id}>
          <label style={{ display: 'inline' }}>
            <input
              type="checkbox"
              checked={selectedCategories.has(category.id)}
              onChange={() => handleCategorySelect(category.id, true)}
            />
            {category.name}
          </label>
          <button onClick={() => toggleExpand(category)}>
            {category.isExpanded ? '-' : '+'}
          </button>
          {category.isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {category.subcategories.map(sub => (
                <div key={sub.id} style={{ display: 'block' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(sub.id)}
                      onChange={() => handleCategorySelect(sub.id, false)}
                    />
                    {sub.name}
                  </label>
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
