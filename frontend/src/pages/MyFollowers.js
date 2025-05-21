import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaThumbsUp, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/Feed.css';
import MessageBox from '../components/MessageBox';

const MyFollowers = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedIdeas, setLikedIdeas] = useState(new Set());
  const [message, setMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAuthorClick = (userId) => {
    if (userId) navigate(`/user/${userId}`);
  };

  useEffect(() => {
    const fetchFollowedIdeas = async () => {
      try {
        const response = await axios.get(`/api/followPosts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data || [];
        const likedSet = new Set(
          data.filter((idea) => idea.likedBy?.includes(currentUserId)).map((idea) => idea._id)
        );

        setIdeas(data);
        setLikedIdeas(likedSet);
        setInfoMessage(data.length === 0 ? "You don't follow any posts till now." : '');
      } catch (error) {
        console.error('Error fetching followed ideas:', error.response?.data || error.message);
        showMessage("Something went wrong while fetching followed ideas.");
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedIdeas();

    const handleStorageChange = () => fetchFollowedIdeas();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, currentUserId]);

  const handleLike = async (ideaId) => {
    if (!currentUserId) return;
    const isLiked = likedIdeas.has(ideaId);
    try {
      await axios.post(`/api/like`,
        { ideaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIdeas((prev) =>
        prev.map((idea) =>
          idea._id === ideaId
            ? {
                ...idea,
                likedBy: isLiked
                  ? idea.likedBy.filter((id) => id !== currentUserId)
                  : [...(idea.likedBy || []), currentUserId],
                likes: isLiked ? idea.likes - 1 : idea.likes + 1,
              }
            : idea
        )
      );

      const updatedLikes = new Set(likedIdeas);
      isLiked ? updatedLikes.delete(ideaId) : updatedLikes.add(ideaId);
      setLikedIdeas(updatedLikes);
    } catch (error) {
      console.error('Error toggling like:', error.response?.data || error.message);
      showMessage("Error liking the post.");
    }
  };

  const handleUnfollow = async (authorId) => {
    const userIdToUnfollow = typeof authorId === 'object' ? authorId._id || authorId.id : authorId;

    try {
      await axios.post(`/api/unfollow`,
        {
          userId: currentUserId,
          unfollowUserId: userIdToUnfollow,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const stored = JSON.parse(localStorage.getItem('following') || '[]');
      const updated = stored.filter(id => id !== userIdToUnfollow);
      localStorage.setItem('following', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      setIdeas(prev => {
        const filtered = prev.filter(idea => {
          const uid = idea.userId?._id || idea.userId?.id || idea.userId;
          return uid !== userIdToUnfollow;
        });
        if (filtered.length === 0) {
          setInfoMessage("You don't follow any posts till now.");
        }
        return filtered;
      });

      showMessage("Unfollowed user successfully.");
    } catch (error) {
      console.error("Unfollow failed:", error.response?.data || error.message);
      showMessage("Failed to unfollow user.");
    }
  };

  return (
    <div className="page-wrapper">
      <MessageBox message={message} onClose={() => setMessage("")} />
      <MessageBox message={infoMessage} onClose={() => setInfoMessage("")} />

      <div className="feed-container">
        <h1>Ideas by People You Follow</h1>

        {loading ? (
          <p>Loading ideas...</p>
        ) : ideas.length === 0 ? (
          <div className="feed-placeholder" />
        ) : (
          <div className="feed-grid">
            {ideas.map((idea) => {
              const authorId = idea.userId?._id || idea.userId?.id || idea.userId;
              return (
                <div className="idea-card" key={idea._id} onClick={() => setSelectedPost(idea)}>
                  <div className="idea-header">
                    <span className="idea-title">{idea.title}</span>
                    <button
                      className="unfollow-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnfollow(authorId);
                      }}
                    >
                      Unfollow
                    </button>
                  </div>

                  <p className="idea-author">
                    <strong>By:</strong>{' '}
                    <span
                      style={{ color: "#007bff", cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAuthorClick(authorId);
                      }}
                    >
                      {idea.name || idea.email}
                    </span>
                  </p>

                  <p className="idea-description">
                    <strong>Description:</strong> {idea.description}
                  </p>

                  {idea.file && (
                    <div className="file-preview">
                      <img
                        src={`/uploads/${idea.file}`}
                        alt={idea.title}
                        className="preview-image"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/uploads/${idea.file}`, '_blank');
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  )}

                  <div className="idea-meta">
                    <span>Domain: {idea.domain}</span>
                    <span>Budget: £{idea.budget}</span>
                    <span>Stage: {idea.projectStage}</span>
                    <span>Location: {idea.location}</span>
                  </div>

                  <button
                    className={`like-button ${likedIdeas.has(idea._id) ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(idea._id);
                    }}
                  >
                    <FaThumbsUp style={{ marginRight: '8px' }} />
                    Like ({idea.likes || 0})
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedPost && (
        <div className="custom-popup">
          <div className="custom-popup-inner">
            <button className="popup-close" onClick={() => setSelectedPost(null)}>
              <FaTimes />
            </button>
            <h2>{selectedPost.title}</h2>
            <p>
              <strong>Author:</strong>{' '}
              <span
                style={{ color: "#007bff", cursor: "pointer" }}
                onClick={() => handleAuthorClick(selectedPost.userId?._id || selectedPost.userId?.id || selectedPost.userId)}
              >
                {selectedPost.name || selectedPost.email}
              </span>
            </p>
            <p><strong>Description:</strong> {selectedPost.description}</p>
            <p><strong>Domain:</strong> {selectedPost.domain}</p>
            <p><strong>Stage:</strong> {selectedPost.projectStage}</p>
            <p><strong>Budget:</strong> £{selectedPost.budget}</p>
            <p><strong>Location:</strong> {selectedPost.location}</p>
            {selectedPost.file && (
              <img
                src={`/uploads/${selectedPost.file}`}
                alt={selectedPost.title}
                className="preview-image"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFollowers;