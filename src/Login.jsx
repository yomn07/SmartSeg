import { api } from './services/api';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Head from "./head"; 
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!role) {
      setMessage("Please select a role.");
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Invalid email address.");
      return;
    }

    if (!password) {
      setMessage("Password is required.");
      return;
    }

    setLoading(true);

    try {
      // Call the real API instead of mock data
      const result = await api.login(email, password);
      
      // Check if the role matches what they selected
      const userRole = result.role.toLowerCase();
      if (userRole !== role) {
        setMessage(`You logged in as ${userRole}, but selected ${role}`);
        setLoading(false);
        return;
      }
      
      // ✅ STORE DOCTOR NAME FOR DISPLAY
      // Extract name from email (everything before @)
      const doctorName = email.split('@')[0];
      // Capitalize first letter and replace dots with spaces
      const formattedName = doctorName.split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      
      localStorage.setItem('doctorName', formattedName);
      localStorage.setItem('userEmail', email);
      
      setMessage("Login successful!");
      
      // Redirect based on role
      if (userRole === "doctor") navigate("/dashboard_doctor");
      else if (userRole === "technician") navigate("/uploadscanst");
      else if (userRole === "admin") navigate("/dashboard_admin");
      else navigate("/");
      
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Header global */}
      <Head loggedIn={false} />

      {/* Carte du formulaire */}
      <div className="card">
        <h2>Sign In</h2>

        {/* Choix du rôle */}
        <p className="section-title">Select Role</p>
        <div className="roles">
          <div
            className={`role ${role === "doctor" ? "active" : ""}`}
            onClick={() => setRole("doctor")}
          >
            
            <h4>Doctor</h4>
          </div>

          <div
            className={`role ${role === "technician" ? "active" : ""}`}
            onClick={() => setRole("technician")}
          >
            
            <h4>MRI Technician</h4>
          </div>

          <div
            className={`role ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            
            <h4>Administrator</h4>
          </div>
        </div>

        {/* Formulaire email / mot de passe */}
        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="your.email@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
}