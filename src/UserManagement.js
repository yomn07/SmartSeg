import React, { useState, useEffect } from "react";
import SidebarAdmin from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import { api } from "./services/api";
import "./admin.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await api.getAllUsers();
      setUsers(userList);
    } catch (err) {
      setMessage("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.deleteUser(id);
        setMessage("User deleted successfully!");
        loadUsers();
      } catch (err) {
        setMessage("Failed to delete: " + err.message);
      }
    }
  };

  if (loading) return <div className="dashboard"><div className="content">Loading...</div></div>;

  return (
    <div className="dashboard">
      <SidebarAdmin />
      <div className="content">
        <HeaderAdmin adminName="Admin" />
        <div className="page-header">
          <h2>User Management</h2>
        </div>
        
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;