const encodeParams = (params) => {
    Object.keys(params).forEach(
        key => params[key] = encodeURIComponent(params[key])
    );
    return params;
}

export const encodeQuery = (func) => {
    return (params) => func(encodeParams(params));
}