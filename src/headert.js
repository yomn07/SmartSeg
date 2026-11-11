import React, { useState } from "react";
import "./Header.css";

const HeaderTechnician = ({ technicianName, today }) => {
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="header">
      <div className="header-left">
        <h2>Welcome back, {technicianName}</h2>
        <br />
        <p>{today}</p>
      </div>

      <div className="profile">
        <div onClick={() => setOpen(!open)} className="profile-btn">
           {technicianName} ▼
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

export default HeaderTechnician;