import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

function Dashboard({ name, email, onLogout }) {
  const [meal, setMeal] = useState('');
  const [message, setMessage] = useState('');
  const [mealLogs, setMealLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState('log');
  const [moodBackground, setMoodBackground] = useState('default');
  const [moodMessage, setMoodMessage] = useState('');
  const [mealCountdown, setMealCountdown] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes

  const mealSchedule = [
    { label: 'Breakfast', hour: 8, minute: 0 },
    { label: 'Lunch', hour: 12, minute: 30 },
    { label: 'Dinner', hour: 18, minute: 30 },
  ];

  useEffect(() => {
    fetchMealLogs();
    const countdownInterval = setInterval(() => {
      updateMealCountdown();
    }, 30000);
    updateMealCountdown();
    return () => clearInterval(countdownInterval);
  }, [mealLogs]);

  useEffect(() => {
    let timer = null;
    if (timerActive && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timerSeconds === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [timerActive, timerSeconds]);

  const startSandTimer = () => {
    setTimerSeconds(300); // 5 minutes in seconds
    setTimerActive(true);
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const updateMealCountdown = () => {
    const now = new Date();
    const futureMeals = mealSchedule.map(({ label, hour, minute }) => {
      const mealTime = new Date(now);
      mealTime.setHours(hour, minute, 0, 0);
      return { label, time: mealTime };
    }).filter(m => m.time > now);

    if (futureMeals.length === 0) {
      setMealCountdown("All meals done for today ✨");
      return;
    }

    const nextMeal = futureMeals[0];
    const diffMs = nextMeal.time - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    setMealCountdown(`${nextMeal.label} in ${diffHrs}h ${diffMins}m`);
  };

  const handleSubmit = async () => {
    if (!meal) return;
    try {
      await axios.post('/analyze-meal', {
        user_email: email,
        meal_description: meal,
      });
      setMealByMood(meal);
      setMeal('');
      setMessage('Meal logged successfully!');
      fetchMealLogs();
    } catch (error) {
      setMessage('Error logging meal.');
    }
  };

  const fetchMealLogs = async () => {
    try {
      const { data } = await axios.get(`/meal-logs?email=${email}`);
      setMealLogs(data);
    } catch (error) {
      console.error('Error fetching meal logs:', error);
    }
  };

  const setMealByMood = (meal) => {
    const lower = meal.toLowerCase();
    if (lower.includes('salad') || lower.includes('avocado') || lower.includes('grilled') || lower.includes('quinoa') || lower.includes('broccoli') || lower.includes('spinach')) {
      setMoodBackground('healthy');
      setMoodMessage('Feeling fresh and leafy ✫️');
    } else if (lower.includes('chocolate') || lower.includes('cake') || lower.includes('ice cream') || lower.includes('cookie') || lower.includes('brownie')) {
      setMoodBackground('sweet');
      setMoodMessage('Treat yourself 💖');
    } else if (lower.includes('candy') || lower.includes('gummy') || lower.includes('lollipop') || lower.includes('jellybean')) {
      setMoodBackground('fun');
      setMoodMessage('Sweet like candy 🍬');
    } else if (lower.includes('steak') || lower.includes('chicken') || lower.includes('turkey') || lower.includes('tofu') || lower.includes('salmon')) {
      setMoodBackground('cozy');
      setMoodMessage('Protein powerhouse 🍖');
    } else if (lower.includes('pizza') || lower.includes('fries') || lower.includes('burger') || lower.includes('bread') || lower.includes('pasta')) {
      setMoodBackground('fun');
      setMoodMessage('Carb cravings met 🍟');
    } else {
      setMoodBackground('default');
      setMoodMessage('You’re doing amazing 💫');
    }
  };

  const chartData = {
    labels: mealLogs.map((log) => new Date(log.created_at).toLocaleDateString()),
    datasets: [
      { label: 'Calories', data: mealLogs.map((log) => log.calories), borderColor: 'red', fill: false },
      { label: 'Sugar (g)', data: mealLogs.map((log) => log.sugar_grams), borderColor: 'blue', fill: false },
      { label: 'Protein (g)', data: mealLogs.map((log) => log.protein), borderColor: 'green', fill: false },
      { label: 'Carbs (g)', data: mealLogs.map((log) => log.carbs), borderColor: 'orange', fill: false },
      { label: 'Fats (g)', data: mealLogs.map((log) => log.fats), borderColor: 'purple', fill: false },
    ],
  };

  const total = (key) => mealLogs.reduce((sum, log) => sum + (log[key] || 0), 0);

  return (
    <div className={`dashboard fade-transition ${moodBackground}`}>
      <h1>Welcome, {name || 'User'}!</h1>

      <p className="meal-timer">⏰ {mealCountdown}</p>

      <button className="sand-timer-btn" onClick={startSandTimer}>Start 5-Minute Meal Timer ⏳</button>
      {timerActive && timerSeconds > 0 && (
        <p className="sand-timer-display">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Simple_icon_hourglass.svg" alt="Hourglass icon" style={{ width: '28px', marginRight: '8px', verticalAlign: 'middle' }} />⏳ {formatTimer(timerSeconds)}</p>
      )}
      {timerActive && timerSeconds === 0 && (
        <p className="sand-timer-complete">✅ Time to eat!</p>
      )}

      <div className="dashboard-nav">$1
        <button className={currentPage === 'timing' ? 'active' : ''} onClick={() => setCurrentPage('timing')}>⏱️ Meal Timing Options</button>

      {currentPage === 'log' && (
        <div className="dashboard-section">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <input
              type="text"
              placeholder="Describe your meal..."
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
            />
            <button type="submit">Log Meal</button>
          </form>
          {message && <p className="message">{message}</p>}
          {moodMessage && <p className="mood-message">{moodMessage}</p>}
        </div>
      )}

      {currentPage === 'trends' && (
        <div className="dashboard-section">
          <h2>Nutrition Trends</h2>
          {mealLogs.length > 0 ? <Line data={chartData} /> : <p>No meal data yet to display a chart.</p>}
        </div>
      )}

      {currentPage === 'history' && (
        <div className="dashboard-section">
          <h2>Meal History</h2>
          <div className="meal-table-wrapper">
            <table className="meal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meal</th>
                </tr>
              </thead>
              <tbody>
                {mealLogs.length > 0 ? (
                  mealLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.meal_description}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="2">No meal logs found. Add your first meal!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentPage === 'summary' && (
        <div className="dashboard-section">
          <h2>Total Nutrition Summary</h2>
          <div className="summary-grid">
            <div className="summary-box"><h4>Calories</h4><p>{total('calories')} kcal</p></div>
            <div className="summary-box"><h4>Sugar</h4><p>{total('sugar_grams')} g</p></div>
            <div className="summary-box"><h4>Protein</h4><p>{total('protein')} g</p></div>
            <div className="summary-box"><h4>Carbs</h4><p>{total('carbs')} g</p></div>
            <div className="summary-box"><h4>Fats</h4><p>{total('fats')} g</p></div>
          </div>
        </div>
      )}

      {currentPage === 'timing' && (
        <div className="dashboard-section">
          <h2>Suggested Meal Timing Plans</h2>
          <ul className="meal-timing-options">
            <li><strong>Standard Plan:</strong> Breakfast at 8:00 AM, Lunch at 12:30 PM, Dinner at 6:30 PM</li>
            <li><strong>Early Plan:</strong> Breakfast at 7:00 AM, Lunch at 11:30 AM, Dinner at 5:30 PM</li>
            <li><strong>Intermittent Fasting:</strong> First meal at 12:00 PM, last meal by 8:00 PM (2 meals total)</li>
            <li><strong>Frequent Small Meals:</strong> Eat every 3 hours in portions (6 smaller meals)</li>
          </ul>
          <p style={{ marginTop: '1rem' }}><em>Choose a plan that fits your routine and supports your energy throughout the day!</em></p>
        </div>
      )}

      <div className="dashboard-section">
        <button className="logout-btn" onClick={onLogout}>Log Out</button>
      </div>
    </div>
  );
}

export default Dashboard;
