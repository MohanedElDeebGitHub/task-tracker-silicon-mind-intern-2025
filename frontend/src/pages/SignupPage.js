import React from 'react';
import BrandingPanel from '../components/auth/BrandingPanel';
import SignupForm from '../components/auth/SignupForm';
import '../styles/auth.css';
import { useSignup } from '../hooks/useSignup';

export function SignupPage() {
  const {
    formData,
    updateField,
    handleSignup,
    isLoading,
    error,
    errors,
    signupSuccess,
    setError,
    setSignupSuccess,
    clearFieldError
  } = useSignup();

  return (
    <div className="auth-page">
      <BrandingPanel />
      <div className="login-panel d-flex align-items-center justify-content-center">
        <SignupForm
          username={formData.username}
          setUsername={(value) => updateField('username', value)}
          email={formData.email}
          setEmail={(value) => updateField('email', value)}
          password={formData.password}
          setPassword={(value) => updateField('password', value)}
          isLoading={isLoading}
          error={error}
          setError={setError}
          handleSignup={handleSignup}
          signupSuccess={signupSuccess}
          setSignupSuccess={setSignupSuccess}
          usernameError={errors.username}
          emailError={errors.email}
          passwordError={errors.password}
          clearFieldError={clearFieldError}
        />
      </div>
    </div>
  );
}

export default SignupPage;
