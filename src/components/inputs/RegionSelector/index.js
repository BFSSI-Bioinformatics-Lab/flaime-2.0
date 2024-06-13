// components/inputs/RegionSelector/index.js
import React from 'react';
import SelectInput from '../SelectInput';

const RegionSelector = ({ onSelect }) => {
    //const { regions, loading } = useRegions();
    const regions = [ "ottawa", "QC", "BC", "ON", "montreal", "vancouver" ];
    const loading = false;
    const [selectedRegion, setSelectedRegion] = React.useState('');

    const regionsWithDefault = [
        { label: 'Use all regions', value: '-1' },
        ...regions.map(region => ({ label: region, value: region }))
    ];

    const handleSelectionChange = (value) => {
        setSelectedRegion(value);
        if (onSelect) {
            onSelect(value);
        }
    };

    return (
        <div>
            <h2>Select a Region</h2>
            {loading ? <p>Loading...</p> : (
                <SelectInput
                    options={regionsWithDefault}
                    value={selectedRegion}
                    onChange={handleSelectionChange}
                    label="Select a Region"
                />
            )}
        </div>
    );
};



export default RegionSelector;
