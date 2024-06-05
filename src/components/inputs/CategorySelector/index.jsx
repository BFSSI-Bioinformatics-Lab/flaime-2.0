import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorySelector = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await axios.get('/api/GetAllCategories');
    setCategories(response.data.map(category => ({
      ...category,
      subcategories: [],
      isExpanded: false
    })));
  };

  const handleCategorySelect = (categoryId) => {
    const newSelectedCategories = new Set(selectedCategories);
    if (newSelectedCategories.has(categoryId)) {
      newSelectedCategories.delete(categoryId);
    } else {
      newSelectedCategories.add(categoryId);
    }
    setSelectedCategories(newSelectedCategories);
  };

  const toggleExpand = async (category) => {
    if (!category.subcategories.length) {
      const response = await axios.get(`/api/GetAllSubcategories?categoryId=${category.id}`);
      category.subcategories = response.data;
    }
    category.isExpanded = !category.isExpanded;
    setCategories([...categories]);
  };

  return (
    <div style={{ height: '300px', overflowY: 'auto' }}>
      {categories.map(category => (
        <div key={category.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedCategories.has(category.id)}
              onChange={() => handleCategorySelect(category.id)}
            />
            {category.name}
          </label>
          <button onClick={() => toggleExpand(category)}>
            {category.isExpanded ? '-' : '+'}
          </button>
          {category.isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {category.subcategories.map(sub => (
                <label key={sub.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(sub.id)}
                    onChange={() => handleCategorySelect(sub.id)}
                  />
                  {sub.name}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategorySelector;
