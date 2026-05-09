import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./settings.css";

const SettingsPage = () => {
  const doctorName = "Sarah Chen";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Header doctorName={doctorName} today={today} />

        <div className="settings-container">
          <h2>Settings</h2>
          

          <div className="settings-box">

            {/* Name */}
            <div className="form-row">
              <div>
                <label>First Name</label>
                <input
                  name="firstName"
                  placeholder="Enter first name"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  name="lastName"
                  placeholder="Enter last name"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="form-row">
              <div>
                <label>Email</label>
                <input
                  name="email"
                  placeholder="Enter email"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Phone</label>
                <input
                  name="phone"
                  placeholder="Enter phone"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="divider" />

            {/* Change Password Section */}
            <h3>Change Password</h3>

            {/* Current Password */}
            <div className="form-row">
              <div>
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter current password"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* New & Confirm Password */}
            <div className="form-row">
              <div>
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Save Button */}
            <button className="save-btn">
              Save 
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;