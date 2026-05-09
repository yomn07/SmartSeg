import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <h2>SmartSeg</h2>

        
        <ul>
          <br/>
        <br/>
        <li onClick={() => navigate("/dashboard_doctor")}>
          Dashboard
        </li>

        <li onClick={() => navigate("/upload")}>
          Upload Scans
        </li>

        <li onClick={() => navigate("/cases")}>
          My Cases
        </li>
        <li onClick={() => navigate("/settings")}>
          Settings
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;