import React, { useState } from 'react';
import BrandingPanel from '../components/auth/BrandingPanel';
import SignupForm from '../components/auth/SignupForm';
import '../styles/auth.css';

export function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setSignupSuccess(false);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Signup successful
      setSignupSuccess(true);
      console.log("Sign up successful.", data);

    } catch (err) {
      setSignupSuccess(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <BrandingPanel />
      <div className="login-panel d-flex align-items-center justify-content-center">
        <SignupForm
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          error={error}
          setError={setError}
          handleSignup={handleSignup}
          signupSuccess={signupSuccess}
          setSignupSuccess={setSignupSuccess}
        />
      </div>
    </div>
  );
}

export default SignupPage;
