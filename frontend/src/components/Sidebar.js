import { useNavigate, useLocation } from "react-router-dom";
import {
  Newspaper,
  Users,
  MessageSquare,
  FileText,
  UserRound,
  PencilLine
} from "lucide-react";
import "../styles/Home.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Feed", icon: <Newspaper size={26} />, path: "/feed" },
    { label: "Following", icon: <Users size={26} />, path: "/followers" },
    { label: "Chat", icon: <MessageSquare size={26} />, path: "/chat" },
    { label: "My Posts", icon: <FileText size={26} />, path: "/my-posts" },
    { label: "Post Idea", icon: <PencilLine size={26} />, path: "/post-idea" },
    { label: "Profile", icon: <UserRound size={26} />, path: "/user-portfolio" },
  ];

  return (
    <div className="sidebar">
      {menuItems.map((item) => (
        <div
          key={item.label}
          className={`icon-card ${isActive(item.path) ? "selected" : ""}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
