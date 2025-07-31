import React from 'react';
import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // If no token exists, redirect the user to the login page
    return <Navigate to="/login" replace />;
  }

  // If a token exists, render the child component (the DashboardPage)
  return children;
};

export default ProtectedRoute;
