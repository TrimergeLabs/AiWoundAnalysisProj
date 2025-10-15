import React from 'react';
import './LoginSignup.css';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth
} from "firebase/auth";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {app} from "../../services/firebase";

import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignup = () => {
    const [email,setEmail]= useState('');
    const [name,setName]=useState('');
    const [password,setPassword]=useState('');
    const[loginError,setLoginError]=useState('');
    const navigate = useNavigate();

    const auth=getAuth(app);

    //unified authentication handler - tries login first, then signup if user doesn't exist
    const HandleAuth = async(e) => {
        e.preventDefault();
        console.log('🟣 HandleAuth called with:', { email, name, hasPassword: !!password });
        
        // Validation
        if (!email || !password) {
            setLoginError('Please enter email and password');
            return;
        }
        
        if (password.length < 6) {
            setLoginError('Password should be at least 6 characters');
            return;
        }
        
        setLoginError(''); // Clear any previous errors
        
        try {
            // First, try to login
            console.log('🔵 Attempting to login...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Login successful!', userCredential.user.email);
            
            // Send data to backend
            console.log('🔵 Sending data to backend server...');
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, name })
            });
            
            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log("✅ Server response:", data);
            
            if (data.exists) {
                console.log("✅ Welcome back!", data.data);
                if (data.data.lastAnalysis) {
                    console.log("Last analysis:", data.data.lastAnalysis);
                }
            }
            
            console.log("✅ Authentication successful!");
            navigate('/dashboard');
            
        } catch (error) {
            console.error('❌ Login attempt failed:', error.code);
            
            // If user doesn't exist, try to sign them up
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                console.log('🟢 User not found. Attempting to sign up...');
                
                if (!name) {
                    setLoginError('Please enter your name to create a new account');
                    return;
                }
                
                try {
                    console.log('🟢 Creating new Firebase user...');
                    const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                    console.log('✅ New user created!', newUserCredential.user.email);
                    
                    // Send data to backend
                    console.log('🟢 Sending new user data to backend...');
                    const res = await fetch('http://localhost:5000/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ email, name })
                    });
                    
                    if (!res.ok) {
                        throw new Error(`Server responded with status: ${res.status}`);
                    }
                    
                    const data = await res.json();
                    console.log("✅ Server response:", data);
                    console.log("✅ New account created successfully!");
                    navigate('/Patient');
                    
                } catch (signupError) {
                    console.error('❌ Signup failed:', signupError);
                    
                    if (signupError.code === 'auth/email-already-in-use') {
                        setLoginError('Email already in use. Please check your password and try again.');
                    } else if (signupError.code === 'auth/weak-password') {
                        setLoginError('Password should be at least 6 characters.');
                    } else if (signupError.code === 'auth/invalid-email') {
                        setLoginError('Please enter a valid email address.');
                    } else {
                        setLoginError(`Authentication failed: ${signupError.message}`);
                    }
                }
            } else if (error.code === 'auth/wrong-password') {
                setLoginError('Incorrect password. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                setLoginError('Please enter a valid email address.');
            } else if (error.code === 'auth/too-many-requests') {
                setLoginError('Too many failed attempts. Please try again later.');
            } else {
                setLoginError(`Authentication failed: ${error.message}`);
            }
        }
    }
    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>Welcome</div>
                <div className='underline'></div>
            </div>
            <div className="inputs">
                <div className='input'>
                    <img src={user_icon} alt=""/>
                    <input type="text" placeholder='Name (required for new accounts)' value={name} onChange={(e)=>setName(e.target.value)} />
                </div>
                <div className="input">
                    <img src={email_icon} alt=""/>
                    <input type="email" placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div className="input">
                    <img src={password_icon} alt=""/>
                    <input type="password" placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} />
                </div>
            </div>
            {loginError && <div className="error-message" style={{color: 'red', textAlign: 'center', margin: '10px 0'}}>{loginError}</div>}
            <div className="forgot-password">Forgot Password? <span>Click Here!</span></div>
            <div className="submit-container">
                <button className="submit" onClick={HandleAuth}>Continue</button>
            </div>
        </div>
    )
}

export default LoginSignup;