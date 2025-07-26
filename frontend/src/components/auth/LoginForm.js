import React from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import InputField from './InputField';

function LoginForm({ email, setEmail, password, setPassword, isLoading, error, handleLogin }) {
  return (
    <div className="">
      <h2 className="">Welcome Back</h2>
      <p className="text-muted">Login to continue managing your tasks.</p>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleLogin}>
        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon="email"
        />

        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon="password"
        />

        <div className="d-grid mt-4">
          <Button className="login-button" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </Button>
        </div>
      </Form>

      <p className="signup-redirect">
        Don't have an account? <a href="/register" className="register-link">Sign up</a>
      </p>
    </div>
  );
}

export default LoginForm;