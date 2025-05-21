import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import MessageBox from "../components/MessageBox";
import '../styles/ideapost.css';

const IdeaPostForm = ({ onPostCreation = () => {} }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    title: "",
    description: "",
    domain: "Tech",
    budget: "",
    projectStage: "Beginning",
    location: "",
    file: null,
    fileName: "",
  });

  const [message, setMessage] = useState("");

  const domains = ["Tech", "Healthcare", "Finance", "Education", "Other"];
  const projectStages = ["Beginning", "Continuing", "Final Stage"];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { state: { from: 'idea-submission' } });
      return;
    }

    if (userData && userData.email && userData.name) {
      setFormData(prev => ({
        ...prev,
        email: userData.email,
        name: userData.name
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file, fileName: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!userId) {
      setMessage("User not logged in. Please log in first.");
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== "fileName" && formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });
    formDataToSend.append('userId', userId);

    try {
      const res = await axios.post(`/api/ideas/submit`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
          "x-auth-token": token
        }
      });

      setMessage(res.data.msg);
      onPostCreation();

      // Auto-dismiss after showing message
      setTimeout(() => {
        setMessage("");
        navigate("/feed", { replace: true });
      }, 2000);

    } catch (error) {
      setMessage(error.response?.data?.msg || "Error submitting idea");
    }
  };

  const handleSkip = () => {
    onPostCreation();
    navigate("/feed", { replace: true });
  };

  return (
    <div className="page-wrapper">
      <MessageBox message={message} onClose={() => setMessage("")} />

      <div className="form-container" style={{ filter: message ? 'blur(2px)' : 'none' }}>
        <h1 className="form-header">Post Your Idea</h1>
        <form onSubmit={handleSubmit} className="custom-form">
          <div className="form-section">
            <h2 className="section-header">Basic Information</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} readOnly className="read-only-field" />
              </div>
              <div className="form-field spaced-field">
                <label>Email</label>
                <input type="email" value={formData.email} readOnly className="read-only-field" />
              </div>
            </div>
            <div className="form-field">
              <label>Project Title</label>
              <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea name="description" placeholder="Short Description about your project" onChange={handleChange} required />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-header">Project Details</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Domain</label>
                <select name="domain" onChange={handleChange} value={formData.domain}>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Budget (GBP)</label>
                <input type="number" name="budget" placeholder="Estimated Budget" onChange={handleChange} value={formData.budget} required />
              </div>
              <div className="form-field">
                <label>Project Stage</label>
                <select name="projectStage" onChange={handleChange} value={formData.projectStage}>
                  {projectStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Location</label>
                <input type="text" name="location" placeholder="City, Country" onChange={handleChange} value={formData.location} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-header">Attachments</h2>
            <div className="form-field">
              <label>Upload File</label>
              <div className="file-upload">
                <label className="file-upload-btn">
                  Choose File
                  <input type="file" name="file" onChange={handleFileChange} style={{ display: 'none' }} required />
                </label>
                <span className="file-name">{formData.fileName || 'No file chosen'}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="form-btn skip-btn" onClick={handleSkip}>Skip</button>
            <button type="submit" className="form-btn submit-btn">Create Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdeaPostForm;