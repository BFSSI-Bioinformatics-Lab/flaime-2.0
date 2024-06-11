// components/inputs/SourceSelector/index.js
import React from 'react';
import useSources from './useSources';
import SelectInput from '../SelectInput';

const SourceSelector = ({ onSelect }) => {
    const { sources, loading } = useSources();
    const [selectedSource, setSelectedSource] = React.useState('');

    const sourcesWithDefault = [
        { label: 'Use all sources', value: '-1' },
        ...sources
    ];

    const handleSelectionChange = (value) => {
        setSelectedSource(value);
        if (onSelect) {
            onSelect(value);
        }
    };

    return (
        <div>
            <h1>Select a Source</h1>
            {loading ? <p>Loading...</p> : (
                <SelectInput
                    options={sourcesWithDefault}
                    value={selectedSource}
                    onChange={handleSelectionChange}
                    label="Select a Source"
                />
            )}
        </div>
    );
};

export default SourceSelector;
