const encodeParams = (params) => {
    Object.keys(params).forEach(
        key => params[key] = params[key] instanceof Array ? 
            params[key].map(item => encodeURIComponent(item)) : 
            encodeURIComponent(params[key])
    );
    return params;
}

export const encodeQuery = (func) => {
    return (params) => func(encodeParams(params));
}