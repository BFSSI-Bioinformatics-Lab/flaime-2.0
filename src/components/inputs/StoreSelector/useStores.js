// components/inputs/StoreSelector/useStores.js
import { useState, useEffect } from 'react';

import { GetAllStoresControlled } from '../../../api/services/StoreService';

const useStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cancelSearch, setCancelSearch] = useState(() => () => {});

    const GetAllStores = async () => {
        cancelSearch();
        try {
            const [GetAllStores, GetAllStoresCancel] = GetAllStoresControlled();
            setCancelSearch(() => GetAllStoresCancel);
            const data = await GetAllStores();
            if (data.error) {
                console.error('Error fetching Stores:', data.error);
                setStores([]);
            } else {
                setStores(data.stores.map(store => ({ label: store.name, value: store.id })));
            }
        } catch (e) {
            console.error('Exception when fetching stores', e);
            if (e.code !== "ERR_CANCELED") {
                setStores([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        GetAllStores();
        return () => {
            cancelSearch();
        };
    }, []);

    return { stores, loading };
};


export default useStores;
