import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard({ name, email, onLogout }) {
  const [currentPage, setCurrentPage] = useState('log');

  // Super simplified component with minimal JSX
  return (
    <div className="dashboard fade-transition">
      <h1>Welcome, {name || 'User'}!</h1>
      
      <div className="dashboard-nav">
        <button onClick={() => setCurrentPage('log')}>📝 Log Meal</button>
        <button onClick={() => setCurrentPage('trends')}>📈 Trends</button>
        <button onClick={() => setCurrentPage('history')}>📋 History</button>
        <button onClick={() => setCurrentPage('summary')}>📊 Summary</button>
        <button onClick={() => setCurrentPage('timing')}>⏱️ Timing</button>
      </div>
      
      <div className="dashboard-section">
        {currentPage === 'log' && <p>Meal logging form will go here</p>}
        {currentPage === 'trends' && <p>Nutrition trends will go here</p>}
        {currentPage === 'history' && <p>Meal history will go here</p>}
        {currentPage === 'summary' && <p>Nutrition summary will go here</p>}
        {currentPage === 'timing' && <p>Meal timing options will go here</p>}
      </div>
      
      <div className="dashboard-section">
        <button className="logout-btn" onClick={onLogout}>Log Out</button>
      </div>
    </div>
  );
}

export default Dashboard;

