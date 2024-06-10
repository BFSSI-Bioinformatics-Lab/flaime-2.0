// components/inputs/StoreSelector/index.js
import React from 'react';
import useStores from './useStores';
import SelectInput from '../SelectInput';

const StoreSelector = ({ onSelect }) => {
    const { stores, loading } = useStores();
    const [selectedStore, setSelectedStore] = React.useState('');


    const handleSelectionChange = (value) => {
        setSelectedStore(value);
        if (onSelect) {
            onSelect(value);
        }
    };

    return (
        <div>
            <h1>Select a Store</h1>
            {loading ? <p>Loading...</p> : (
                <SelectInput
                    options={stores}
                    value={selectedStore}
                    onChange={handleSelectionChange}
                    label="Select a Store"
                />
            )}
        </div>
    );
};

export default StoreSelector;
