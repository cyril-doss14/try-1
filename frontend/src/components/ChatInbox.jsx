import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatInbox = ({ onSelectUser, selectedUser }) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUsers = async () => {
      console.log("📨 Fetching chat inbox users...");
      try {
        const [followedRes, chatRes] = await Promise.all([
          axios.get(`/api/followPosts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/chat/inbox`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const followedIdeas = followedRes.data || [];
        const chatUsers = chatRes.data || [];

        const userMap = new Map();

        followedIdeas.forEach((idea) => {
          const id = typeof idea.userId === 'object' ? idea.userId._id : idea.userId;
          const key = id.toString();

          if (key !== currentUserId && !userMap.has(key)) {
            userMap.set(key, {
              id: key,
              name: idea.name || idea.email,
              unseenCount: 0,
              wishesToCollaborate: false,
              wishedByCurrentUser: false,
            });
          }
        });

        chatUsers.forEach((u) => {
          const id = typeof u.id === 'object' ? u.id._id : u.id;
          const key = id.toString();

          if (key !== currentUserId) {
            if (userMap.has(key)) {
              userMap.set(key, {
                ...userMap.get(key),
                unseenCount: u.unseenCount || 0,
                wishesToCollaborate: u.wishesToCollaborate || false,
                wishedByCurrentUser: u.wishedByCurrentUser || false,
              });
            } else {
              userMap.set(key, {
                id: key,
                name: u.name || u.email,
                unseenCount: u.unseenCount || 0,
                wishesToCollaborate: u.wishesToCollaborate || false,
                wishedByCurrentUser: u.wishedByCurrentUser || false,
              });
            }
          }
        });

        const finalList = Array.from(userMap.values());
        console.log("✅ Final chat user list:", finalList);
        setChatUsers(finalList);
      } catch (err) {
        console.error("❌ Error fetching chat inbox users:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, currentUserId]);

  const handleUserSelect = async (user) => {
    console.log("👆 User clicked:", user);
    try {
      await axios.post(
        `/api/chat/mark-seen`,
        {
          senderId: user.id,
          receiverId: currentUserId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChatUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, unseenCount: 0 } : u
        )
      );

      onSelectUser({ id: user.id, name: user.name });
    } catch (err) {
      console.error("❌ Failed to mark messages as seen:", err.message);
    }
  };

  return (
    <div className="chat-inbox">
      <h3>Chat Inbox</h3>
      {loading ? (
        <p>Loading...</p>
      ) : chatUsers.length === 0 ? (
        <p className="no-follow-text">You are not following anyone. Kindly follow users to chat with them.</p>
      ) : (
        <ul>
          {chatUsers.map((user) => (
            <li
              key={user.id}
              className={`chat-user ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              <span>{user.name}</span>

              {user.wishedByCurrentUser && (
                <span className="bubble-tag">you wished to collaborate</span>
              )}

              {user.wishesToCollaborate && !user.wishedByCurrentUser && (
                <span className="bubble-tag">wishes to collaborate</span>
              )}

              {user.unseenCount > 0 && (
                <span className="unseen-count">{user.unseenCount}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatInbox; 