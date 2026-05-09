import React, { useState, useEffect } from "react";
import SidebarAdmin from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import { api } from "./services/api";
import "./admin.css";

const AccountRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const users = await api.getPendingUsers();
      setRequests(users);
    } catch (err) {
      setMessage("Failed to load pending users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.approveUser(id);
      setMessage("User approved successfully!");
      loadPendingUsers();
    } catch (err) {
      setMessage("Failed to approve: " + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectUser(id);
      setMessage("User rejected!");
      loadPendingUsers();
    } catch (err) {
      setMessage("Failed to reject: " + err.message);
    }
  };

  if (loading) return <div className="dashboard"><div className="content">Loading...</div></div>;

  return (
    <div className="dashboard">
      <SidebarAdmin />
      <div className="content">
        <HeaderAdmin adminName="Admin" />
        <h2 className="page-title">Account Requests</h2>
        
        {message && <div style={{padding: '10px', marginBottom: '10px', backgroundColor: '#e0ffe0', borderRadius: '5px'}}>{message}</div>}
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="accept-btn" onClick={() => handleAccept(user.id)}>
                      Accept
                    </button>
                    <button className="reject-btn" onClick={() => handleReject(user.id)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan="4" style={{textAlign: 'center'}}>No pending requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountRequests;