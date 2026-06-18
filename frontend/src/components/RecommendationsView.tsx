import React from "react";
import type { RecommendationItem } from "../types";

interface RecommendationsViewProps {
  recommendations: RecommendationItem[];
  loading: boolean;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  loading,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-neoGreen";
      case "Medium":
        return "bg-neoYellow";
      case "Hard":
        return "bg-neoOrange text-white";
      default:
        return "bg-gray-200";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Transportation":
        return "bg-neoOrange text-white";
      case "Electricity":
        return "bg-neoYellow text-black";
      case "Food":
        return "bg-neoGreen text-black";
      case "Shopping":
        return "bg-neoBlue text-white";
      default:
        return "bg-gray-200 text-black";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo">
        <h2 className="text-3xl font-display font-bold mb-2">Personalized Eco-Recommendations</h2>
        <p className="font-bold text-gray-500">
          Our intelligent engine analyzed your habits and identified these high-impact changes to reduce your emissions and save money.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 font-bold">Loading recommendations...</div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white border-3 border-black p-12 rounded-xl text-center shadow-neo">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-xl font-bold mb-2">No recommendations available yet</h3>
          <p className="text-gray-500 font-bold">Complete the footprint calculator to generate your recommendations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-white border-3 border-black p-6 rounded-xl shadow-neo flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all"
            >
              <div>
                {/* Header Row */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`border-3 border-black px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-neoSm ${getCategoryBadgeColor(rec.category)}`}>
                    {rec.category}
                  </span>
                  <span className={`border-3 border-black px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-neoSm ${getDifficultyColor(rec.difficulty)}`}>
                    {rec.difficulty}
                  </span>
                </div>

                {/* Recommendation Description */}
                <p className="text-lg font-bold text-neoDark mb-6 leading-snug">
                  "{rec.text}"
                </p>
              </div>

              {/* Stats Footer Row */}
              <div className="grid grid-cols-2 gap-4 border-t-3 border-dashed border-black pt-4 mt-auto">
                <div className="bg-neoBackground border-3 border-black p-2 rounded-lg text-center shadow-neoSm">
                  <p className="text-xs uppercase font-bold text-gray-500">Carbon Savings</p>
                  <p className="text-xl font-display font-bold text-neoGreen">
                    -{rec.carbon_saving} <span className="text-xs">kg/mo</span>
                  </p>
                </div>
                <div className="bg-neoBackground border-3 border-black p-2 rounded-lg text-center shadow-neoSm">
                  <p className="text-xs uppercase font-bold text-gray-500">Cost Savings</p>
                  <p className="text-xl font-display font-bold text-neoYellow">
                    +${rec.cost_saving.toFixed(0)} <span className="text-xs">/mo</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
