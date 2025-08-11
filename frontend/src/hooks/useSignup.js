import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation, signupSchema } from './useAuthValidation';

export const useSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  } = useFormValidation(signupSchema);

  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear general error when user starts typing
    if (error) {
      setError(null);
      setSignupSuccess(false);
    }

    // Validate field on change
    validateField(fieldName, value, { ...formData, [fieldName]: value });
  }, [formData, error, validateField]);

  const handleSignup = useCallback(async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setSignupSuccess(false);

    // Validate form before submission
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Signup successful
      setSignupSuccess(true);
      console.log("Sign up successful.", data);

      navigate('/dashboard');
    } catch (err) {
      setSignupSuccess(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate]);

  const resetForm = useCallback(() => {
    setFormData({ username: '', email: '', password: '' });
    setError(null);
    setSignupSuccess(false);
    clearErrors();
  }, [clearErrors]);

  return {
    formData,
    updateField,
    handleSignup,
    isLoading,
    error,
    errors,
    signupSuccess,
    resetForm,
    setError,
    setSignupSuccess,
    clearFieldError
  };
};
