import React, { useState } from "react";
import Sidebar from "./sidebart";
import Header from "./headert";
import { api } from "./services/api";
import "./uploads.css";

const TechnicianUploadPage = () => {
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

  const [params, setParams] = useState({
    scannerModel: "Siemens",
    fieldStrength: 1.5,      // Change to number
    sliceThickness: 1.0,     // Change to number
    contrastAgent: "None",
    notes: "",
  });

  const handleFileChange = (type, file) => {
    setFiles({ ...files, [type]: file });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Convert numeric values
    if (name === 'fieldStrength') {
      newValue = parseFloat(value);
    }
    if (name === 'sliceThickness') {
      newValue = parseFloat(value);
    }
    
    setParams({ ...params, [name]: newValue });
  };

  const handleSubmit = async () => {
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
      // Step 1: Upload the scan
      const scanResult = await api.uploadScan(patientId, doctorId, files);
      const scanId = scanResult.id;
      
      // Step 2: Record acquisition parameters with numeric values
      const parametersToSend = {
        scannerModel: params.scannerModel,
        fieldStrength: params.fieldStrength,  // This is now a number (1.5 or 3.0)
        sliceThickness: params.sliceThickness, // This is now a number
        contrastAgent: params.contrastAgent,
        notes: params.notes,
        acquisitionDate: new Date().toISOString().split('T')[0]
      };
      
      await api.recordParameters(scanId, parametersToSend);
      
      setMessage(`✅ Upload successful! Scan ID: ${scanId}. The assigned doctor can now view and segment this case.`);
      
      // Clear form
      setPatientId("");
      setDoctorId("");
      setFiles({ t1: null, t2: null, t1ce: null, flair: null });
      setParams({
        scannerModel: "Siemens",
        fieldStrength: 1.5,
        sliceThickness: 1.0,
        contrastAgent: "None",
        notes: "",
      });
      
    } catch (err) {
      setMessage(`❌ Upload failed: ${err.message}`);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <Header technicianName={localStorage.getItem('doctorName') || "Technician"} today={new Date().toLocaleDateString()} />
        <div className="upload-container">
          <h2>Upload MRI Scans</h2>
          <p>Upload brain MRI scans. The assigned doctor will review and run AI segmentation.</p>
          
          {message && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              borderRadius: '8px'
            }}>
              {message}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Doctor ID</label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Enter assigned doctor ID"
                disabled={loading}
              />
            </div>
          </div>

          <div className="upload-grid">
            <div className="upload-box">
              <p>T1</p>
              <label className="custom-file-btn">
                Choose File
                <input type="file" hidden onChange={(e) => handleFileChange("t1", e.target.files[0])} disabled={loading} />
              </label>
              <span>{files.t1?.name || "No file chosen"}</span>
            </div>

            <div className="upload-box">
              <p>T2</p>
              <label className="custom-file-btn">
                Choose File
                <input type="file" hidden onChange={(e) => handleFileChange("t2", e.target.files[0])} disabled={loading} />
              </label>
              <span>{files.t2?.name || "No file chosen"}</span>
            </div>

            <div className="upload-box">
              <p>T1ce</p>
              <label className="custom-file-btn">
                Choose File
                <input type="file" hidden onChange={(e) => handleFileChange("t1ce", e.target.files[0])} disabled={loading} />
              </label>
              <span>{files.t1ce?.name || "No file chosen"}</span>
            </div>

            <div className="upload-box">
              <p>FLAIR</p>
              <label className="custom-file-btn">
                Choose File
                <input type="file" hidden onChange={(e) => handleFileChange("flair", e.target.files[0])} disabled={loading} />
              </label>
              <span>{files.flair?.name || "No file chosen"}</span>
            </div>
          </div>

          <div className="params-row">
            <div className="form-group small">
              <label>Scanner Model</label>
              <select name="scannerModel" onChange={handleChange} value={params.scannerModel}>
                <option value="Siemens">Siemens</option>
                <option value="GE">GE</option>
                <option value="Philips">Philips</option>
                <option value="Canon">Canon</option>
              </select>
            </div>

            <div className="form-group small">
              <label>Field Strength (T)</label>
              <select name="fieldStrength" onChange={handleChange} value={params.fieldStrength}>
                <option value="1.5">1.5T</option>
                <option value="3.0">3T</option>
              </select>
            </div>

            <div className="form-group small">
              <label>Slice Thickness (mm)</label>
              <select name="sliceThickness" onChange={handleChange} value={params.sliceThickness}>
                <option value="1.0">1 mm</option>
                <option value="2.0">2 mm</option>
                <option value="3.0">3 mm</option>
                <option value="5.0">5 mm</option>
              </select>
            </div>

            <div className="form-group small">
              <label>Contrast Agent</label>
              <select name="contrastAgent" onChange={handleChange} value={params.contrastAgent}>
                <option value="None">None</option>
                <option value="Gadolinium">Gadolinium</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              onChange={handleChange}
              value={params.notes}
              placeholder="Optional notes about the scan..."
              rows="3"
            />
          </div>

          <button
            className="start-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload MRI Scans"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianUploadPage;