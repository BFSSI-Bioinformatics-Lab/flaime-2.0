import React, { useState, useEffect } from 'react';

import SelectInput from '../../../components/inputs/SelectInput';
import BarChart from '../../../components/diagrams/BarChart';
import CategorySelector from '../../../components/inputs/CategorySelector';

import { GetAllSourcesControlled } from '../../../api/services/SourceService';


const FOPReport = () => {
    const [Sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cancelSearch, setCancelSearch] = useState(() => () => {});

    // Function to fetch all Sources
    const getAllSources = async () => {
        cancelSearch();
        try {
            const [GetAllSources, GetAllSourcesCancel] = GetAllSourcesControlled();
            setCancelSearch(() => GetAllSourcesCancel);
            const data = await GetAllSources();
            setSources(data.error ? [] : data.sources.map(source => ({ label: source.name, value: source.id })));
        } catch (e) {
            console.error('Error fetching Sources', e);
            if (e.code !== "ERR_CANCELED") {
                setSources([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
      console.log('useEffect called: Starting to fetch Sources');
      setLoading(true);
      getAllSources();
  
      return () => {
          console.log('useEffect cleanup: Cancelling previous API call');
          cancelSearch();
      };
    }, []);
  
    
    return (
        <div>
            <h1>FOP Report</h1>
            {loading && <p>Loading...</p>}
            <SelectInput 
                options={Sources} 
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
