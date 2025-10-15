const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: null
    },
    weight: {
        type: Number,
        default: null
    },
    height: {
        type: Number,
        default: null
    },
    injury: {
        description: {
            type: String,
            default: null
        }
    },
    medicalHistory: {
        type: String,
        default: null
    },
    allergies: {
        type: String,
        default: null
    },
    analysis: [{
        date: {
            type: Date,
            default: Date.now
        },
        result: String,
        severity: String,
        recommendations: String,
        imageUrl: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Use 'patients' collection name
const User = mongoose.model('User', userSchema, 'patients');

module.exports = User;
