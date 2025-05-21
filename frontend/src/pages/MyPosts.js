import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Feed.css';
import LikesChart from '../components/LikesChart';
import PostPopup from '../components/PostPopup';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [chartPost, setChartPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const response = await axios.get(
          `/api/ideas/posts-by-user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const postsWithCollaborators = await Promise.all(
          response.data.map(async (post) => {
            const collaboratorsRes = await axios.get(
              `/api/ideas/${post._id}/collaborators`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...post, collaborators: collaboratorsRes.data };
          })
        );

        setPosts(postsWithCollaborators);
      } catch (error) {
        setError(error.response?.data?.msg || 'Failed to fetch your posts');
        console.error("Error fetching your posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const fetchCollaborators = async (ideaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/ideas/${ideaId}/collaborators`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === ideaId ? { ...post, collaborators: response.data } : post
        )
      );
    } catch (error) {
      console.error('Error fetching collaborators:', error.response?.data || error.message);
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-header-row">
        <h1>My Posts</h1>
        <button onClick={() => navigate('/post-idea')} className="small-button">
          + Add More
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your posts...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : posts.length === 0 ? (
        <div className="no-ideas">
          <p>You haven't created any posts yet.</p>
          <button onClick={() => navigate('/post-idea')} className="small-button">
            Create your first post!
          </button>
        </div>
      ) : (
        <div className="feed-grid">
          {posts.map((post) => (
            <div key={post._id} className="idea-card" onClick={() => setSelectedPost(post)}>
              <div className="idea-header">
                <h2 className="idea-title">{post.title}</h2>
                <p className="idea-author">Posted by you</p>
              </div>

              <p className="idea-description">{post.description}</p>

              {post.file && (
                <div className="file-preview">
                  <img
                    src={`/uploads/${post.file}`}
                    alt={post.title}
                    className="preview-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/uploads/${post.file}`, '_blank');
                    }}
                  />
                </div>
              )}

              <div className="idea-meta">
                <span>Domain: {post.domain}</span>
                <span>Budget: £{post.budget}</span>
                <span>Stage: {post.projectStage}</span>
                <span>Location: {post.location}</span>
              </div>

              {post.likedBy?.length > 0 && (
                <div className="idea-meta liked-by-meta">
                  <span>Liked by:</span>
                  {post.likedBy.map((user, index) => (
                    <span key={index} className="liked-user-tag">
                      {user.name || user.email}
                    </span>
                  ))}
                </div>
              )}

              <button
                className="collaborators-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchCollaborators(post._id);
                }}
              >
                Collaborators ({post.collaborators?.length || 0})
              </button>

              {post.collaborators?.length > 0 && (
                <ul>
                  {post.collaborators.map((collaborator) => (
                    <li key={collaborator._id}>
                      {collaborator.name || collaborator.email}
                    </li>
                  ))}
                </ul>
              )}

              <button
                className="track-likes-btn"
                style={{
                  marginTop: '10px',
                  backgroundColor: '#6c63ff',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setChartPost(post);
                }}
              >
                📈 Track Likes
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPost && (
        <PostPopup
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onAuthorClick={() => {}}
        />
      )}

      {chartPost && (
        <div className="custom-popup">
          <div className="custom-popup-inner" style={{ width: '80%', maxWidth: '900px' }}>
            <button className="popup-close" onClick={() => setChartPost(null)}>
              ×
            </button>
            <LikesChart ideaId={chartPost._id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;