import React, { useEffect, useState } from "react";
import type { CommunityStats } from "../types";

interface CommunityViewProps {
  stats: CommunityStats | null;
  loading: boolean;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ stats, loading }) => {
  const [carbonSavedLive, setCarbonSavedLive] = useState(0);

  useEffect(() => {
    if (stats) {
      setCarbonSavedLive(stats.total_carbon_saved);
    }
  }, [stats]);

  // Live counter animation to make the page feel alive and premium!
  useEffect(() => {
    if (!stats) return;

    const interval = setInterval(() => {
      setCarbonSavedLive((prev) => prev + 0.15); // Add 0.15kg per second
    }, 1000);

    return () => clearInterval(interval);
  }, [stats]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-neoGreen";
    if (score >= 60) return "text-neoYellow";
    return "text-neoOrange";
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo">
        <h2 className="text-3xl font-display font-bold mb-2">Community Impact Hub</h2>
        <p className="font-bold text-gray-500">
          GreenGuide AI users are working collectively to lower emissions and build a sustainable future. See our joint statistics below.
        </p>
      </div>

      {loading || !stats ? (
        <div className="text-center py-12 font-bold">Loading community stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Users */}
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👥</span>
              <h3 className="font-display font-bold text-lg">Active Champions</h3>
            </div>
            <div>
              <p className="text-5xl font-display font-bold text-neoBlue">
                {stats.total_users}
              </p>
              <p className="text-xs font-bold text-gray-400 mt-2">
                Users tracking and reducing their footprints.
              </p>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌿</span>
              <h3 className="font-display font-bold text-lg">Average Eco-Score</h3>
            </div>
            <div>
              <p className={`text-5xl font-display font-bold ${getScoreColor(stats.average_score)}`}>
                {stats.average_score} <span className="text-lg">/100</span>
              </p>
              <p className="text-xs font-bold text-gray-400 mt-2">
                Standard level: **Eco Explorer / Carbon Champion**
              </p>
            </div>
          </div>

          {/* Card 3: Live Carbon Saved */}
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all bg-neoDark text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌳</span>
              <h3 className="font-display font-bold text-lg text-neoGreen">Collective Savings</h3>
            </div>
            <div>
              <p className="text-4xl font-display font-bold text-neoGreen tabular-nums">
                {carbonSavedLive.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                <span className="text-sm">kg CO₂</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 bg-neoGreen rounded-full animate-ping"></span>
                <p className="text-[10px] font-bold text-neoGreen">
                  Live Counter • Growing by 0.15 kg/sec
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Achievement Section */}
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo">
        <h3 className="text-xl font-display font-bold mb-4">Current Collective Milestones</h3>
        <div className="space-y-4 font-bold text-sm">
          {/* Milestone 1 */}
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span>🚀 Goal: Save 50,000 kg CO₂</span>
            <span className="bg-neoGreen text-black border-2 border-black px-2 py-0.5 rounded text-xs">
              {stats ? `${Math.min(100, Math.round((stats.total_carbon_saved / 50000) * 100))}% Completed` : "Loading..."}
            </span>
          </div>

          {/* Milestone 2 */}
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span>🏆 Average Score Goal: Reach 75/100</span>
            <span className="bg-neoYellow text-black border-2 border-black px-2 py-0.5 rounded text-xs">
              {stats ? `${Math.min(100, Math.round((stats.average_score / 75) * 100))}% Completed` : "Loading..."}
            </span>
          </div>

          {/* Milestone 3 */}
          <div className="flex justify-between items-center">
            <span>👥 Target Community: 1,500 active users</span>
            <span className="bg-neoBlue text-white border-2 border-black px-2 py-0.5 rounded text-xs">
              {stats ? `${Math.min(100, Math.round((stats.total_users / 1500) * 100))}% Completed` : "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
