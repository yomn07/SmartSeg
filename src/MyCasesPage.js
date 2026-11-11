import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { api } from "./services/api";
import "./mycases.css";
import { useNavigate } from "react-router-dom";

const MyCasesPage = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [caseStatuses, setCaseStatuses] = useState({});

  // Get rejected scans from localStorage
  const getRejectedScans = () => {
    const rejected = localStorage.getItem('rejectedScans');
    return rejected ? JSON.parse(rejected) : {};
  };

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const scans = await api.getScans();
      setCases(scans);
      const rejectedScans = getRejectedScans();
      
      // Load validation status for each scan
      for (const scan of scans) {
        // Check if scan is rejected
        if (rejectedScans[scan.id]) {
          setCaseStatuses(prev => ({ ...prev, [scan.id]: 'FAILED' }));
          continue;
        }
        
        try {
          const result = await api.getSegmentationResult(scan.id);
          if (result && result.id) {
            if (result.validated === true) {
              setCaseStatuses(prev => ({ ...prev, [scan.id]: 'COMPLETED' }));
            } else if (result.validated === false) {
              setCaseStatuses(prev => ({ ...prev, [scan.id]: 'PENDING' }));
            } else {
              setCaseStatuses(prev => ({ ...prev, [scan.id]: 'PENDING' }));
            }
          } else {
            setCaseStatuses(prev => ({ ...prev, [scan.id]: 'N/A' }));
          }
        } catch (err) {
          setCaseStatuses(prev => ({ ...prev, [scan.id]: 'N/A' }));
        }
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (scanId) => {
    const status = caseStatuses[scanId];
    switch(status) {
      case 'COMPLETED':
        return { text: "Completed", color: "#28a745", bg: "#d4edda", icon: "✅" };
      case 'PENDING':
        return { text: "Pending", color: "#ff6a00", bg: "#ffe5d0", icon: "⏳" };
      case 'FAILED':
        return { text: "Failed", color: "#dc3545", bg: "#f8d7da", icon: "❌" };
      case 'N/A':
        return { text: "N/A", color: "#999", bg: "#f0f0f0", icon: "⚪" };
      default:
        return { text: "N/A", color: "#999", bg: "#f0f0f0", icon: "⚪" };
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.id?.toString().toLowerCase().includes(search.toLowerCase()) ||
      c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.patientId?.toString().toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="content">
          <Header />
          <div className="cases-container">
            <h2>My Cases</h2>
            <p>Loading your cases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <Header />
        <div className="cases-container">
          <h2>My Cases</h2>
          <p>Manage and review all your patient cases</p>

          <input
            className="search-bar"
            type="text"
            placeholder="Search by Patient ID or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <table className="cases-table">
            <thead>
              <tr>
                <th>Scan ID</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const status = getStatusDisplay(c.id);
                return (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.patientId || "N/A"}</td>
                    <td>{c.patientName || "N/A"}</td>
                    <td>{new Date(c.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '5px 12px', 
                        backgroundColor: status.bg, 
                        color: status.color,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {status.icon} {status.text}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="link" 
                        onClick={() => navigate(`/cases/${c.id}`)}
                        style={{ cursor: 'pointer', color: '#2a7be4' }}
                      >
                        View Details
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No cases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyCasesPage;