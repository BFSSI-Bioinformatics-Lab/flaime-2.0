import React, { useState, useEffect } from 'react';

import SelectInput from '../../../components/inputs/SelectInput';
import BarChart from '../../../components/diagrams/BarChart';
import CategorySelector from '../../../components/inputs/CategorySelector';

import { GetAllStoresControlled } from '../../../api/services/StoreService';


const FOPReport = () => {
    const [Stores, setStores] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cancelSearch, setCancelSearch] = useState(() => () => {});

    // Function to fetch all Stores
    const getAllStores = async () => {
        cancelSearch();
        try {
            const [GetAllStores, GetAllStoresCancel] = GetAllStoresControlled();
            setCancelSearch(() => GetAllStoresCancel);
            const data = await GetAllStores();
            setStores(data.error ? [] : data.stores.map(source => ({ label: source.name, value: source.id })));
        } catch (e) {
            console.error('Error fetching Stores', e);
            if (e.code !== "ERR_CANCELED") {
                setStores([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // useEffect to fetch Stores
    useEffect(() => {
        setLoading(true);
        getAllStores();
        return () => cancelSearch();
    }, []);
    
    return (
        <div>
            <h1>FOP Report</h1>
            {loading && <p>Loading...</p>}
            <SelectInput 
                options={Stores} 
                value={selectedSource} 
                onChange={e => setSelectedSource(e.target.value)}
                label="Select a Source"
            />
            {selectedSource && (
                <CategorySelector 
                    onChange={setSelectedCategory}
                />
            )}
            {reportData && (
                <BarChart
                    data={reportData}
                    chartTitle={"FOP bar chart TODO change this title"}
                />
            )}
        </div>
    );
};

export default FOPReport;
