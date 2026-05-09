import React from "react";
import Login from "./Login";
import { Routes, Route } from "react-router-dom";
import DashboardDoctor from "./Dashboard_doctor";
import SignUp from "./SignUp";
import Contact from "./Contact";
import About from "./aboutus";
import UploadPage from "./UploadPage";
import SettingsPage from "./SettingsPage";
import MyCasesPage from "./MyCasesPage";
import CaseDetailsPage from "./CaseDetailsPage";
import TechnicianUploadPage from "./uploadscanst";
import SettingsTechnician from "./settingt";
import AdminPage from "./AdminPage";
import UserManagement from "./UserManagement";
import Reclamations from "./Reclamations";
import AccountRequests from "./AccountRequests";
import SettingsAdmin from "./settingsadmin";
import AdminDashboard from "./AdminDashboard";


  function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard_doctor" element={<DashboardDoctor />} />
      <Route path="/login" element={<Login />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/cases" element={<MyCasesPage />} />
      <Route path="/cases/:id" element={<CaseDetailsPage />} />
      <Route path="/uploadscanst" element={<TechnicianUploadPage />} />
      <Route path="/settingstech" element={<SettingsTechnician />} />
      <Route path="/dashboard_admin" element={<AdminPage />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/reclamations" element={<Reclamations />} />
      <Route path="/requests" element={<AccountRequests />} />
      <Route path="/settingsadmin" element={<SettingsAdmin />} />
      <Route path="/dashboard_admin" element={<AdminDashboard />} />
    </Routes>
  );
}


export default App;