import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { api } from "./services/api";
import "./caseDetails.css";

const CaseDetailsPage = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [segmentation, setSegmentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageData, setImageData] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [acquisitionParams, setAcquisitionParams] = useState(null);

  // Get rejected scans from localStorage
  const getRejectedScans = () => {
    const rejected = localStorage.getItem('rejectedScans');
    return rejected ? JSON.parse(rejected) : {};
  };

  const isScanRejected = (scanId) => {
    const rejected = getRejectedScans();
    return rejected[scanId] === true;
  };

  const markScanAsRejected = (scanId) => {
    const rejected = getRejectedScans();
    rejected[scanId] = true;
    localStorage.setItem('rejectedScans', JSON.stringify(rejected));
  };

  const removeScanFromRejected = (scanId) => {
    const rejected = getRejectedScans();
    delete rejected[scanId];
    localStorage.setItem('rejectedScans', JSON.stringify(rejected));
  };

  useEffect(() => {
    loadScanDetails();
    loadSegmentationResult();
    loadAcquisitionParameters();
  }, [id]);

  useEffect(() => {
    if (segmentation && segmentation.resultPath) {
      loadImageAsBase64();
    }
  }, [segmentation]);

  const loadScanDetails = async () => {
    try {
      const scanData = await api.getScanById(id);
      setScan(scanData);
    } catch (err) {
      console.error("Failed to load scan:", err);
    }
  };

  const loadSegmentationResult = async () => {
    try {
      const result = await api.getSegmentationResult(id);
      setSegmentation(result);
      setErrorMessage(null);
    } catch (err) {
      console.error("No segmentation result yet:", err);
      setSegmentation(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAcquisitionParameters = async () => {
    try {
      const params = await api.getParameters(id);
      setAcquisitionParams(params);
    } catch (err) {
      console.log("No acquisition parameters found for this scan");
      setAcquisitionParams(null);
    }
  };

  const loadImageAsBase64 = async () => {
    setImageLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/results/scan_${id}_overlay.png`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.data && data.mimeType) {
        const imageUrl = `data:${data.mimeType};base64,${data.data}`;
        setImageData(imageUrl);
      }
    } catch (err) {
      console.error("Failed to load image:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleRunSegmentation = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await api.runSegmentation(id);
      setSegmentation(result);
    } catch (err) {
      setErrorMessage("Segmentation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setErrorMessage(null);
    try {
      await api.validateResult(segmentation.id);
      const doctorName = localStorage.getItem('doctorName') || localStorage.getItem('email')?.split('@')[0] || "Doctor";
      setSegmentation({ 
        ...segmentation, 
        validated: true, 
        validatedBy: doctorName 
      });
      removeScanFromRejected(id);
    } catch (err) {
      setErrorMessage("Failed to validate: " + err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    setErrorMessage(null);
    try {
      await api.invalidateResult(segmentation.id);
      const doctorName = localStorage.getItem('doctorName') || localStorage.getItem('email')?.split('@')[0] || "Doctor";
      markScanAsRejected(id);
      setSegmentation({ 
        ...segmentation, 
        validated: false, 
        validatedBy: doctorName 
      });
      setErrorMessage("❌ Result rejected.");
    } catch (err) {
      setErrorMessage("Failed to reject: " + err.message);
    } finally {
      setRejecting(false);
    }
  };

  // Helper to get display text
  const getValidatedDisplay = () => {
    if (!segmentation) return "N/A";
    if (segmentation.validated === true) return "Yes";
    if (isScanRejected(id)) return "No";
    if (segmentation.validated === false) return "N/A";
    return "N/A";
  };

  const getValidatedColor = () => {
    if (!segmentation) return "#999";
    if (segmentation.validated === true) return "#28a745";
    if (isScanRejected(id)) return "#dc3545";
    return "#999";
  };

  // Get the doctor's name
  const getValidatedByDisplay = () => {
    if (segmentation && segmentation.validatedBy) {
      return segmentation.validatedBy;
    }
    if (segmentation && segmentation.validated === true) {
      return segmentation.validatedBy || "Doctor";
    }
    if (isScanRejected(id)) {
      return segmentation?.validatedBy || "Doctor";
    }
    return "-";
  };

  // Show buttons only when segmentation exists and not validated and not rejected
  const showActionButtons = () => {
    return segmentation && 
           segmentation.validated === false && 
           !isScanRejected(id) &&
           segmentation.resultPath;
  };

  // Show success message when validated
  const showSuccessMessage = () => {
    return segmentation && segmentation.validated === true;
  };

  // Show rejection message when rejected
  const showRejectionMessage = () => {
    return segmentation && segmentation.validated === false && isScanRejected(id);
  };

  // Check if acquisition parameters exist
  const hasAcquisitionParams = () => {
    return acquisitionParams && (
      acquisitionParams.scannerModel ||
      acquisitionParams.fieldStrength ||
      acquisitionParams.sliceThickness ||
      acquisitionParams.contrastAgent ||
      acquisitionParams.notes
    );
  };

  if (loading) return <div className="dashboard"><div className="content">Loading...</div></div>;
  if (!scan) return <div className="dashboard"><div className="content">Scan not found</div></div>;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <Header />
        <div className="details-container">
          <h2>Case Details - Scan #{scan.id}</h2>

          <div className="patient-info">
            <p><strong>Patient Name:</strong> {scan.patientName || "N/A"}</p>
            <p><strong>Patient ID:</strong> {scan.patientId || "N/A"}</p>
            <p><strong>Upload Date:</strong> {new Date(scan.uploadDate).toLocaleDateString()}</p>
            <p><strong>Uploaded By:</strong> {scan.uploadedByName} ({scan.uploadedByRole})</p>
          </div>

          {/* Acquisition Parameters Section - Only show if they exist */}
          {hasAcquisitionParams() && (
            <div style={{ 
              marginTop: '20px', 
              marginBottom: '20px', 
              padding: '15px', 
              background: '#e8f4f8', 
              borderRadius: '8px',
              border: '1px solid #b8d9e8'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0d6efd' }}>📋 Acquisition Parameters</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {acquisitionParams?.scannerModel && (
                  <div><strong>Scanner Model:</strong> {acquisitionParams.scannerModel}</div>
                )}
                {acquisitionParams?.fieldStrength && (
                  <div><strong>Field Strength:</strong> {acquisitionParams.fieldStrength}</div>
                )}
                {acquisitionParams?.sliceThickness && (
                  <div><strong>Slice Thickness:</strong> {acquisitionParams.sliceThickness}</div>
                )}
                {acquisitionParams?.contrastAgent && (
                  <div><strong>Contrast Agent:</strong> {acquisitionParams.contrastAgent}</div>
                )}
                {acquisitionParams?.acquisitionDate && (
                  <div><strong>Acquisition Date:</strong> {new Date(acquisitionParams.acquisitionDate).toLocaleDateString()}</div>
                )}
              </div>
              {acquisitionParams?.notes && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Notes:</strong> {acquisitionParams.notes}
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div style={{ 
              padding: '10px', 
              marginBottom: '20px', 
              backgroundColor: '#f8d7da', 
              color: '#721c24',
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}>
              {errorMessage}
            </div>
          )}

          <h3>Segmentation Result</h3>
          
          {segmentation && segmentation.resultPath ? (
            <div>
              {/* Rejection message banner */}
              {showRejectionMessage() && (
                <div style={{ 
                  padding: '12px', 
                  marginBottom: '20px', 
                  backgroundColor: '#f8d7da', 
                  color: '#dc3545',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  ❌ This segmentation result has been rejected by Dr. {getValidatedByDisplay()}
                </div>
              )}

              {/* Success message banner */}
              {showSuccessMessage() && (
                <div style={{ 
                  padding: '12px', 
                  marginBottom: '20px', 
                  backgroundColor: '#d4edda', 
                  color: '#28a745',
                  borderRadius: '8px',
                  border: '1px solid #c3e6cb',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  ✅ This result has been validated and approved by Dr. {getValidatedByDisplay()}
                </div>
              )}

              {/* Segmentation Image */}
              <div className="result-box" style={{ textAlign: 'center' }}>
                {imageLoading && <p>Loading image...</p>}
                {imageData && (
                  <img
                    src={imageData}
                    alt="Segmentation Result"
                    onClick={() => {
                      setSelectedImage(imageData);
                      setZoom(1);
                    }}
                    style={{ 
                      width: '70%',
                      maxHeight: '500px', 
                      objectFit: 'contain',
                      cursor: 'pointer', 
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      margin: '0 auto',
                      display: 'block'
                    }}
                  />
                )}
              </div>
              
              {/* Validation Info - Simple layout */}
              <div className="validation-info" style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: '#f5f5f5', 
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong>Validated:</strong>{' '}
                    <span style={{ 
                      color: getValidatedColor(),
                      fontWeight: 'bold'
                    }}>
                      {getValidatedDisplay()}
                    </span>
                  </div>
                  
                  {(showSuccessMessage() || showRejectionMessage()) && (
                    <div>
                      <strong>Validated By:</strong>{' '}
                      Dr. {getValidatedByDisplay()}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons - Only show when not validated and not rejected */}
                {showActionButtons() && (
                  <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button 
                      onClick={handleReject}
                      disabled={rejecting}
                      style={{ 
                        padding: '10px 20px', 
                        background: rejecting ? '#ccc' : '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: rejecting ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {rejecting ? "Rejecting..." : " Reject"}
                    </button>
                    <button 
                      onClick={handleValidate}
                      disabled={validating}
                      style={{ 
                        padding: '10px 20px', 
                        background: validating ? '#ccc' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: validating ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {validating ? "Validating..." : " Validate"}
                    </button>
                    
                    
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f0f0f0', borderRadius: '8px' }}>
              <p style={{ color: '#999', fontSize: '18px' }}>⚪ No Segmentation Yet</p>
              <p>Run AI segmentation to analyze this MRI scan.</p>
              <button 
                onClick={handleRunSegmentation}
                style={{ 
                  padding: '10px 20px', 
                  background: '#2a7be4', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  marginTop: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => e.target.style.background = '#1b5fd1'}
                onMouseLeave={(e) => e.target.style.background = '#2a7be4'}
              >
                Run AI Segmentation
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-controls">
              <button onClick={() => setZoom(z => z + 0.2)}>Zoom +</button>
              <button onClick={() => setZoom(z => z - 0.2)}>Zoom -</button>
              <button onClick={() => setSelectedImage(null)}>Close</button>
            </div>
            <img 
              src={selectedImage} 
              alt="Zoom" 
              style={{ 
                transform: `scale(${zoom})`, 
                transition: 'transform 0.2s',
                maxWidth: '90vw',
                maxHeight: '90vh'
              }} 
            />
          </div>
        </div>
      )}
      
    </div>
  );
};

export default CaseDetailsPage;