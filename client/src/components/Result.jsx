import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import './Result.css';

export function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const analysisData = location.state?.analysisData;
    const userData = location.state?.userData;

    useEffect(() => {
        // Redirect to dashboard if no data
        if (!analysisData) {
            navigate('/dashboard');
        }
    }, [analysisData, navigate]);

    if (!analysisData) {
        return (
            <div className="result-container">
                <div className="result-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'severe': return 'severe';
            case 'moderate': return 'moderate';
            case 'mild': return 'mild';
            default: return 'default';
        }
    };

    return (
        <div className="result-container">
            <div className="result-wrapper">
                <div className="result-header">
                    <h1 className="result-title">Analysis Results</h1>
                    <div className="result-actions">
                        <Link to="/dashboard"><button>Back to Dashboard</button></Link>
                    </div>
                </div>

                <div className="result-content">
                    {/* Result Summary */}
                    <div className="result-summary">
                        <h2 className="summary-header">Analysis Complete</h2>
                        <div className="summary-item">
                            <span className="summary-label">Date:</span>
                            <span className="summary-value">{new Date(analysisData.date).toLocaleString()}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Severity:</span>
                            <span className={`severity-badge ${getSeverityColor(analysisData.severity)}`}>
                                {analysisData.severity}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Result:</span>
                            <span className="summary-value">{analysisData.result}</span>
                        </div>
                        {analysisData.confidence && (
                            <div className="summary-item">
                                <span className="summary-label">Healing Progress:</span>
                                <span className="summary-value">{analysisData.confidence}%</span>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    <div className="recommendations-section">
                        <h3 className="recommendations-header">Recommendations</h3>
                        <p className="recommendations-text">{analysisData.recommendations}</p>
                    </div>

                    {/* Uploaded Image/Video */}
                    {analysisData.imageUrl && (
                        <div className="media-section">
                            <h3 className="media-header">Uploaded {analysisData.fileType}</h3>
                            {analysisData.fileType === 'video' ? (
                                <video src={analysisData.imageUrl} controls className="media-content" />
                            ) : (
                                <img src={analysisData.imageUrl} alt="Wound" className="media-content" />
                            )}
                        </div>
                    )}

                    {/* Wound Details */}
                    {analysisData.additionalData?.woundDetails?.length > 0 && (
                        <div className="wound-details-section">
                            <h3 className="wound-details-header">Wound Details</h3>
                            <div className="wound-summary">
                                <span className="wound-summary-label">Total Wounds:</span>
                                <span className="wound-summary-value">{analysisData.additionalData.totalWounds}</span>
                            </div>

                            {analysisData.additionalData.woundDetails.map((wound, index) => (
                                <div key={index} className={`wound-item ${getSeverityColor(wound.condition)}`}>
                                    <h4 className="wound-item-title">Wound #{index + 1}</h4>
                                    <div className="wound-detail">
                                        <span className="wound-detail-label">Condition:</span>
                                        <span className="wound-detail-value">{wound.condition}</span>
                                    </div>
                                    <div className="wound-detail">
                                        <span className="wound-detail-label">Area:</span>
                                        <span className="wound-detail-value">{wound.area_cm2} cm²</span>
                                    </div>
                                    <div className="wound-detail">
                                        <span className="wound-detail-label">Healing Progress:</span>
                                        <span className="wound-detail-value">{wound.healing_progress}%</span>
                                    </div>
                                    {wound.pus_detected && (
                                        <div className="pus-warning">
                                            ⚠️ Pus Detected
                                        </div>
                                    )}
                                    {wound.alerts?.length > 0 && (
                                        <div className="wound-alert">
                                            <strong>Alerts:</strong>
                                            {wound.alerts.map((alert, i) => (
                                                <div key={i}>• {alert}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="result-actions-container">
                        <div className="action-buttons">
                            <button className="btn-dashboard" onClick={() => navigate('/dashboard')}>
                                Back to Dashboard
                            </button>
                            <button className="btn-print" onClick={() => window.print()}>
                                Print Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
