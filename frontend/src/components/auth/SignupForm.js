import React from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import InputField from './InputField';
import { Link } from 'react-router-dom';

function SignupForm({
  username, setUsername,
  email, setEmail,
  password, setPassword,
  isLoading, error, setError,
  usernameError, emailError, passwordError,
  signupSuccess, setSignupSuccess,
  handleSignup,
  clearFieldError
}) {
  return (
    <div className="">
      <h2 className="">Create an Account</h2>
      <p className="text-muted">Get started by creating your account.</p>

      {error && !usernameError && !emailError && !passwordError && (
        <div className="alert alert-danger" role="alert">
          {typeof error === 'string' ? error : error?.message || 'An error occurred.'}
        </div>
      )}

      {signupSuccess && (
        <div className="alert alert-success" role="alert">
          Sign Up Successful! Redirecting...
        </div>
      )}

      <Form onSubmit={handleSignup}>
        <InputField
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (error) {
              setError(null);
              setSignupSuccess(null);
            }
            if (usernameError && clearFieldError) {
              clearFieldError('username');
            }
          }}
          icon="username"
          error={usernameError}
        />

        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) {
              setError(null);
              setSignupSuccess(null);
            }
            if (emailError && clearFieldError) {
              clearFieldError('email');
            }
          }}
          icon="email"
          error={emailError}
        />

        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) {
              setError(null);
              setSignupSuccess(null);
            }
            if (passwordError && clearFieldError) {
              clearFieldError('password');
            }
          }}
          icon="password"
          error={passwordError}
        />

        <div className="d-grid mt-4">
          <Button className="login-button" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Sign Up'}
          </Button>
        </div>
      </Form>

      <p className="signup-redirect">
        Have an account? <Link to="/" className="navigation-link">Sign In</Link>
      </p>
    </div>
  );
}

// You will need to pass handleSignup from the parent page
// For now, this is a placeholder to avoid breaking the component

export default SignupForm;
