import React, { useState } from "react";
import "./Header.css";

const Header = () => {
  const [open, setOpen] = useState(false);
  
  // Get the actual logged-in user's name from localStorage
  const userEmail = localStorage.getItem('email') || "";
  const doctorName = userEmail.split('@')[0] || "Doctor"; // Extracts name from email

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    window.location.href = "/";
  };

  return (
    <div className="header">
      <div className="header-left">
        <h2>Welcome Dr. {doctorName}</h2>
        <br/>
        <p>{today}</p>
      </div>

      <div className="profile">
        <div onClick={() => setOpen(!open)} className="profile-btn">
          Dr. {doctorName} ▼
        </div>

        {open && (
          <div className="dropdown">
            <p><strong>{doctorName}</strong></p>
            <p><small>{userEmail}</small></p>
            <hr />
            <p onClick={logout}>Sign Out</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;