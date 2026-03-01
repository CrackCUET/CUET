import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('cuet_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, name, password) => {
        try {
            const response = await axios.post(`${API}/auth/register`, {
                email,
                name,
                password
            });
            if (response.data.success) {
                const { token: newToken, user: newUser } = response.data.data;
                localStorage.setItem('cuet_token', newToken);
                setToken(newToken);
                setUser(newUser);
                return { success: true };
            }
            return { success: false, error: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Registration failed' };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API}/auth/login`, {
                email,
                password
            });
            if (response.data.success) {
                const { token: newToken, user: newUser } = response.data.data;
                localStorage.setItem('cuet_token', newToken);
                setToken(newToken);
                setUser(newUser);
                return { success: true };
            }
            return { success: false, error: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('cuet_token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isOnboarded: user?.preferences?.onboarding_completed
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
