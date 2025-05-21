import React, { useState } from 'react';
import ChatInbox from './ChatInbox';
import ChatWindow from './ChatWindow';
import '../styles/Chat.css';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="chat-page-container">
      <div className="chat-wrapper">
        <div className="chat-inbox">
          <ChatInbox onSelectUser={setSelectedUser} selectedUser={selectedUser} />
        </div>
        <div className="chat-window">
          <ChatWindow user={selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;