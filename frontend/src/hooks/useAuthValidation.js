import { z } from 'zod';
import { useState, useCallback } from 'react';

// Zod validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
});

export const signupSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, or underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(255, 'Password must be at most 255 characters long')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, 'Password must contain both letters and numbers')
});

// Custom hook for form validation
export const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback((fieldName, value, formData = {}) => {
    try {
      // Validate individual field
      const fieldSchema = schema.shape[fieldName];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: error.errors[0].message || 'Invalid field'
        }));
      }
    }
  }, [schema]);

  const validateForm = useCallback((formData) => {
    try {
      schema.parse(formData);
      setErrors({});
      setIsValid(true);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError && error.errors) {
        const fieldErrors = {};
        error.errors.forEach(err => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0];
            fieldErrors[fieldName] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsValid(false);
        return { isValid: false, errors: fieldErrors };
      }
    }
    return { isValid: false, errors: {} };
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  };
};
