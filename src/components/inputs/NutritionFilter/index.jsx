import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import useNutrients from './useNutrients';

const NutritionFilter = ({ value, onChange }) => {
    const { nutrients, loading } = useNutrients();


    const handleNutrientChange = (event) => {
        onChange({ ...value, nutrient: event.target.value });
    };

    const handleAmountChange = (field) => (event) => {
        onChange({ ...value, [field]: event.target.value });
    };

    return (
        <div>
            <h2>Nutrient Filter</h2>
            <p>Select a nutrient to filter by and a minimum and/or maximum value. Note that the unit will be as stored in the database (g/mg/ug/IU)</p>
            <TextField
                select
                label="Nutrient"
                value={value.nutrient}
                onChange={handleNutrientChange}
                fullWidth
            >
                {loading ? (
                    <MenuItem value="">Loading...</MenuItem>
                ) : (
                    nutrients.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))
                )}
            </TextField>
            <TextField
                label="Minimum Amount (arbitrary units)"
                type="number"
                value={value.minAmount}
                onChange={handleAmountChange('minAmount')}
                fullWidth
            />
            <TextField
                label="Maximum Amount (arbitrary units)"
                type="number"
                value={value.maxAmount}
                onChange={handleAmountChange('maxAmount')}
                fullWidth
            />
        </div>
    );
};

export default NutritionFilter;
    