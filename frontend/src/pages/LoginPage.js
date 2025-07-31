import React, { useState } from 'react';
import BrandingPanel from '../components/auth/BrandingPanel';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';
import { useNavigate } from 'react-router';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault(); 
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      
      setLoginSuccess(true);

      console.log("Sign in successful. Token saved.");
      
      localStorage.setItem('authToken', data.token);
      console.log(data);
      localStorage.setItem('username', data.username);

      navigate('/dashboard');

    } catch (err) {
      setLoginSuccess(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
  <BrandingPanel />
  <div className="login-panel d-flex align-items-center justify-content-center">
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      isLoading={isLoading}
      error={error}
      setError={setError}
      handleLogin={handleLogin}
      loginSuccess={loginSuccess}
      setLoginSuccess={setLoginSuccess}
    />
  </div>
</div>

  );
}

export default LoginPage;