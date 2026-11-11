import React, { useState, useEffect } from "react";
import { api } from "./services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [allUsers,       setAllUsers]       = useState([]);
  const [pendingUsers,   setPendingUsers]   = useState([]);
  const [overall,        setOverall]        = useState(null);
  const [byRegion,       setByRegion]       = useState(null);
  const [trainingSummary,setTrainingSummary]= useState(null);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [users, pending, ov, region, training] = await Promise.all([
        api.getAllUsers(),
        api.getPendingUsers(),
        api.getOverallMetrics(),
        api.getMetricsByRegion(),
        api.getTrainingSummary(),
      ]);
      setAllUsers(users);
      setPendingUsers(pending);
      setOverall(ov);
      setByRegion(region);
      setTrainingSummary(training);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const doctors     = allUsers.filter(u => u.role === "DOCTOR");
  const technicians = allUsers.filter(u => u.role === "TECHNICIAN");

  const pct = (val) => val != null ? (val * 100).toFixed(2) + "%" : "—";

  if (loading) return <div className="adb-loading">Loading dashboard...</div>;

  return (
    <div className="adb-content">
      <h2 className="adb-page-title">Admin Dashboard</h2>

      {/* ── Row 1: User Stats ── */}
      <div className="adb-stats-grid">
        <div className="adb-stat-card blue">
          <span className="adb-stat-icon"></span>
          <span className="adb-stat-value">{allUsers.length}</span>
          <span className="adb-stat-label">Total Users</span>
        </div>
        <div className="adb-stat-card green">
          <span className="adb-stat-icon"></span>
          <span className="adb-stat-value">{doctors.length}</span>
          <span className="adb-stat-label">Doctors</span>
        </div>
        <div className="adb-stat-card teal">
          <span className="adb-stat-icon"></span>
          <span className="adb-stat-value">{technicians.length}</span>
          <span className="adb-stat-label">Technicians</span>
        </div>
        <div className="adb-stat-card orange">
          <span className="adb-stat-icon"></span>
          <span className="adb-stat-value">{pendingUsers.length}</span>
          <span className="adb-stat-label">Pending Requests</span>
        </div>
      </div>

      {/* ── Row 2: Model Info + Overall Metrics ── */}
      {overall && (
        <div className="adb-row-2">

          {/* Model Info */}
          <div className="adb-section adb-model-info">
            <div className="adb-section-header">
              <h3 className="adb-section-title"> Model Information</h3>
            </div>
            <div className="adb-model-body">
              <div className="adb-model-row">
                <span className="adb-model-key">Architecture</span>
                <span className="adb-model-val">{overall.modelInfo?.architecture}</span>
              </div>
              <div className="adb-model-row">
                <span className="adb-model-key">Strategy</span>
                <span className="adb-model-val">{overall.modelInfo?.ensembleStrategy}</span>
              </div>
              <div className="adb-model-row">
                <span className="adb-model-key">Dataset</span>
                <span className="adb-model-val">{overall.modelInfo?.dataset}</span>
              </div>
              <div className="adb-model-row">
                <span className="adb-model-key">Training Samples</span>
                <span className="adb-model-val">{overall.modelInfo?.trainingSamples?.toLocaleString()}</span>
              </div>
              <div className="adb-model-row">
                <span className="adb-model-key">Test Samples</span>
                <span className="adb-model-val">{overall.modelInfo?.testSamples?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Overall DSC + IoU */}
          <div className="adb-section adb-overall-metrics">
            <div className="adb-section-header">
              <h3 className="adb-section-title"> Overall Performance</h3>
              <span className="adb-badge blue">Ensemble</span>
            </div>
            <div className="adb-overall-grid">
              <div className="adb-overall-block">
                <div className="adb-overall-title">DSC Scores</div>
                <div className="adb-overall-row">
                  <span>Whole Tumor</span>
                  <span className="adb-val blue">{pct(overall.dsc?.wholeTumor)}</span>
                </div>
                <div className="adb-overall-row">
                  <span>Tumor Core</span>
                  <span className="adb-val green">{pct(overall.dsc?.tumorCore)}</span>
                </div>
                <div className="adb-overall-row">
                  <span>Enhancing Tumor</span>
                  <span className="adb-val orange">{pct(overall.dsc?.enhancingTumor)}</span>
                </div>
                <div className="adb-overall-row avg">
                  <span>Average</span>
                  <span className="adb-val">{pct(overall.dsc?.average)}</span>
                </div>
              </div>
              <div className="adb-divider" />
              <div className="adb-overall-block">
                <div className="adb-overall-title">IoU Scores</div>
                <div className="adb-overall-row">
                  <span>Whole Tumor</span>
                  <span className="adb-val blue">{pct(overall.iou?.wholeTumor)}</span>
                </div>
                <div className="adb-overall-row">
                  <span>Tumor Core</span>
                  <span className="adb-val green">{pct(overall.iou?.tumorCore)}</span>
                </div>
                <div className="adb-overall-row">
                  <span>Enhancing Tumor</span>
                  <span className="adb-val orange">{pct(overall.iou?.enhancingTumor)}</span>
                </div>
                <div className="adb-overall-row avg">
                  <span>Average</span>
                  <span className="adb-val">{pct(overall.iou?.average)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: By Region ── */}
      {byRegion && (
        <div className="adb-section">
          <div className="adb-section-header">
            <h3 className="adb-section-title"> Performance by Tumor Region</h3>
          </div>
          <div className="adb-region-grid">
            <div className="adb-region-card blue">
              <div className="adb-region-title">Whole Tumor (WT)</div>
              <div className="adb-region-subtitle">Includes all tumor sub-regions</div>
              <div className="adb-region-metrics">
                <div className="adb-region-metric">
                  <span className="adb-region-metric-val">{pct(byRegion.wholeTumor?.dsc)}</span>
                  <span className="adb-region-metric-label">DSC</span>
                </div>
                <div className="adb-region-metric">
                  <span className="adb-region-metric-val">{pct(byRegion.wholeTumor?.iou)}</span>
                  <span className="adb-region-metric-label">IoU</span>
                </div>
              </div>
            </div>
            <div className="adb-region-card green">
              <div className="adb-region-title">Tumor Core (TC)</div>
              <div className="adb-region-subtitle">Necrosis + Enhancing Tumor</div>
              <div className="adb-region-metrics">
                <div className="adb-region-metric">
                  <span className="adb-region-metric-val">{pct(byRegion.tumorCore?.dsc)}</span>
                  <span className="adb-region-metric-label">DSC</span>
                </div>
                <div className="adb-region-metric">
                  <span className="adb-region-metric-val">{pct(byRegion.tumorCore?.iou)}</span>
                  <span className="adb-region-metric-label">IoU</span>
                </div>
              </div>
            </div>
            <div className="adb-region-card orange">
              <div className="adb-region-title">Enhancing Tumor (ET)</div>
              <div className="adb-region-subtitle">Active tumor region (T1CE)</div>
              <div className="adb-region-metrics">
                <div className="adb-region-metric">
                  <span className="adb-region-metric-val">{pct(byRegion.enhancingTumor?.dsc)}</span>
                  <span className="adb-region-metric-label">DSC</span>
                </div>
                <div className="adb-region-metric">
                  <span className="adb-region-metric-val">{pct(byRegion.enhancingTumor?.iou)}</span>
                  <span className="adb-region-metric-label">IoU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 4: Training Summary ── */}
      {trainingSummary && (
        <div className="adb-section">
          <div className="adb-section-header">
            <h3 className="adb-section-title">Model Comparison</h3>
            <span className="adb-badge green">Training Summary</span>
          </div>
          <table className="adb-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>DSC — WT</th>
                <th>DSC — TC</th>
                <th>DSC — ET</th>
                <th>Epoch Time / Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="adb-model-badge">Baseline ARU-GD</span></td>
                <td className="adb-td-val">{pct(trainingSummary.baselineARUGD?.dscWT)}</td>
                <td className="adb-td-val">{pct(trainingSummary.baselineARUGD?.dscTC)}</td>
                <td className="adb-td-val">{pct(trainingSummary.baselineARUGD?.dscET)}</td>
                <td className="adb-td-note">{trainingSummary.baselineARUGD?.avgEpochTime}</td>
              </tr>
              <tr>
                <td><span className="adb-model-badge">ARU-GD + CBAM</span></td>
                <td className="adb-td-val">{pct(trainingSummary.arugdWithCBAM?.dscWT)}</td>
                <td className="adb-td-val">{pct(trainingSummary.arugdWithCBAM?.dscTC)}</td>
                <td className="adb-td-val">{pct(trainingSummary.arugdWithCBAM?.dscET)}</td>
                <td className="adb-td-note">{trainingSummary.arugdWithCBAM?.avgEpochTime}</td>
              </tr>
              <tr>
                <td><span className="adb-model-badge">CBAM + Focal Loss</span></td>
                <td className="adb-td-val">{pct(trainingSummary.cbamWithFocalLoss?.dscWT)}</td>
                <td className="adb-td-val">{pct(trainingSummary.cbamWithFocalLoss?.dscTC)}</td>
                <td className="adb-td-val">{pct(trainingSummary.cbamWithFocalLoss?.dscET)}</td>
                <td className="adb-td-note">{trainingSummary.cbamWithFocalLoss?.avgEpochTime}</td>
              </tr>
              <tr className="adb-ensemble-row">
                <td><span className="adb-model-badge ensemble"> Ensemble</span></td>
                <td className="adb-td-val best">{pct(trainingSummary.probabilityAveragingEnsemble?.dscWT)}</td>
                <td className="adb-td-val best">{pct(trainingSummary.probabilityAveragingEnsemble?.dscTC)}</td>
                <td className="adb-td-val best">{pct(trainingSummary.probabilityAveragingEnsemble?.dscET)}</td>
                <td className="adb-td-note">{trainingSummary.probabilityAveragingEnsemble?.improvement}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;