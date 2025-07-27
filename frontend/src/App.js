import logo from "./logo.svg";
import "./App.css";
import React from 'react';
import {LoginPage} from './pages/LoginPage.js';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <div className="App">
      <LoginPage />
    </div>
  );
}

export default App;
