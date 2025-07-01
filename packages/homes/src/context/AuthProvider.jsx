import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = React.createContext();

const fakeUserData = {
  id: 1,
  name: 'Jhon Doe',
  avatar:
    'http://s3.amazonaws.com/redqteam.com/isomorphic-reloaded-image/profilepic.png',
  roles: ['USER', 'ADMIN'],
};

const AuthProvider = (props) => {
  let navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  const signIn = (params) => {
    console.log(params, 'sign in form Props');
    setUser(fakeUserData);
    setLoggedIn(true);
    navigate('/', { replace: true });
  };

  const signUp = async (params) => {
    const { username, email, password, ...rest } = params;
    try {
      // Register the user with Strapi authentication
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}auth/local/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to register');
      }

      // create an entry in propertyUser collection type
      await fetch(`${import.meta.env.VITE_APP_API_URL}property-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.jwt}`,
        },
        body: JSON.stringify({ data: { user: data.user.id, ...rest } }),
      });

      setUser(data.user);
      setLoggedIn(true);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const logOut = () => {
    setUser(null);
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        logOut,
        signIn,
        signUp,
        user,
      }}
    >
      <>{props.children}</>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
