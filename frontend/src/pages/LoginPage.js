import React from 'react';
import BrandingPanel from '../components/auth/BrandingPanel';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';
import { useLogin } from '../hooks/useLogin';

export function LoginPage() {
  const {
    formData,
    updateField,
    handleLogin,
    isLoading,
    error,
    errors,
    loginSuccess,
    setError,
    setLoginSuccess,
    clearFieldError
  } = useLogin();

  return (
    <div className="auth-page">
      <BrandingPanel />
      <div className="login-panel d-flex align-items-center justify-content-center">
        <LoginForm
          email={formData.email}
          setEmail={(value) => updateField('email', value)}
          password={formData.password}
          setPassword={(value) => updateField('password', value)}
          isLoading={isLoading}
          error={error}
          setError={setError}
          handleLogin={handleLogin}
          loginSuccess={loginSuccess}
          setLoginSuccess={setLoginSuccess}
          emailError={errors.email}
          passwordError={errors.password}
          clearFieldError={clearFieldError}
        />
      </div>
    </div>
  );
}

export default LoginPage;