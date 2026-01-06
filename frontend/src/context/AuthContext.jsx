import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. Initialize user from Local Storage (if available) for instant login
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // This request will now include the Token (via the interceptor)
        // or the Cookie (via withCredentials)
        const response = await axios.get('/auth/profile');
        setUser(response.data);
        
        // Optional: Update local storage with fresh data from server
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error checking user session:', error);
        
        // Only clear user if the server explicitly says "Unauthorized"
        // (Avoids logging out if just the internet connection drops)
        if (error.response && error.response.status === 401) {
             setUser(null);
             localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only run the server check if we don't have a user yet, 
    // OR you can run it every time to validate the token.
    // Running it every time is safer.
    checkUserSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      // 2. Save User + Token to Local Storage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      setUser(response.data);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/auth/register', { username, email, password });
      
      // 3. Save User + Token to Local Storage (Backend now returns token on register!)
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
      }
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      
      // 4. Clear Local Storage
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force local logout even if server fails
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);