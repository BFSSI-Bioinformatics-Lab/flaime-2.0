import { ApiQueryGet } from "../Api";

const GetAllSources = async () => {
  try {
    const data = await ApiQueryGet("sources/");
    return { error: false, sources: data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GetSourceCollectionStats = async (sourceId) => {
  try {
    const data = await ApiQueryGet(`sources/${sourceId}/collection-stats/`);
    return { error: false, ...data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export {
    GetAllSources,
    GetSourceCollectionStats,
};