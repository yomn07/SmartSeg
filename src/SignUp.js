import React, { useState } from "react";
import Head from "./head";
import { api } from "./services/api";
import "./SignUP.css";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!firstName || !lastName) {
      setMessage("Please enter your first and last name.");
      return;
    }
    if (!email) {
      setMessage("Email is required.");
      return;
    }
    if (!password) {
      setMessage("Password is required.");
      return;
    }
    if (!role) {
      setMessage("Please select a role.");
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`;
      const result = await api.register(fullName, email, password, role);
      setMessage(result);
      
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("");
      
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Head loggedIn={false} />
      
      <div className="card">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <label>First Name</label>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label>Last Name</label>
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

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

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="doctor">Doctor</option>
            <option value="technician">MRI Technician</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Sign Up"}
          </button>
        </form>

        {message && <p className="signup-message">{message}</p>}
      </div>
    </div>
  );
}