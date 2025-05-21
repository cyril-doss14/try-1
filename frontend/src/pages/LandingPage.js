import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [userCount, setUserCount] = useState(0);
  const [ideaCount, setIdeaCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersRes, ideasRes] = await Promise.all([
          axios.get(`/api/auth/count`),
          axios.get(`/api/ideas/count`),
        ]);
        setUserCount(usersRes.data.count || 0);
        setIdeaCount(ideasRes.data.count || 0);
      } catch (err) {
        console.error('Error fetching counts:', err.message);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="landing-wrapper">
      <div className="landing-content">
        <h1 className="logo-text">PitchStart</h1>
        <p className="tagline">Where student visionaries and investors connect to build the future.</p>

        {/* 🔧 Wrap counts in a container */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Overall Users</div>
            <div className="stat-number">{userCount}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Posts</div>
            <div className="stat-number">{ideaCount}</div>
          </div>
        </div>

        <div className="landing-buttons">
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;