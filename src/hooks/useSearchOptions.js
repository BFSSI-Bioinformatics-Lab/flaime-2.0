import { useState, useEffect } from 'react';

const useSearchOptions = () => {
    const [storageOptions, setStorageOptions] = useState([]);
    const [packagingOptions, setPackagingOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/options/', {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' 
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.storage) {
                        setStorageOptions(data.storage.map(item => ({ label: item.label, value: item.value })));
                    }
                    if (data.packaging) {
                        setPackagingOptions(data.packaging.map(item => ({ label: item.label, value: item.value })));
                    }
                } else {
                    console.error('Error fetching Options:', response.statusText);
                }
            } catch (e) {
                console.error('Exception when fetching options', e);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    return { storageOptions, packagingOptions, loading };
};

export default useSearchOptions;