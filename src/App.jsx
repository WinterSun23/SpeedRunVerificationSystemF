import { useState, useEffect, useCallback } from 'react';
import AuthPage from './components/auth/AuthPage';
import OTPPage from './components/auth/OtpPage';
import SpeedrunDashboard from './SpeedRunDashboard';
import './App.css';

const baseURL = "http://localhost:3001";

function App() {
  const [view, setView] = useState('dashboard'); // 'loading' | 'auth' | 'otp' | 'dashboard'
  const [accessToken, setAccessToken] = useState(null);
  
  const [tempEmail, setTempEmail] = useState("");
  const [tempId, setTempId] = useState(-1); 
  const [otpType, setOtpType] = useState("login");

  
  const handleSessionActive = (token) => {
    setAccessToken(token);
    window.localStorage.setItem('access_token', token);
    setView('dashboard');
  }


  const refreshSession = async () => {
    if(window.localStorage.getItem("access_token") !== null){
      setAccessToken(window.localStorage.getItem("access_token"));
      console.log("access token still there");

      const response = await fetch(`${baseURL}/user/get_role`, {
        method: 'GET',
        credentials: 'include',
        headers: { 
            'authorization' : `Bearer ${window.localStorage.getItem("access_token")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns {id, email, name, role, time }
        setTempId(data.id);
        setTempEmail(data.email);
        // handleSessionActive(data.token);
        // return data.token;
      } 


      return window.localStorage.getItem("access_token");
    }

    const response = await fetch(`${baseURL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      // Backend returns { token, id, email }
      setTempId(data.id);
      setTempEmail(data.email);
      handleSessionActive(data.token);
      return data.token;
    } 
    else {
      const data = await response.json();
      console.log(data.error);
      console.log("Session invalid or expired:");
      setAccessToken(null);
      window.localStorage.removeItem('access_token');
      setView('auth');
      return null;
    }
  }

  const handleLogout = async () => {
    try {
      if (tempEmail) {
        const response = await fetch(`${baseURL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'authorization' : `Bearer ${accessToken}`
          },
          credentials: 'include'
        });
        if(!response.ok){
          console.log((await response.json()).error)
        }
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      window.localStorage.removeItem('access_token');
      setAccessToken(null);
      setView('auth');
    }
  }


  useEffect(() => {
    const initApp = async () => {
      const token = await refreshSession();
      if (!token) {
        setView('auth');
      }
    };
    initApp();
  }, []);


  const authFetch = async (url, options = {}) => {
    let currentToken = accessToken;
    
    const getOptions = (token) => ({
      ...options,
      headers: {
        ...options.headers,
        'authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let response = await fetch(url, getOptions(currentToken));
    if (response.status === 401) {
      console.log("Token expired during request, attempting refresh...");
      const newToken = await refreshSession();

      if (newToken) {
        response = await fetch(url, getOptions(newToken));
      } else {
        handleLogout();
      }
    }

    return response;
  };


  const onAuthPageSuccess = (type, email) => {
    setOtpType(type);
    setTempEmail(email);
    window.localStorage.setItem('user_email', email);
    setView('otp');
  };

  const onOtpPageSuccess = (token) => {
    handleSessionActive(token);
  };

  if (view === 'loading') {
    return (
      <div className="app-container">
        <div className="loading">Connecting to SpeedRun Server...</div>
      </div>
    );
  }

  if (view === 'dashboard' && accessToken) {
    return (
      <SpeedrunDashboard 
        id = {tempId}
        accessToken={accessToken}
        authFetch={authFetch}
        onLogout={handleLogout}
        // userRole={userRole}
      />
    );
  }

  if (view === 'otp') {
    return (
      <OTPPage 
        email={tempEmail} 
        type={otpType} 
        onSuccess={onOtpPageSuccess}
      />
    );
  }

  return (
    <AuthPage 
      onAuthSuccess={onAuthPageSuccess} 
    />
  );
}

export default App;