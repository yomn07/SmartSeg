import React, { useState } from "react";
import "./Header.css";

const HeaderAdmin = ({ adminName }) => {
  const [open, setOpen] = useState(false);

  // ✅ Date complète avec jour
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="header">
      <div className="header-left">
        <h2>Welcome back, Admin </h2>
        <br />
        <p>{today}</p>
      </div>

      <div className="profile">
        <div onClick={() => setOpen(!open)} className="profile-btn">
           {adminName} ▼
        </div>

        {open && (
          <div className="dropdown">
            <p onClick={logout}>Sign Out</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderAdmin;