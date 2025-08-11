import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { useSignup } from '../hooks/useSignup';

// Simple demo component to show React hooks + Zod validation working
export const AuthValidationDemo = () => {
  const loginHook = useLogin();
  const signupHook = useSignup();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React Hooks + Zod Validation Demo</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Login Form</h2>
        <form onSubmit={loginHook.handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={loginHook.formData.email}
              onChange={(e) => loginHook.updateField('email', e.target.value)}
              style={{ 
                padding: '8px', 
                marginRight: '10px',
                border: loginHook.errors.email ? '2px solid red' : '1px solid #ccc'
              }}
            />
            {loginHook.errors.email && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {loginHook.errors.email}
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={loginHook.formData.password}
              onChange={(e) => loginHook.updateField('password', e.target.value)}
              style={{ 
                padding: '8px', 
                marginRight: '10px',
                border: loginHook.errors.password ? '2px solid red' : '1px solid #ccc'
              }}
            />
            {loginHook.errors.password && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {loginHook.errors.password}
              </span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loginHook.isLoading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none',
              cursor: loginHook.isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {loginHook.isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          {loginHook.error && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              {loginHook.error}
            </div>
          )}
          
          {loginHook.loginSuccess && (
            <div style={{ color: 'green', marginTop: '10px' }}>
              Login successful!
            </div>
          )}
        </form>
      </div>

      <div>
        <h2>Signup Form</h2>
        <form onSubmit={signupHook.handleSignup}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Username"
              value={signupHook.formData.username}
              onChange={(e) => signupHook.updateField('username', e.target.value)}
              style={{ 
                padding: '8px', 
                marginRight: '10px',
                border: signupHook.errors.username ? '2px solid red' : '1px solid #ccc'
              }}
            />
            {signupHook.errors.username && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {signupHook.errors.username}
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={signupHook.formData.email}
              onChange={(e) => signupHook.updateField('email', e.target.value)}
              style={{ 
                padding: '8px', 
                marginRight: '10px',
                border: signupHook.errors.email ? '2px solid red' : '1px solid #ccc'
              }}
            />
            {signupHook.errors.email && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {signupHook.errors.email}
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={signupHook.formData.password}
              onChange={(e) => signupHook.updateField('password', e.target.value)}
              style={{ 
                padding: '8px', 
                marginRight: '10px',
                border: signupHook.errors.password ? '2px solid red' : '1px solid #ccc'
              }}
            />
            {signupHook.errors.password && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {signupHook.errors.password}
              </span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={signupHook.isLoading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none',
              cursor: signupHook.isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {signupHook.isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
          
          {signupHook.error && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              {signupHook.error}
            </div>
          )}
          
          {signupHook.signupSuccess && (
            <div style={{ color: 'green', marginTop: '10px' }}>
              Signup successful!
            </div>
          )}
        </form>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <h3>Validation Rules (using Zod):</h3>
        <h4>Login:</h4>
        <ul>
          <li>Email: Required, must be valid email format</li>
          <li>Password: Required, minimum 6 characters</li>
        </ul>
        <h4>Signup:</h4>
        <ul>
          <li>Username: Required, 3-20 characters, alphanumeric + underscores only</li>
          <li>Email: Required, must be valid email format</li>
          <li>Password: Required, 6-255 characters, must contain letters and numbers</li>
        </ul>
        <p><strong>Try entering invalid data to see real-time validation!</strong></p>
      </div>
    </div>
  );
};

export default AuthValidationDemo;
