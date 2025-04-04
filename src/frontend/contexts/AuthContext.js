import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in by token on initial load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            setCurrentUser(response.data.user);
          } else {
            localStorage.removeItem('auth_token');
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error("Authentication error:", err);
        localStorage.removeItem('auth_token');
        setCurrentUser(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        setCurrentUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        setCurrentUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 