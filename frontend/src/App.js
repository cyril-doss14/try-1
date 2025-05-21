import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import IdeaPostForm from './pages/IdeaPostForm';
import Home from './pages/Home';
import Feed from './pages/Feed';
import MyPosts from './pages/MyPosts';
import MyFollowers from './pages/MyFollowers';
import DashboardLayout from './components/DashboardLayout';
import UserProfile from './pages/UserProfile';
import LandingPage from './pages/LandingPage';
import ChatPage from './components/ChatPage';
import UserPortfolio from './pages/UserPortfolio';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Standalone Page (no Sidebar) */}
          

          {/* Routes wrapped with Sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/followers" element={<MyFollowers />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/post-idea" element={<IdeaPostForm />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/user-portfolio" element={<UserPortfolio />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;