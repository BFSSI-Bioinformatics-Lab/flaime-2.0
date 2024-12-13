import { Api } from "../Api";

const GetAllNutrients = async () => {
  try {
    const nutrients = await Api.get("nutrients/");
    return { error: false, nutrients };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export { GetAllNutrients };