import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (storedUser?.name) {
      setUserName(storedUser.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <span className="welcome-text">Welcome, {userName}</span>
      </div>
      <div className="header-center">
        <div className="logo">PitchStart</div>
      </div>
      <div className="header-right">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;