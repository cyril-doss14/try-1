import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserPortfolio.css';
import MessageBox from '../components/MessageBox';
import PostPopup from '../components/PostPopup';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('myPosts');
  const [posts, setPosts] = useState([]);
  const [myPostCount, setMyPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupList, setPopupList] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndFollowStatus = async () => {
      try {
        const [userRes, followersRes] = await Promise.all([
          axios.get(`/api/auth/user/${userId}`),
          axios.get(`/api/auth/followers-list/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUser(userRes.data);
        setFollowingCount(userRes.data.following?.length || 0);
        setIsFollowing(followersRes.data.some(f => f._id === currentUserId));
      } catch (err) {
        console.error('Error loading user info:', err.message);
      }
    };

    if (userId && token) {
      fetchUserAndFollowStatus();
    }
  }, [userId, token, currentUserId]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [myPostsRes, followersRes] = await Promise.all([
          axios.get(`/api/ideas/posts-by-user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/auth/followers-count/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMyPostCount(myPostsRes.data.length);
        setFollowersCount(followersRes.data.count || 0);
      } catch (err) {
        console.error('Error loading user stats:', err.message);
      }
    };

    if (userId && token) {
      fetchStats();
    }
  }, [userId, token]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const endpoint =
          activeTab === 'myPosts'
            ? `/api/ideas/posts-by-user/${userId}`
            : `/api/ideas/liked-by-user/${userId}`;

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPosts(res.data || []);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
      }
    };

    if (userId) fetchPosts();
  }, [activeTab, userId, token]);

  
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await axios.post(
          `/api/unfollow`,
          { userId: currentUserId, unfollowUserId: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowersCount(prev => prev - 1);
        setMessage('User unfollowed successfully');
        setIsFollowing(false);
      } else {
        await axios.post(
          `/api/follow`,
          { userId: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowersCount(prev => prev + 1);
        setMessage('User followed successfully');
        setIsFollowing(true);
      }
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Follow/Unfollow error:', err.response?.data || err.message);
    }
  };

  const openUserPopup = async (type) => {
    try {
      const endpoint =
        type === 'Followers'
          ? `/api/auth/followers-list/${userId}`
          : `/api/auth/following-list/${userId}`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPopupList(res.data || []);
      setPopupTitle(type);
      setShowPopup(true);
    } catch (err) {
      console.error(`Error fetching ${type.toLowerCase()} list:`, err.message);
    }
  };

  return (
    <div className="user-portfolio-container">
      <MessageBox message={message} onClose={() => setMessage("")} />

      <div className="user-profile-section">
        <img src="/profile_picture.jpg" alt="Profile" className="user-avatar" />
        <div className="user-info-block">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {userId !== currentUserId && (
            <button
              onClick={handleFollowToggle}
              className={`user-tab-btn ${isFollowing ? 'active' : ''}`}
              style={{ marginTop: '10px', padding: '6px 14px', fontSize: '0.9rem' }}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className="user-stat-block">
          <div className="stat-card">
            <p className="stat-number">{myPostCount}</p>
            <p className="stat-label">Posts</p>
          </div>
          <div className="stat-card" onClick={() => openUserPopup('Followers')} style={{ cursor: 'pointer' }}>
            <p className="stat-number">{followersCount}</p>
            <p className="stat-label">Followers</p>
          </div>
          <div className="stat-card" onClick={() => openUserPopup('Following')} style={{ cursor: 'pointer' }}>
            <p className="stat-number">{followingCount}</p>
            <p className="stat-label">Following</p>
          </div>
        </div>
      </div>

      <div className="user-tab-section">
        <button
          className={`user-tab-btn ${activeTab === 'myPosts' ? 'active' : ''}`}
          onClick={() => setActiveTab('myPosts')}
        >
          User's Posts
        </button>
        <button
          className={`user-tab-btn ${activeTab === 'likedPosts' ? 'active' : ''}`}
          onClick={() => setActiveTab('likedPosts')}
        >
          Liked Posts
        </button>
      </div>

      <div className="user-post-section">
        {posts.length === 0 ? (
          <p className="no-posts-msg">No posts to display.</p>
        ) : (
          <div className="user-post-grid">
            {posts.map((post) => (
              <div
                className="user-idea-card"
                key={post._id}
                onClick={() => setSelectedPost(post)}
              >
                <h3>{post.title}</h3>
                <p><strong>Description:</strong> {post.description}</p>
                <p><strong>Domain:</strong> {post.domain}</p>
                <p><strong>Stage:</strong> {post.projectStage}</p>
                <p><strong>Budget:</strong> £{post.budget}</p>
                {post.file && (
                  <img
                    src={`/uploads/${post.file}`}
                    alt={post.title}
                    className="preview-image"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <PostPopup
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onAuthorClick={(id) => navigate(`/user/${id}`)}
        />
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="popup-close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h3 className="popup-title">{popupTitle}</h3>
            <div className="popup-scroll">
              {popupList.length === 0 ? (
                <p>No users found.</p>
              ) : (
                popupList.map((person, idx) => (
                  <div key={idx} className="user-card-horizontal">
                    <strong>{person.name || person.email}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;