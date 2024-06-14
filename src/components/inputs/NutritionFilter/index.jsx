import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import useNutrients from './useNutrients';

const NutritionFilter = ({ value, onChange }) => {
    const { nutrients, loading } = useNutrients();

    const handleNutrientChange = (event) => {
        onChange({ ...value, nutrient: event.target.value });
    };

    const handleAmountChange = (event) => {
        onChange({ ...value, amount: event.target.value });
    };

    return (
        <div>
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
                label="Minimum Amount (g)"
                type="number"
                value={value.amount}
                onChange={handleAmountChange}
                fullWidth
            />
        </div>
    );
};

export default NutritionFilter;
