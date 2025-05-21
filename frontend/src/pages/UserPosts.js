import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Feed.css';

const UserPosts = () => {
  const { userId } = useParams();
  const [createdPosts, setCreatedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const [createdRes, likedRes] = await Promise.all([
          axios.get(`/api/ideas/user/${userId}`),
          axios.get(`/api/ideas/liked-by/${userId}`)
        ]);
        setCreatedPosts(createdRes.data);
        setLikedPosts(likedRes.data);
      } catch (err) {
        setError('Failed to load user posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPosts();
  }, [userId]);

  const renderPostCard = (post) => {
    const fileUrl = `/api/ideas/file/${post._id}`;
    const fileName = post.file || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].some(ext => fileName.toLowerCase().endsWith(ext));

    return (
      <div key={post._id} className="idea-card">
        <div className="idea-header">
          <h2>{post.title}</h2>
        </div>
        <p className="idea-description"><strong>Description:</strong> {post.description}</p>

        {post.file && (
          <div className="file-preview">
            {isImage ? (
              <img src={fileUrl} alt={fileName} className="preview-image" onClick={() => window.open(fileUrl)} />
            ) : (
              <button className="download-button" onClick={() => window.open(fileUrl)}>
                Download File: {fileName}
              </button>
            )}
          </div>
        )}

        <div className="idea-meta">
          <span><strong>Domain:</strong> {post.domain}</span>
          <span><strong>Budget:</strong> £{post.budget}</span>
          <span><strong>Stage:</strong> {post.projectStage}</span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading user posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="feed-container">
      <h1>User's Posts</h1>
      <h2>Created Posts</h2>
      <div className="feed-grid">
        {createdPosts.length > 0 ? createdPosts.map(renderPostCard) : <p>No created posts.</p>}
      </div>
      <h2>Liked Posts</h2>
      <div className="feed-grid">
        {likedPosts.length > 0 ? likedPosts.map(renderPostCard) : <p>No liked posts.</p>}
      </div>
    </div>
  );
};

export default UserPosts;
