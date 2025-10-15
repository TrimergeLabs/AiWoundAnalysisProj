const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const User = require('./models/User');

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Enabling cors
app.use(cors({
    origin: 'http://localhost:3000', // react app
    credentials: true
}));

app.use(express.json()); // middleware to parse JSON body
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
    console.log("Incoming Request:", {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body
    });
    next();
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|mp4|avi|mov|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: fileFilter
});

// Mongo connection
mongoose.set('strictQuery', true);

let dbConnected = false;

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/wound-analysis-db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB: wound-analysis-db');
        dbConnected = true;
    } catch (err) {
        console.error('❌ MongoDB connection error:', {
            message: err.message,
            code: err.code,
            name: err.name
        });
        setTimeout(connectDB, 5000);
    }
};

connectDB();

app.get("/api", (req, res) => {
    res.send("Api is Live");
});

app.get("/api/login", (req, res) => {
    res.send("Login is Live");
});

// Get user data by email
app.get("/api/user/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        console.log('Fetching user data for:', email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get the last analysis
        const lastAnalysis = user.analysis && user.analysis.length > 0
            ? user.analysis[user.analysis.length - 1]
            : null;

        res.status(200).json({
            success: true,
            data: {
                email: user.email,
                name: user.name,
                age: user.age,
                weight: user.weight,
                height: user.height,
                injury: user.injury,
                medicalHistory: user.medicalHistory,
                allergies: user.allergies,
                lastAnalysis: lastAnalysis,
                totalAnalyses: user.analysis ? user.analysis.length : 0
            }
        });
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        console.log("Raw body:", req.body);
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('Data received from React:', email, name);

        // Check if user exists in database
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // User exists - return their data
            console.log('✅ Existing user found:', user.email);

            // Get the last analysis (most recent)
            const lastAnalysis = user.analysis && user.analysis.length > 0
                ? user.analysis[user.analysis.length - 1]
                : null;

            return res.status(200).json({
                success: true,
                exists: true,
                message: 'Welcome back!',
                data: {
                    email: user.email,
                    name: user.name,
                    age: user.age,
                    weight: user.weight,
                    height: user.height,
                    injury: user.injury,
                    medicalHistory: user.medicalHistory,
                    allergies: user.allergies,
                    lastAnalysis: lastAnalysis,
                    totalAnalyses: user.analysis ? user.analysis.length : 0
                }
            });
        } else {
            // New user - create entry in database
            console.log('🆕 Creating new user:', email);

            const newUser = new User({
                email: email.toLowerCase(),
                name: name || 'User'
            });

            await newUser.save();
            console.log('✅ New user created in database');

            return res.status(201).json({
                success: true,
                exists: false,
                message: 'New user created',
                data: {
                    email: newUser.email,
                    name: newUser.name,
                    age: null,
                    weight: null,
                    height: null,
                    injury: null,
                    medicalHistory: null,
                    lastAnalysis: null,
                    totalAnalyses: 0
                }
            });
        }
    } catch (error) {
        console.error('❌ Error in /api/login:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Update patient details
app.put("/api/patient-details", async (req, res) => {
    try {
        const { email, age, height, weight, medicalHistory, injury, allergies } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('Updating patient details for:', email);

        // Find user and update
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (age !== undefined) user.age = age;
        if (height !== undefined) user.height = height;
        if (weight !== undefined) user.weight = weight;
        if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;
        if (allergies !== undefined) user.allergies = allergies;
        
        // Update injury description
        if (injury !== undefined) {
            if (!user.injury) {
                user.injury = {};
            }
            user.injury.description = injury;
        }

        await user.save();
        console.log('✅ Patient details updated successfully');

        res.status(200).json({
            success: true,
            message: 'Patient details updated successfully',
            data: {
                email: user.email,
                name: user.name,
                age: user.age,
                height: user.height,
                weight: user.weight,
                medicalHistory: user.medicalHistory,
                injury: user.injury,
                allergies: user.allergies
            }
        });
    } catch (error) {
        console.error('❌ Error updating patient details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// NEW: Analysis endpoint - receives file, sends to ML model, saves result
app.post("/api/analyze", upload.single('file'), async (req, res) => {
    let uploadedFilePath = null;

    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        uploadedFilePath = req.file.path;
        const { email, fileType } = req.body;

        console.log('📁 File received:', req.file.filename);
        console.log('👤 User email:', email);
        console.log('📹 File type:', fileType);

        if (!email) {
            // Clean up uploaded file
            fs.unlinkSync(uploadedFilePath);
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user in database
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            fs.unlinkSync(uploadedFilePath);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Send file to ML model (Python Flask server at localhost:5001)
        console.log('🤖 Sending file to ML model...');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        formData.append('email', email);
        formData.append('fileType', fileType);

        // Send to Python ML model
        const mlResponse = await axios.post('http://localhost:5001/predict', formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 60000 // 60 second timeout
        });

        console.log('✅ ML model response received:', mlResponse.data);

        // Prepare analysis result
        const analysisResult = {
            date: new Date(),
            result: mlResponse.data.result || mlResponse.data.prediction || 'Analysis completed',
            severity: mlResponse.data.severity || 'Unknown',
            recommendations: mlResponse.data.recommendations || 'Please consult with a healthcare professional',
            confidence: mlResponse.data.confidence || null,
            imageUrl: `http://localhost:5000/uploads/${req.file.filename}`,
            fileName: req.file.filename,
            fileType: fileType,
            additionalData: mlResponse.data.additionalData || null
        };

        // Save analysis to user's record
        if (!user.analysis) {
            user.analysis = [];
        }
        user.analysis.push(analysisResult);
        await user.save();

        console.log('💾 Analysis saved to database for user:', email);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Analysis completed successfully',
            data: analysisResult
        });

    } catch (error) {
        console.error('❌ Error during analysis:', error);

        // Clean up uploaded file on error
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            fs.unlinkSync(uploadedFilePath);
        }

        // Handle specific error types
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'ML model service is not available. Please ensure the Python server is running on port 5001.'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Analysis failed',
            error: error.toString()
        });
    }
});

app.listen(5000, () => {
    console.log(`🚀 Server started on http://localhost:5000/api`);
});