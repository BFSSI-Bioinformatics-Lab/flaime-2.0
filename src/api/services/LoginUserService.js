import { ApiQueryGet } from "../Api";

const GetAllLoginUsers = async () => {
    const data = await ApiQueryGet("LoginUserService/GetAllLoginUsersAsync")
    return { error: data.statusCode !== 200, sources: data.responseObjects }
}

export {
    GetAllLoginUsers
}