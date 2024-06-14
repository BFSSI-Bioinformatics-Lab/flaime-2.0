import { useState, useEffect } from 'react';

// Replace with your actual API method
import { GetAllNutrients } from '../../../api/services/NutrientService';

const useNutrients = () => {
    const [nutrients, setNutrients] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNutrients = async () => {
        setLoading(true);
        try {
            const data = await GetAllNutrients();
            if (data.error) {
                console.error('Error fetching nutrients:', data.error);
                setNutrients([]);
            } else {
                setNutrients(data.map(nutrient => ({ label: nutrient.name, value: nutrient.id })));
            }
        } catch (error) {
            console.error('Exception when fetching nutrients', error);
            setNutrients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNutrients();
        return () => {}; // Cleanup if necessary
    }, []);

    return { nutrients, loading };
};

export default useNutrients;
