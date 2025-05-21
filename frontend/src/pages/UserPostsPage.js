import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/Feed.css'; // Reuse existing feed styles

const UserPostsPage = () => {
  const { email } = useParams();
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get posts created by the user
        const userRes = await axios.get(`/api/ideas/user/${email}`);
        setUserPosts(userRes.data);

        // Get posts liked by the user
        const likedRes = await axios.get(`/api/ideas/liked-by/${email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLikedPosts(likedRes.data);
      } catch (err) {
        console.error('Error loading user posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email, token]);

  const renderIdea = (idea) => (
    <div key={idea._id} className="idea-card">
      <div className="idea-header">
        <span className="idea-title">{idea.title}</span>
      </div>
      <p className="idea-author"><strong>Posted by:</strong> {idea.name || idea.email}</p>
      <p className="idea-description"><strong>Description:</strong> {idea.description}</p>
      {idea.file && (
        <div className="file-preview">
          <img
            src={`/uploads/${idea.file}`}
            alt="idea file"
            className="preview-image"
          />
        </div>
      )}
      <div className="idea-meta">
        <span>Domain: {idea.domain}</span>
        <span>Budget: ${idea.budget}</span>
        <span>Stage: {idea.projectStage}</span>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="feed-container">
        <h1>Posts by {email}</h1>
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : (
          <>
            <h2>Created Posts</h2>
            <div className="feed-grid">
              {userPosts.length > 0 ? userPosts.map(renderIdea) : <p>No posts found.</p>}
            </div>

            <h2 style={{ marginTop: '40px' }}>Liked Posts</h2>
            <div className="feed-grid">
              {likedPosts.length > 0 ? likedPosts.map(renderIdea) : <p>No liked posts.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPostsPage;