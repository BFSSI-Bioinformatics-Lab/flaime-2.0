// components/inputs/SourceSelector/index.js
import React from 'react';
import useSources from './useSources';
import SelectInput from '../SelectInput';
import { Typography } from '@mui/material';

const SourceSelector = ({ onSelect, showTitle, label }) => {
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
            {showTitle && <Typography variant="h5" style={{ padding: '10px' }}>{label}</Typography>}
            {loading ? <p>Loading...</p> : (
                <SelectInput
                    options={sourcesWithDefault}
                    value={selectedSource}
                    onChange={handleSelectionChange}
                    label={label}
                    InputProps={{ style: { minWidth: '280px', overflow: 'hidden' } }}
                />
            )}
        </div>
    );
};

export default SourceSelector;
