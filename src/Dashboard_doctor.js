import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./dashboard_doctor.css";
import { useNavigate } from "react-router-dom";
import { api } from "./services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get rejected scans from localStorage
  const getRejectedScans = () => {
    const rejected = localStorage.getItem('rejectedScans');
    return rejected ? JSON.parse(rejected) : {};
  };

  useEffect(() => {
    loadPendingCasesCount();
  }, []);

  const loadPendingCasesCount = async () => {
    try {
      const rejectedScans = getRejectedScans();
      // Get all scans for this doctor
      const scans = await api.getScans();
      
      let pending = 0;
      
      for (const scan of scans) {
        try {
          const result = await api.getSegmentationResult(scan.id);
          // Check if this scan is rejected in localStorage
          const isRejected = rejectedScans[scan.id] === true;
          
          // Count as PENDING if:
          // 1. Segmentation exists (result has id)
          // 2. Not validated (validated === false)
          // 3. NOT rejected (isRejected === false)
          if (result && result.id && result.validated === false && !isRejected) {
            pending++;
          }
        } catch (err) {
          // No segmentation exists - not counted
          console.log("No segmentation for scan:", scan.id);
        }
      }
      
      setPendingCount(pending);
    } catch (err) {
      console.error("Failed to load pending cases:", err);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <Header />
        
        <div className="actions">
          <div className="action blue">
            <h3>Quick Upload</h3>
            <p>Upload a new MRI scan for AI analysis</p>
            <button onClick={() => navigate("/upload")}>Upload Scan</button>
          </div>

          <div className="action orange">
            <h3>Pending Reviews</h3>
            <p>{loading ? "Loading..." : `${pendingCount} case${pendingCount !== 1 ? 's' : ''} waiting for validation`}</p>
            <button onClick={() => navigate("/cases")}>Review Cases</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;