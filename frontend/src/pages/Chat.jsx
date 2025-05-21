// Optional Chat.jsx (if you have a wrapper component)
import React, { useState } from 'react';
import ChatInbox from '../components/ChatInbox';
import ChatWindow from '../components/ChatWindow';
import '../styles/Chat.css';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="chat-page-container">
      <div className="chat-wrapper">
        <ChatInbox selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        <ChatWindow user={selectedUser} />
      </div>
    </div>
  );
};

export default Chat;