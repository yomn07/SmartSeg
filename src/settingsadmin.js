import React, { useState } from "react";
import SidebarAdmin from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import "./settings.css";

const SettingsPage = () => {
  const adminName = "Admin";

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

      {/* Sidebar Admin */}
      <SidebarAdmin />

      <div className="content">

        {/* Header Admin */}
        <HeaderAdmin adminName={adminName} />

        <div className="settings-container">
          <h2>Settings</h2>

          <div className="settings-box">

            {/* Name */}
            <div className="form-row">
              <div>
                <label>First Name</label>
                <input name="firstName" onChange={handleChange} />
              </div>

              <div>
                <label>Last Name</label>
                <input name="lastName" onChange={handleChange} />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="form-row">
              <div>
                <label>Email</label>
                <input name="email" onChange={handleChange} />
              </div>

              <div>
                <label>Phone</label>
                <input name="phone" onChange={handleChange} />
              </div>
            </div>

            <hr className="divider" />

            <h3>Change Password</h3>

            {/* Current Password */}
            <div className="form-row">
              <div>
                <label>Current Password</label>
                <input type="password" name="currentPassword" onChange={handleChange} />
              </div>
            </div>

            {/* New Password */}
            <div className="form-row">
              <div>
                <label>New Password</label>
                <input type="password" name="password" onChange={handleChange} />
              </div>

              <div>
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" onChange={handleChange} />
              </div>
            </div>

            {/* Save */}
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