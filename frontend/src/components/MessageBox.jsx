import React from 'react';
import './MessageBox.css';

const MessageBox = ({ message, onClose }) => {
  if (!message || message.length < 1) return null;

  return (
    <div className="message-overlay">
      <div className="message-box">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default MessageBox;