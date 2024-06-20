// components/inputs/StoreSelector/index.js
import React from 'react';
import useStores from './useStores';
import SelectInput from '../SelectInput';
import { Typography } from '@mui/material';

const StoreSelector = ({ onSelect }) => {
    const { stores, loading } = useStores();
    const [selectedStore, setSelectedStore] = React.useState('');

    const storesWithDefault = [
        { label: 'Use all stores', value: '-1' },
        ...stores
    ];

    const handleSelectionChange = (value) => {
        setSelectedStore(value);
        if (onSelect) {
            onSelect(value);
        }
    };

    return (
        <div style={{ maxWidth: '320px', minWidth: '280px' }}>
            <Typography variant="h5" style={{ padding: '10px' }}>Select a Store</Typography>
            {loading ? <p>Loading...</p> : (
                <SelectInput
                    options={storesWithDefault}
                    value={selectedStore}
                    onChange={handleSelectionChange}
                    label="Select a Store"
                    InputProps={{ style: { minWidth: '280px', overflow: 'hidden' } }}
                />
            )}
        </div>
    );
};

export default StoreSelector;
