import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/IdeaOfTheDay.css";

const IdeaOfTheDay = () => {
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const res = await axios.get(`/api/ideas/idea-of-the-day`);
        setIdea(res.data);
      } catch (err) {
        console.log("❌ No idea of the day available.");
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, []);

  useEffect(() => {
    const alreadyShown = localStorage.getItem("confettiShown");

    if (idea && !alreadyShown) {
      let duration = 3 * 1000;
      let end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);

        confetti({
          particleCount: 200,
          spread: 120,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
          colors: ["#bb0000", "#00cc99", "#ffcc00", "#6633ff"],
        });
      }, 300);

      localStorage.setItem("confettiShown", "true");
    }
  }, [idea]);

  if (loading || !idea) return null;

  const handleAuthorClick = () => {
    const userId = idea.userId?._id || idea.userId?.id || idea.userId;
    if (userId) navigate(`/user/${userId}`);
  };

  return (
    <div className="flex justify-center mb-8">
      <div className="idea-day-card animate-tilt">
        <div className="mb-4">
          <div
            className="text-purple-800 tracking-wide text-2xl flex items-center gap-2 bg-yellow-100 p-2 rounded"
            style={{ fontWeight: "900", textTransform: "uppercase" }}
          >
            <span className="floating-icon">🏆</span>
            idea of the day
          </div>

          <div className="text-purple-600 font-semibold text-sm mt-2">
            👍 Likes: {idea.likes ?? 0}
          </div>
          <div className="text-purple-600 font-semibold text-sm mt-1">
            🤝 Collaborators: {idea.collaborators?.length ?? 0}
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-1">{idea.title}</h2>
        <p className="text-gray-700 mb-3">{idea.description}</p>

        <div className="text-sm text-gray-700 flex flex-wrap items-center mb-3">
          <span>
            <strong>Posted by:</strong>{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={handleAuthorClick}
            >
              {idea.name || idea.email || "Unknown"}
            </span>
          </span>

          <span className="text-gray-400">&nbsp;|&nbsp;</span>
          <span><strong>Domain:</strong> {idea.domain}</span>
          <span className="text-gray-400">&nbsp;|&nbsp;</span>
          <span><strong>Budget:</strong> £{idea.budget}</span>
          <span className="text-gray-400">&nbsp;|&nbsp;</span>
          <span><strong>Stage:</strong> {idea.projectStage}</span>
        </div>

        {idea.file && (
          <img
            src={`/uploads/${idea.file}`}
            alt="Idea Visual"
            className="rounded-lg max-h-64 object-cover w-full mt-2"
          />
        )}
      </div>
    </div>
  );
};

export default IdeaOfTheDay;