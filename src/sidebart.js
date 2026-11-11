import React from "react";
import { useNavigate } from "react-router-dom";

const SidebarTechnician = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2>SmartSeg</h2>

      <ul>
        <br />
        <br />

        <li onClick={() => navigate("/uploadscanst")}>
          Upload Scans
        </li>

        <li onClick={() => navigate("/settingstech")}>
          Settings
        </li>
      </ul>
    </div>
  );
};

export default SidebarTechnician;