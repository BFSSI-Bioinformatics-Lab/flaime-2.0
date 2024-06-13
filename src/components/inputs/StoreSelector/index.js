// components/inputs/StoreSelector/index.js
import React from 'react';
import useStores from './useStores';
import SelectInput from '../SelectInput';

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
        <div>
            <h2>Select a Store</h2>
            {loading ? <p>Loading...</p> : (
                <SelectInput
                    options={storesWithDefault}
                    value={selectedStore}
                    onChange={handleSelectionChange}
                    label="Select a Store"
                />
            )}
        </div>
    );
};

export default StoreSelector;
