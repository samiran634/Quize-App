import { createContext, useContext, useState, useEffect } from 'react';
import { authStore } from './authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(authStore.userId);

    useEffect(() => {
        return authStore.subscribe(setUserId);
    }, []);

    const login = (id) => authStore.setUser(id);
    const logout = () => authStore.clear();

    return (
        <AuthContext.Provider value={{ userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
