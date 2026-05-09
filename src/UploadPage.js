import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { api } from "./services/api";
import "./upload.css";

const UploadPage = () => {
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState({
    t1: null,
    t2: null,
    t1ce: null,
    flair: null,
  });

  const handleFileChange = (type, file) => {
    setFiles({ ...files, [type]: file });
  };

  const handleSubmit = async () => {
    // Validation
    if (!patientId) {
      setMessage("Please enter Patient ID");
      return;
    }
    if (!doctorId) {
      setMessage("Please enter Doctor ID");
      return;
    }
    if (!files.t1 || !files.t2 || !files.t1ce || !files.flair) {
      setMessage("Please upload all 4 MRI sequences");
      return;
    }

    setLoading(true);
    setMessage("Uploading MRI scans...");

    try {
      // STEP 1: Upload the scan
      const scanResult = await api.uploadScan(patientId, doctorId, files);
      const scanId = scanResult.id;
      setMessage(`✅ Upload successful! Scan ID: ${scanId}. Starting AI segmentation...`);

      // STEP 2: Run segmentation on the uploaded scan
      const segmentationResult = await api.runSegmentation(scanId);
      setMessage(`✅ AI Segmentation completed! Result ID: ${segmentationResult.id || segmentationResult.resultId}`);
      
      // Display metrics if available
      if (segmentationResult.dscWT) {
        setMessage(prev => prev + ` | DSC Scores - Whole Tumor: ${segmentationResult.dscWT}, Tumor Core: ${segmentationResult.dscTC}, Enhancing: ${segmentationResult.dscET}`);
      }
      
      // Clear form after successful upload & segmentation
      setPatientId("");
      setDoctorId("");
      setFiles({ t1: null, t2: null, t1ce: null, flair: null });
      
      // Optional: Show success notification
      setTimeout(() => {
        setMessage("");
      }, 10000);
      
    } catch (err) {
      setMessage(`❌ Failed: ${err.message}`);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <Header />
        <div className="upload-container">
          <h2>Upload MRI Scans</h2>
          <p>Upload brain MRI scans for AI-assisted tumor segmentation</p>

          {message && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              borderRadius: '8px',
              border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label>Patient ID</label>
            <input
              type="text"
              placeholder="Enter patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Doctor ID</label>
            <input
              type="text"
              placeholder="Enter doctor ID"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="upload-grid">
            <div className="upload-box">
              <p>T1</p>
              <label className="custom-file-btn">
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange("t1", e.target.files[0])}
                  disabled={loading}
                />
              </label>
              <span>{files.t1?.name || "No file chosen"}</span>
            </div>

            <div className="upload-box">
              <p>T2</p>
              <label className="custom-file-btn">
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange("t2", e.target.files[0])}
                  disabled={loading}
                />
              </label>
              <span>{files.t2?.name || "No file chosen"}</span>
            </div>

            <div className="upload-box">
              <p>T1ce</p>
              <label className="custom-file-btn">
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange("t1ce", e.target.files[0])}
                  disabled={loading}
                />
              </label>
              <span>{files.t1ce?.name || "No file chosen"}</span>
            </div>

            <div className="upload-box">
              <p>FLAIR</p>
              <label className="custom-file-btn">
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange("flair", e.target.files[0])}
                  disabled={loading}
                />
              </label>
              <span>{files.flair?.name || "No file chosen"}</span>
            </div>
          </div>

          <button
            className="start-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#6c757d' : '#2a7be4',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Processing..." : "Upload & Run AI Segmentation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;