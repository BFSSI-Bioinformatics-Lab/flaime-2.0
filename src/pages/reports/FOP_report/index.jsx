import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import your components
import SelectInput from '../../../components/inputs/SelectInput';
import BarChart from '../../../components/diagrams/BarChart';
import CategorySelector from '../../../components/inputs/CategorySelector';

const FOPReport = () => {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch sources
  useEffect(() => {
    setLoading(true);
    axios.get('/api/GetAllSources')
      .then(response => {
        setSources(response.data.map(source => ({ label: source.name, value: source.id })));
      })
      .catch(error => console.error('Error fetching sources', error))
      .finally(() => setLoading(false));
  }, []);

  // Fetch report data based on the category selection
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      axios.get(`/api/report-data/${selectedCategory}`)
        .then(response => {
          setReportData(response.data);
        })
        .catch(error => console.error('Error fetching report data', error))
        .finally(() => setLoading(false));
    }
  }, [selectedCategory]);

  return (
    <div>
        <h1>FOP Report</h1>
        {loading && <p>Loading...</p>}
        <SelectInput 
            options={sources} 
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
