import React, { useState, useEffect } from 'react';

import BarChart from '../../../components/diagrams/BarChart';
import CategorySelector from '../../../components/inputs/CategorySelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import StoreSelector from '../../../components/inputs/StoreSelector';


const FOPReport = () => {
    const [selectedSource, setSelectedSource] = useState([]);
    const [selectedStore, setSelectedStore] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    return (
        <div>
            <h1>FOP Report</h1>
            {loading && <p>Loading...</p>}
            <SourceSelector onSelect={selectedValue => setSelectedSource(selectedValue)}/>
            <StoreSelector onSelect={selectedValue => setSelectedStore(selectedValue)}/>
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
