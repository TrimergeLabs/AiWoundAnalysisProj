import {useEffect,useState} from 'react';
import LoginSignup from './components/LoginSignup/LoginSignup';
import { HashRouter as Router , Routes, Route } from 'react-router-dom';
import { PatientDashboard} from './components/PatientDashboard';
import { WoundAnalysis } from './components/WoundAnalysis';
import { PatientDetails } from './components/PatientDetails';
import { Result } from './components/Result';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginSignup/>}/>
          <Route path="/dashboard" element={<PatientDashboard/>}/>
          <Route path="/Wound" element={<WoundAnalysis/>}/>
          <Route path="/Details" element={<PatientDetails/>}/>
          <Route path="/result" element={<Result/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
