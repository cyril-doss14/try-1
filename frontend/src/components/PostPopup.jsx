import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/PostPopup.css';

const PostPopup = ({ post, onClose, onAuthorClick }) => {
  if (!post) return null;

  const userId =
    post.userId?._id || post.userId?.id || (typeof post.userId === 'string' ? post.userId : null);

  return (
    <div className="custom-popup">
      <div className="custom-popup-inner">
        <button className="popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>{post.title}</h2>
        <p>
          <strong>Author:</strong>{' '}
          <span
            style={{ color: '#007bff', cursor: 'pointer' }}
            onClick={() => userId && onAuthorClick?.(userId)}
          >
            {post.name || post.email}
          </span>
        </p>
        <p><strong>Description:</strong> {post.description}</p>
        <p><strong>Domain:</strong> {post.domain}</p>
        <p><strong>Stage:</strong> {post.projectStage}</p>
        <p><strong>Budget:</strong> £{post.budget}</p>
        <p><strong>Location:</strong> {post.location}</p>
        {post.file && (
          <img
            src={`/uploads/${post.file}`}
            alt={post.title}
            className="preview-image"
          />
        )}
      </div>
    </div>
  );
};

export default PostPopup;
