import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header"; // ✅ Import Header
import "../styles/Home.css";   // For layout styles

const DashboardLayout = () => {
  return (
    <>
      <Header /> {/* ✅ Add Header here */}
      <div className="home-container">
        <Sidebar />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;