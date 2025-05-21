import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/Chat.css';
import moment from 'moment';

const ChatWindow = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const currentUserId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const messagesEndRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      const receiverId = typeof user.id === 'object' ? user.id._id : user.id;

      try {
        const res = await axios.get(
          `/api/chat/${currentUserId}/${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [user, currentUserId, token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const receiverId = typeof user.id === 'object' ? user.id._id : user.id;

    try {
      const res = await axios.post(
        `/api/chat/send`,
        {
          senderId: currentUserId,
          receiverId,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages((prev) => [...prev, res.data]);
      setText('');
    } catch (err) {
      console.error('❌ Failed to send message:', err);
    }
  };

  const groupByDate = (msgs) => {
    return msgs.reduce((acc, msg) => {
      const date = moment(msg.timestamp).format('YYYY-MM-DD');
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {});
  };

  const grouped = groupByDate(messages);

  return (
    <div className="chat-window">
      {user ? (
        <>
          <div className="chat-header">{user.name}</div>
          <div className="chat-messages">
            {Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <div className="chat-date-label">{moment(date).format('LL')}</div>
                {msgs.map((msg, idx) => {
                  const isSent = msg.senderId === currentUserId;
                  const seenText = msg.seen ? '✓ Seen' : '✓ Delivered';

                  return (
                    <div key={idx} className={`chat-message ${isSent ? 'sent' : 'received'}`}>
                      <div className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
                        {msg.text}
                        <div className="timestamp">
                          {moment(msg.timestamp).format('LT')}
                          {isSent && (
                            <span className="seen-status"> • {seenText}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </>
      ) : (
        <div className="no-chat-selected">Select a user to start chatting</div>
      )}
    </div>
  );
};

export default ChatWindow;