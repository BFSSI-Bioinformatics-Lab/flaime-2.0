// components/inputs/SourceSelector/index.js
import React from 'react';
import useSources from './useSources';
import SelectInput from '../SelectInput';
import { Typography } from '@mui/material';

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
        <div style={{ maxWidth: '320px', minWidth: '280px' }}>
            <Typography variant="h5" style={{ padding: '10px' }}>Select a Source</Typography>
            {loading ? <p>Loading...</p> : (
                <SelectInput
                    options={sourcesWithDefault}
                    value={selectedSource}
                    onChange={handleSelectionChange}
                    label="Select a Source"
                    InputProps={{ style: { minWidth: '280px', overflow: 'hidden' } }}
                />
            )}
        </div>
    );
};

export default SourceSelector;
