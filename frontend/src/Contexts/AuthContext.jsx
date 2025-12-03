import { jwtDecode } from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();


export default AuthContext


export function AuthProvider({children}) {
    const [authTokens, setAuthTokens] = useState(
        JSON.parse(localStorage.getItem('authTokens')) || null
    );

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );

    const nav = useNavigate()

    const url = import.meta.env.VITE_API_URL

    const loginUser = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(url + 'token/', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'username': e.target.username.value, 'password': e.target.password.value})
            });

            if (response.ok) {
                const data = await response.json();
                
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                localStorage.setItem('user', JSON.stringify(jwtDecode(data.access)));
                nav('/');
            } else {
                // Handle login error (e.g., show an error message)
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };
    
    const logoutUser = () => {
        setUser(null);
        setAuthTokens(null);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('user');
    }


    const updateToken = async () => {
        try {
            const response = await fetch(url+'token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({ 'refresh': authTokens.refresh }),
            });

            if (response.ok) {
                const data = await response.json();
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                localStorage.setItem('user', JSON.stringify(jwtDecode(data.access)));
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error('Error updating tokens:', error);
        }
    };

    useEffect(() => {
        

        const interval = setInterval(() => {
            updateToken();
        }, 600000);

        return () => clearInterval(interval);
    }, []);

    

    var context = {
        loginUser:loginUser,
        logOut:logoutUser,
        user:user,
        authTok:authTokens,
        



    }
    return (
      <AuthContext.Provider value={context}>
        {children}
      </AuthContext.Provider>
    )
  }
  