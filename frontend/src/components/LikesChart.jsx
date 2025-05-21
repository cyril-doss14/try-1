import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/LikesChart.css";

const LikesChart = ({ ideaId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        const res = await axios.get(
          `/api/ideas/posts-by-user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const idea = res.data.find((post) => post._id === ideaId);
        if (!idea || typeof idea.likeTimestamps !== "object") {
          console.warn("❌ likeTimestamps missing or invalid for idea:", idea);
          setLoading(false);
          return;
        }

        const timestampsArray = Object.values(idea.likeTimestamps).flat();

        const likeCounts = {};
        timestampsArray.forEach((timestamp) => {
          const dateKey = new Date(timestamp).toISOString().split("T")[0];
          likeCounts[dateKey] = (likeCounts[dateKey] || 0) + 1;
        });

        const today = new Date();
        const last30Days = Array.from({ length: 31 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - i);
          return date.toISOString().split("T")[0];
        }).reverse();

        const chartData = last30Days.map((date) => ({
          date,
          likes: likeCounts[date] || 0,
        }));

        setData(chartData);
      } catch (err) {
        console.error("Error fetching like chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [ideaId]);

  if (loading) return <div>Loading chart...</div>;

  return (
    <div className="likes-chart-popup">
      <button className="close-btn" onClick={() => window.location.reload()}>
        ×
      </button>
      <h3>📊 Likes Over the Last 30 Days</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="likes" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LikesChart;