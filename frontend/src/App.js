import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import 'bootstrap/dist/css/bootstrap.min.css';



import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage'; // Remove curly braces
// import ProtectedRoute from './components/auth/ProtectedRoute'; // Comment out temporarily
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} /> 
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;