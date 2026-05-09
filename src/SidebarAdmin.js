import React from "react";
import { useNavigate } from "react-router-dom";

const SidebarAdmin = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2>SmartSeg</h2>

      <ul>
        <br /><br />

        <li onClick={() => navigate("/dashboard_admin")}>
          Dashboard
        </li>

        <li onClick={() => navigate("/users")}>
          User Management
        </li>
        <li onClick={() => navigate("/requests")}>
          Account Requests
        </li>
        <li onClick={() => navigate("/reclamations")}>
          Reclamations
        </li>

        <li onClick={() => navigate("/settingsadmin")}>
          Settings
        </li>
      </ul>
    </div>
  );
};

export default SidebarAdmin;