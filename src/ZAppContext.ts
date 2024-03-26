import { createContext } from 'react';

import { useContext } from 'react';

export interface User {
    isSubscribed: Boolean;
    name: string;
}

export const AppContext = createContext<User | undefined>(undefined);

export function useAppContext() {
    const appContext = useContext(AppContext);

    if (appContext === undefined) {
        throw new Error("useAppContext must be used with AppContext"); 
    }

    return appContext;
}
