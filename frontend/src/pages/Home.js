import { useNavigate, useLocation } from "react-router-dom";
import { FaNewspaper, FaUsers, FaComments, FaFileAlt, FaUser } from "react-icons/fa";
import "../styles/Home.css"; // Ensure this CSS file exists
import Feed from './Feed'; // Import the Feed component
import MyFollowers from './MyFollowers'; // Import the MyFollowers component

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  return (
    <div className="home-container">
      <div className="sidebar">
        {/* Navigation for different sections */}
        <div className="icon-card" onClick={() => navigate("/feed")}>
          <FaNewspaper size={30} />
          <p>Feed</p>
        </div>
        <div className="icon-card" onClick={() => navigate("/followers")}>
          <FaUsers size={30} />
          <p>My Followers</p>
        </div>
        <div className="icon-card" onClick={() => navigate("/chat")}>
          <FaComments size={30} />
          <p>Chat</p>
        </div>
        <div className="icon-card" onClick={() => navigate("/my-posts")}>
          <FaFileAlt size={30} />
          <p>My Posts</p>
        </div>
        <div className="icon-card" onClick={() => navigate("/post-idea")}>
          <FaFileAlt size={30} />
          <p>Post Idea</p>
        </div>
        <div className="icon-card" onClick={() => navigate("/portfolio")}>
          <FaUser size={30} />
          <p>User Portfolio</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Conditionally render Feed or MyFollowers based on the current route */}
        {location.pathname === "/followers" ? <MyFollowers /> : <Feed />}
      </div>
    </div>
  );
};

export default Home;