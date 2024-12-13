import { Api } from "../Api";

const GetAllSources = async () => {
  try {
    const sources = await Api.get("sources/");
    return { error: false, sources };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export {
    GetAllSources,
};