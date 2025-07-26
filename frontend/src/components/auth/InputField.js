import React from 'react';
import { Form } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const iconMap = {
  email: 'bi-envelope',
  password: 'bi-lock',
};

export default function InputField({ type, placeholder, value, onChange, icon }) {
  return (
    <div className="input-wrapper">
      <i className={`bi ${iconMap[icon]} input-icon`} />
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-with-icon"
        autoComplete="off"
      />
    </div>
  );
}
