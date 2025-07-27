import React, { useState } from 'react';
import BrandingPanel from '../components/auth/BrandingPanel';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

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
      
      // Login successful
      setLoginSuccess(true);

      console.log("Sign in successful. Token saved.");
      
      localStorage.setItem('authToken', data.token);
      // window.location.href = 'dashboar';

    } catch (err) {
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
    />
  </div>
</div>

  );
}

export default LoginPage;