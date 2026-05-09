import React, { useState } from "react";
import SidebarAdmin from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import UserManagement from "./UserManagement";
import Reclamations from "./Reclamations";
import AdminDashboard from "./AdminDashboard";

import "./admin.css";

const AdminPage = () => {
  const [page, setPage] = useState("dashboard");

  const today = new Date().toLocaleDateString();

  return (
    <div className="dashboard">
      <SidebarAdmin setPage={setPage} />

      <div className="content">
        <HeaderAdmin adminName="Admin" today={today} />

        {page === "dashboard" && (
          <h2>Admin Dashboard </h2> ) && <AdminDashboard /> }
        {page === "users" && <UserManagement />}
        {page === "reclamations" && <Reclamations />}
      </div>
    </div>
  );
};

export default AdminPage;