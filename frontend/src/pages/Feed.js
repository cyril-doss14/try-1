import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaTimes } from 'react-icons/fa';
import '../styles/Feed.css';
import MessageBox from '../components/MessageBox';
import IdeaOfTheDay from '../components/IdeaOfTheDay';

const Feed = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedIdeas, setLikedIdeas] = useState(new Set());
  const [followingList, setFollowingList] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [ideaOfTheDayData, setIdeaOfTheDayData] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLike = async (ideaId) => {
    if (!currentUserId) return;
    const isLiked = likedIdeas.has(ideaId);
    try {
      await axios.post(`/api/like`, { ideaId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIdeas(prev => prev.map(idea =>
        idea._id === ideaId ? {
          ...idea,
          likes: isLiked ? idea.likes - 1 : idea.likes + 1,
          likedBy: isLiked ? idea.likedBy.filter(id => id !== currentUserId) : [...(idea.likedBy || []), currentUserId],
        } : idea
      ));

      const updated = new Set(likedIdeas);
      isLiked ? updated.delete(ideaId) : updated.add(ideaId);
      setLikedIdeas(updated);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleCollaboration = async (ideaId) => {
    if (!currentUserId) return;
    try {
      const currentIdea = ideas.find(idea => idea._id === ideaId);
      const wasCollaborating = currentIdea.collaborators.includes(currentUserId);
      const response = await axios.post(`/api/ideas/collaborate`, { ideaId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIdeas(prev => prev.map(idea =>
        idea._id === ideaId ? { ...idea, collaborators: response.data.collaborators } : idea
      ));
      showMessage(wasCollaborating ? 'Collaboration reverted successfully!' : 'Collaboration request sent successfully!');
    } catch (error) {
      console.error('Collaboration error:', error.response?.data || error.message);
      showMessage('Failed to update collaboration status.');
    }
  };

  const handleRevertCollab = async (ideaId) => {
    if (!currentUserId) return;
    try {
      await axios.put(`/api/ideas/${ideaId}/revert-collab`, { userId: currentUserId });
      setIdeas(prevIdeas => prevIdeas.map(idea =>
        idea._id === ideaId ? {
          ...idea,
          collaborators: idea.collaborators.filter(id => id !== currentUserId)
        } : idea
      ));
      showMessage('Collaboration reverted successfully!');
    } catch (error) {
      console.error('Error reverting collaboration:', error);
      showMessage('Error reverting collaboration.');
    }
  };

  const handleFollow = async (userId) => {
    if (!userId || userId === currentUserId) return;
    try {
      await axios.post(`/api/follow`, { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = [...followingList, userId];
      setFollowingList(updated);
      localStorage.setItem("following", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      showMessage("User followed successfully");
    } catch (error) {
      console.error('Follow error:', error.response?.data || error.message);
    }
  };

  const handleUnfollow = async (userIdToUnfollow) => {
    try {
      await axios.post(
        `/api/unfollow`,
        {
          userId: currentUserId,
          unfollowUserId: userIdToUnfollow,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = followingList.filter((id) => id !== userIdToUnfollow);
      setFollowingList(updated);
      localStorage.setItem("following", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));

      showMessage("User unfollowed successfully.");
    } catch (error) {
      console.error("Unfollow error:", error.response?.data || error.message);
      showMessage("Unfollow failed.");
    }
  };

  const handleDownload = (ideaId) => {
    const fileUrl = `/api/ideas/file/${ideaId}`;
    window.open(fileUrl, '_blank');
  };

  const handleAuthorClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const fetchData = async () => {
    try {
      const ideasRes = await axios.get(`/api/feed`, {
        headers: { 'x-auth-token': token },
      });
      const followingRes = await axios.get(`/api/following/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const serverFollowing = followingRes.data || [];
      setFollowingList(serverFollowing);
      const ideasWithStatus = ideasRes.data.map(idea => ({
        ...idea,
        followed: serverFollowing.includes(idea.userId),
        likedBy: idea.likedBy || [],
        collaborators: idea.collaborators || []
      }));
      const filteredIdeas = selectedDomain
        ? ideasWithStatus.filter(idea => idea.domain.toLowerCase() === selectedDomain.toLowerCase())
        : ideasWithStatus;
      setIdeas(filteredIdeas);
      const likedIds = filteredIdeas
        .filter(idea => idea.likedBy.includes(currentUserId))
        .map(idea => idea._id);
      setLikedIdeas(new Set(likedIds));
    } catch (err) {
      console.error('Fetch error:', err.response || err.message || err);
      setError(err.response?.data?.msg || 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, currentUserId, selectedDomain]);

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-wrapper">
      <MessageBox message={message} onClose={() => setMessage("")} />
      <div className="feed-container">
        <div className="idea-day-wrapper" onClick={() => setIdeaOfTheDayData(ideas[0])}>
          <IdeaOfTheDay />
        </div>
        <div className="feed-header-row">
          <h1>Latest Ideas</h1>
          <div className="domain-dropdown">
            <select value={selectedDomain} onChange={handleDomainChange}>
              <option value="">All Domains</option>
              <option value="tech">Tech</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="feed-grid">
          {ideas.map((idea) => (
            <div key={idea._id} className="idea-card" onClick={() => setSelectedPost(idea)}>
              <div className="idea-header">
                <span className="idea-title">{idea.title}</span>
                {idea.userId === currentUserId ? (
                  <span className="posted-by-you">Posted by You</span>
                ) : (
                  <div className="button-group">
                    <button
                      className="collaborate-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        idea.collaborators.includes(currentUserId)
                          ? handleRevertCollab(idea._id)
                          : handleCollaboration(idea._id);
                      }}
                    >
                      {idea.collaborators.includes(currentUserId) ? 'Revert Collab' : 'Collaborate'}
                    </button>
                    <button
                      className={`follow-btn ${followingList.includes(idea.userId) ? 'followed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        followingList.includes(idea.userId)
                          ? handleUnfollow(idea.userId)
                          : handleFollow(idea.userId);
                      }}
                    >
                      {followingList.includes(idea.userId) ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                )}
              </div>
              <p className="idea-author">
                <strong>Posted by:</strong>{' '}
                <span onClick={(e) => { e.stopPropagation(); handleAuthorClick(idea.userId); }} style={{ color: '#007bff', cursor: 'pointer', marginLeft: '5px' }}>
                  {idea.name || idea.email || 'Unknown'}
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
                    onClick={(e) => { e.stopPropagation(); handleDownload(idea._id); }}
                  />
                </div>
              )}
              <div className="idea-meta">
                <span>Domain: {idea.domain}</span>
                <span>Budget: £{idea.budget}</span>
                <span>Stage: {idea.projectStage}</span>
              </div>
              <button className={`like-button ${likedIdeas.has(idea._id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); handleLike(idea._id); }}>
                <FaThumbsUp style={{ marginRight: '8px' }} />
                Like ({idea.likes || 0})
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPost && (
        <div className="custom-popup">
          <div className="custom-popup-inner">
            <button className="popup-close" onClick={() => setSelectedPost(null)}><FaTimes /></button>
            <h2>{selectedPost.title}</h2>
            <p><strong>Author:</strong> <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => handleAuthorClick(selectedPost.userId)}>{selectedPost.name || selectedPost.email}</span></p>
            <p><strong>Description:</strong> {selectedPost.description}</p>
            <p><strong>Domain:</strong> {selectedPost.domain}</p>
            <p><strong>Stage:</strong> {selectedPost.projectStage}</p>
            <p><strong>Budget:</strong> £{selectedPost.budget}</p>
            {selectedPost.file && (
              <img src={`/uploads/${selectedPost.file}`} alt={selectedPost.title} className="preview-image" />
            )}
          </div>
        </div>
      )}

      {ideaOfTheDayData && (
        <div className="custom-popup">
          <div className="custom-popup-inner">
            <button className="popup-close" onClick={() => setIdeaOfTheDayData(null)}><FaTimes /></button>
            <h2>{ideaOfTheDayData.title}</h2>
            <p><strong>Author:</strong> {ideaOfTheDayData.name || ideaOfTheDayData.email}</p>
            <p><strong>Description:</strong> {ideaOfTheDayData.description}</p>
            <p><strong>Domain:</strong> {ideaOfTheDayData.domain}</p>
            <p><strong>Stage:</strong> {ideaOfTheDayData.projectStage}</p>
            <p><strong>Budget:</strong> £{ideaOfTheDayData.budget}</p>
            {ideaOfTheDayData.file && (
              <img src={`/uploads/${ideaOfTheDayData.file}`} alt={ideaOfTheDayData.title} className="preview-image" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;