import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../services/firebase";
import './PatientDashboard.css';

export function PatientDashboard() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fileType, setFileType] = useState(''); // 'image' or 'video'
    
    const auth = getAuth(app);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data when component mounts
        const fetchUserData = async () => {
            try {
                const currentUser = auth.currentUser;
                
                if (!currentUser) {
                    setError('Please login first');
                    setLoading(false);
                    return;
                }

                console.log('Fetching data for user:', currentUser.email);
                
                const response = await fetch(`http://localhost:5000/api/user/${currentUser.email}`);
                const result = await response.json();

                if (result.success) {
                    console.log('User data received:', result.data);
                    setUserData(result.data);
                } else {
                    setError(result.message || 'Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            
            // Determine file type
            if (file.type.startsWith('image/')) {
                setFileType('image');
            } else if (file.type.startsWith('video/')) {
                setFileType('video');
            }
            
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    // Handle file upload and analysis
    const handleAnalyze = async () => {
        if (!selectedFile) {
            alert('Please select an image or video first');
            return;
        }

        setUploading(true);
        
        try {
            const currentUser = auth.currentUser;
            
            // Create FormData to send file
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('email', currentUser.email);
            formData.append('fileType', fileType);
            
            // Send to server
            const response = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Navigate to results page with analysis data
                navigate('/result', { 
                    state: { 
                        analysisData: result.data,
                        userData: userData 
                    } 
                });
            } else {
                alert('Analysis failed: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error during analysis:', err);
            alert('Failed to analyze. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Clear selected file
    const handleClearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileType('');
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-error">
                    <h2 className="error-title">Error</h2>
                    <p className="error-message">{error}</p>
                    <Link to="/"><button className="btn-primary">Go to Login</button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-wrapper">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Welcome, {userData?.name || 'User'}!</h1>
                    <div className="dashboard-actions">
                        <Link to="/Details"><button>Update Details</button></Link>
                        <Link to="/"><button>Logout</button></Link>
                    </div>
                </div>

                <div className="dashboard-content">
                    {/* Upload Section */}
                    <div className="upload-section">
                        <h3 className="upload-header">Upload for Analysis</h3>

                        <div className="upload-zone">
                            <div className="upload-input">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </div>

                            {/* Preview */}
                            {previewUrl && (
                                <div className="preview-section">
                                    <h4 className="preview-title">Preview:</h4>
                                    {fileType === 'image' ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="preview-image"
                                        />
                                    ) : (
                                        <video
                                            src={previewUrl}
                                            controls
                                            className="preview-video"
                                        />
                                    )}
                                    <div className="preview-actions">
                                        <button
                                            className="btn-clear"
                                            onClick={handleClearFile}
                                            disabled={uploading}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Analyze Button */}
                            <button
                                className={`btn-analyze ${(!selectedFile || uploading) ? 'disabled' : ''}`}
                                onClick={handleAnalyze}
                                disabled={!selectedFile || uploading}
                            >
                                {uploading ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="info-section">
                        <h3 className="section-title">Personal Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{userData?.name || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{userData?.email || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Age:</span>
                                <span className={`info-value ${!userData?.age ? 'missing' : ''}`}>
                                    {userData?.age || 'Please update your data'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Weight:</span>
                                <span className={`info-value ${!userData?.weight ? 'missing' : ''}`}>
                                    {userData?.weight ? `${userData.weight} kg` : 'Please update your data'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Height:</span>
                                <span className={`info-value ${!userData?.height ? 'missing' : ''}`}>
                                    {userData?.height ? `${userData.height} cm` : 'Please update your data'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Injury:</span>
                                <span className={`info-value ${!userData?.injury?.description ? 'missing' : ''}`}>
                                    {userData?.injury?.description || 'Please update your data'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Medical History */}
                    <div className="info-section">
                        <h3 className="section-title">Medical History</h3>
                        <p className={`medical-history-text ${!userData?.medicalHistory ? 'missing' : ''}`}>
                            {userData?.medicalHistory || 'Please update your data'}
                        </p>
                    </div>

                    {/* Last Analysis */}
                    <div className="info-section">
                        <h3 className="section-title">Last Analysis</h3>
                        {userData?.lastAnalysis ? (
                            <div className="analysis-item">
                                <div className="analysis-detail">
                                    <span className="analysis-label">Date:</span>
                                    <span className="analysis-value">{new Date(userData.lastAnalysis.date).toLocaleString()}</span>
                                </div>
                                <div className="analysis-detail">
                                    <span className="analysis-label">Result:</span>
                                    <span className="analysis-value">{userData.lastAnalysis.result}</span>
                                </div>
                                <div className="analysis-detail">
                                    <span className="analysis-label">Severity:</span>
                                    <span className="analysis-value">{userData.lastAnalysis.severity}</span>
                                </div>
                                <div className="analysis-detail">
                                    <span className="analysis-label">Recommendations:</span>
                                    <span className="analysis-value">{userData.lastAnalysis.recommendations}</span>
                                </div>
                                {userData.lastAnalysis.imageUrl && (
                                    <img
                                        src={userData.lastAnalysis.imageUrl}
                                        alt="Analysis"
                                        className="analysis-image"
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="info-value missing">No analysis available. Please update your data</p>
                        )}
                        <div className="analysis-summary">
                            Total Analyses: {userData?.totalAnalyses || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}