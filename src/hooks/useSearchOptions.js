import { useState, useEffect } from 'react';
import { GetSearchOptions } from '../api/services/SearchOptionsService';

const useSearchOptions = () => {
  const [storageOptions, setStorageOptions] = useState([]);
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const result = await GetSearchOptions();

        if (result.error) {
          console.error('Error fetching Options:', result.message);
          setStorageOptions([]);
          setPackagingOptions([]);
        } else {
          const data = result.data;

          if (data.storage) {
            setStorageOptions(data.storage.map(item => ({ label: item.label, value: item.value })));
          }
          if (data.packaging) {
            setPackagingOptions(data.packaging.map(item => ({ label: item.label, value: item.value })));
          }
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