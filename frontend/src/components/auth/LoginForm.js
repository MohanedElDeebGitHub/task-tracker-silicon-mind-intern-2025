import React from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import InputField from './InputField';
import { Link } from 'react-router-dom';

function LoginForm({
  email, setEmail,
  password, setPassword,
  isLoading, error,
  handleLogin,
  emailError, passwordError, setError,
  loginSuccess, setLoginSuccess,
  clearFieldError
}) {
  return (
    <div className="">
      <h2 className="">Welcome Back</h2>
      <p className="text-muted">Login to continue managing your tasks.</p>

      {error && !emailError && !passwordError && (
        <>
          {console.log(error)}
          <div className="alert alert-danger" role="alert">
            {typeof error === 'string' ? error : error?.message || 'An error occurred.'}
          </div>
        </>
      )}

      {loginSuccess && (
        <div className="alert alert-success" role="alert">
          Login Successful! Redirecting to Dashboard...
        </div>
      )}

      <Form onSubmit={handleLogin}>
        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) {
              setError(null);
              setLoginSuccess(null);
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
              setLoginSuccess(null);
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
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </Button>
        </div>
      </Form>

      <p className="signup-redirect">
        Don't have an account? <Link to="/register" className="navigation-link">Sign up</Link>
      </p>
    </div>
  );
}

export default LoginForm;