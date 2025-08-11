import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation, loginSchema } from './useAuthValidation';

export const useLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  } = useFormValidation(loginSchema);

  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear general error when user starts typing
    if (error) {
      setError(null);
      setLoginSuccess(false);
    }

    // Validate field on change
    validateField(fieldName, value, { ...formData, [fieldName]: value });
  }, [formData, error, validateField]);

  const handleLogin = useCallback(async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setLoginSuccess(false);

    // Validate form before submission
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      setLoginSuccess(true);
      console.log("Sign in successful. Token saved.");

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('username', data.username);

      navigate('/dashboard');
    } catch (err) {
      setLoginSuccess(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate]);

  const resetForm = useCallback(() => {
    setFormData({ email: '', password: '' });
    setError(null);
    setLoginSuccess(false);
    clearErrors();
  }, [clearErrors]);

  return {
    formData,
    updateField,
    handleLogin,
    isLoading,
    error,
    errors,
    loginSuccess,
    resetForm,
    setError,
    setLoginSuccess,
    clearFieldError
  };
};
