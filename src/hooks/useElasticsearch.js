import { useState, useCallback } from 'react';

const ELASTIC_URL = `${process.env.REACT_APP_ELASTIC_URL}/_search`;

const useElasticsearchSearch = () => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);

    const executeSearch = useCallback(async (queryObject, page, rowsPerPage, processHits = null) => {
        if (!queryObject) return;

        setIsLoading(true);

        const body = {
            from: page * rowsPerPage,
            size: rowsPerPage,
            query: queryObject
        };

        try {
            const response = await fetch(ELASTIC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                const hits = processHits ? processHits(data.hits.hits) : data.hits.hits;
                setResults(hits);
                setTotalProducts(data.hits.total.value);
            } else {
                console.error('Search API error:', data.error || data);
                setResults([]);
                setTotalProducts(0);
            }
        } catch (error) {
            console.error('Search request failed:', error);
            setResults([]);
            setTotalProducts(0);
        }

        setIsLoading(false);
    }, []);

    return { results, isLoading, totalProducts, setResults, setTotalProducts, executeSearch };
};

export default useElasticsearchSearch;
