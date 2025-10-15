import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { app } from '../services/firebase';
import './PatientDetails.css';

export function PatientDetails() {
    const navigate = useNavigate();
    const auth = getAuth(app);
    
    const [formData, setFormData] = useState({
        age: '',
        height: '',
        weight: '',
        medicalHistory: '',
        injury: '',
        allergies: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Get current user email
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUserEmail(currentUser.email);
            // Optionally fetch existing user data
            fetchUserData(currentUser.email);
        } else {
            setError('Please login first');
            setTimeout(() => navigate('/'), 2000);
        }
    }, [auth, navigate]);

    // Fetch existing user data
    const fetchUserData = async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/${email}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                setFormData({
                    age: data.data.age || '',
                    height: data.data.height || '',
                    weight: data.data.weight || '',
                    medicalHistory: data.data.medicalHistory || '',
                    injury: data.data.injury?.description || '',
                    allergies: Array.isArray(data.data.allergies) ? data.data.allergies.join(', ') : (data.data.allergies || '')
                });
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (!formData.age || !formData.height || !formData.weight) {
            setError('Please fill in age, height, and weight');
            setLoading(false);
            return;
        }

        if (formData.age < 0 || formData.age > 150) {
            setError('Please enter a valid age');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/patient-details', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    age: formData.age,
                    height: formData.height,
                    weight: formData.weight,
                    medicalHistory: formData.medicalHistory,
                    injury: formData.injury,
                    allergies: typeof formData.allergies === 'string' ? formData.allergies : JSON.stringify(formData.allergies)
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Patient details updated successfully!');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setError(data.message || 'Failed to update details');
            }
        } catch (err) {
            console.error('Error updating patient details:', err);
            setError('Failed to update details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-details-container">
            <div className="patient-details-card">
                <h1 className="form-title">Patient Details</h1>
                <p className="form-subtitle">Please provide your medical information</p>
                
                <form onSubmit={handleSubmit} className="details-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="age">Age *</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter your age"
                                required
                                min="0"
                                max="150"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="height">Height (cm) *</label>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                placeholder="Enter height in cm"
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="weight">Weight (kg) *</label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="Enter weight in kg"
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="medicalHistory">Medical History</label>
                        <textarea
                            id="medicalHistory"
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={handleChange}
                            placeholder="Describe your medical history (e.g., chronic conditions, past surgeries, medications)"
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="injury">Current Injury/Wound Description</label>
                        <textarea
                            id="injury"
                            name="injury"
                            value={formData.injury}
                            onChange={handleChange}
                            placeholder="Describe your current injury or wound"
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="allergies">Allergies</label>
                        <textarea
                            id="allergies"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            placeholder="List any allergies (medications, food, environmental)"
                            rows="3"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => navigate('/dashboard')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Details'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}