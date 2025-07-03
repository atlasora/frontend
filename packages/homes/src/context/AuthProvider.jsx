import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import resolveUrl from 'library/helpers/resolveURL';

export const AuthContext = React.createContext();

const AuthProvider = (props) => {
  const navigate = useNavigate();

  // Initialize from localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const loggedIn = !!user && !!token;

  // Sync user & token to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const signIn = async (params) => {
    const { identifier, password } = params;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}auth/local`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      const data = await response.json();
      //todo : this is a default avatar for now we have to extend user permissions in the strapi auth to return the picture.
      data.user.avatar = resolveUrl(
        '/uploads/thumbnail_favicon_15c376b1a2.png',
      );

      console.log(data);
      setUser(data.user);
      setToken(data.jwt);
      //navigate('/', { replace: true });
      return { success: true };
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const signUp = async (params) => {
    const { username, email, password, ...rest } = params;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}auth/local/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      const data = await response.json();
      //todo : this is a default avatar for now we have to extend user permissions in the strapi auth to return the picture.
      data.user.avatar = resolveUrl(
        '/uploads/thumbnail_favicon_15c376b1a2.png',
      );

      navigate('/sign-in', { replace: true });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        user,
        token,
        signIn,
        signUp,
        logOut,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
