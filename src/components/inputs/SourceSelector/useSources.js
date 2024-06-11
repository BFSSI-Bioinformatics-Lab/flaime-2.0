// components/inputs/SourceSelector/useSources.js
import { useState, useEffect } from 'react';

import { GetAllSourcesControlled } from '../../../api/services/SourceService';

const useSources = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cancelSearch, setCancelSearch] = useState(() => () => {});

    const getAllSources = async () => {
        cancelSearch();
        try {
            const [GetAllSources, GetAllSourcesCancel] = GetAllSourcesControlled();
            setCancelSearch(() => GetAllSourcesCancel);
            const data = await GetAllSources();
            if (data.error) {
                console.error('Error fetching Sources:', data.error);
                setSources([]);
            } else {
                setSources(data.sources.map(source => ({ label: source.name, value: source.id })));
            }
        } catch (e) {
            console.error('Exception when fetching sources', e);
            if (e.code !== "ERR_CANCELED") {
                setSources([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        getAllSources();
        return () => {
            cancelSearch();
        };
    }, []);

    return { sources, loading };
};


export default useSources;
