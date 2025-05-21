import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserPortfolio.css';
import PostPopup from '../components/PostPopup';
import { useNavigate } from 'react-router-dom';

const UserPortfolio = () => {
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('myPosts');
  const [posts, setPosts] = useState([]);
  const [myPostCount, setMyPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupList, setPopupList] = useState([]);
  const [popupTitle, setPopupTitle] = useState('');

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [myPostsRes, followersRes, userRes] = await Promise.all([
          axios.get(`/api/ideas/posts-by-user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/auth/followers-count/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/auth/user/${userId}`),
        ]);

        setMyPostCount(myPostsRes.data.length);
        setFollowersCount(followersRes.data.count || 0);
        setFollowingCount(userRes.data.following?.length || 0);
      } catch (error) {
        console.error('Error fetching user stats:', error.message);
      }
    };

    if (userId && token) fetchStats();
  }, [userId, token]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const endpoint = activeTab === 'myPosts'
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

    if (userId && token) fetchPosts();
  }, [activeTab, userId, token]);

  const openUserPopup = async (type) => {
    try {
      const endpoint = type === 'Followers'
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

  const handleAuthorClick = (authorId) => {
    const id = typeof authorId === 'object' ? authorId._id || authorId.id : authorId;
    if (id) {
      setSelectedPost(null); // Close popup before navigating
      navigate(`/user/${id}`);
    }
  };

  return (
    <div className="user-portfolio-container">
      <div className="user-profile-section">
        <img src="/profile_picture.jpg" alt="Profile" className="user-avatar" />
        <div className="user-info-block">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
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
        <button className={`user-tab-btn ${activeTab === 'myPosts' ? 'active' : ''}`} onClick={() => setActiveTab('myPosts')}>
          My Posts
        </button>
        <button className={`user-tab-btn ${activeTab === 'likedPosts' ? 'active' : ''}`} onClick={() => setActiveTab('likedPosts')}>
          Liked Posts
        </button>
      </div>

      <div className="user-post-section">
        {posts.length === 0 ? (
          <p className="no-posts-msg">No posts to display.</p>
        ) : (
          <div className="user-post-grid">
            {posts.map((post) => (
              <div className="user-idea-card" key={post._id} onClick={() => setSelectedPost(post)}>
                <h3>{post.title}</h3>
                <p><strong>Description:</strong> {post.description}</p>
                <p><strong>Domain:</strong> {post.domain}</p>
                <p><strong>Stage:</strong> {post.projectStage}</p>
                <p><strong>Budget:</strong> £{post.budget}</p>
                {post.file && (
                  <img src={`/uploads/${post.file}`} alt={post.title} className="preview-image" />
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
          onAuthorClick={handleAuthorClick}
        />
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="popup-close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h3 className="popup-title">{popupTitle}</h3>
            {popupList.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="popup-scroll">
                {popupList.map((person, idx) => (
                  <div key={idx} className="user-card-horizontal">
                    <strong>{person.name || person.email}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPortfolio;