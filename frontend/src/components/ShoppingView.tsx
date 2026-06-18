import React, { useState } from "react";
import type { ShoppingAdvice } from "../types";

interface ShoppingViewProps {
  onGetAdvice: (category: string) => Promise<ShoppingAdvice | null>;
  loading: boolean;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  onGetAdvice,
  loading,
}) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ShoppingAdvice | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const res = await onGetAdvice(query);
    if (res) {
      setResult(res);
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    const imp = impact.toLowerCase();
    if (imp.includes("extremely high")) return "bg-neoOrange text-white animate-pulse";
    if (imp.includes("high")) return "bg-neoOrange text-white";
    if (imp.includes("medium")) return "bg-neoYellow";
    return "bg-neoGreen";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo">
        <h2 className="text-3xl font-display font-bold mb-2">Sustainable Shopping Advisor</h2>
        <p className="font-bold text-gray-500">
          Enter a product category (like **shoes**, **clothing**, or **electronics**) to evaluate its carbon footprint and discover eco-conscious alternatives.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={query}
            aria-label="Product category to search"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search category (e.g., Running Shoes, Jeans, Smartphone...)"
            className="flex-grow border-3 border-black p-3.5 rounded-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-2 focus:bg-yellow-50 font-bold"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-neoYellow text-black border-3 border-black font-display font-bold px-6 py-3.5 rounded-lg shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all active:translate-x-0 active:translate-y-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Impact →"}
          </button>
        </form>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-live="polite" aria-relevant="additions">
          {/* Product Impact Summary Card */}
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo lg:col-span-1 flex flex-col justify-between">
            <div>
              <span className={`inline-block border-3 border-black px-2.5 py-1 rounded-lg text-xs font-bold shadow-neoSm mb-4 ${getImpactBadgeColor(result.estimated_impact)}`}>
                Estimated Impact: {result.estimated_impact.split(".")[0]}
              </span>
              
              <h3 className="text-2xl font-display font-bold mb-4">{result.category} Footprint</h3>
              
              <div className="bg-neoBackground border-3 border-black p-4 rounded-lg shadow-neoSm mb-4 text-center">
                <p className="text-xs uppercase font-bold text-gray-500">Average Emissions</p>
                <p className="text-4xl font-display font-bold text-neoOrange">
                  ~{result.co2_estimate.toFixed(1)} <span className="text-sm">kg CO₂</span>
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">per standard unit manufactured</p>
              </div>

              <p className="font-bold text-sm text-gray-500 leading-relaxed">
                {result.explanation}
              </p>
            </div>
            
            <div className="text-xs font-bold text-gray-400 mt-6 border-t border-gray-100 pt-3">
              * Calculations are estimations based on typical supply chain carbon footprints.
            </div>
          </div>

          {/* Alternatives Card */}
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo lg:col-span-2">
            <h3 className="text-2xl font-display font-bold mb-4">Recommended Eco-Friendly Alternatives</h3>
            
            <div className="space-y-4">
              {result.alternatives.map((alt, index) => {
                const savingsPct = Math.round(((result.co2_estimate - alt.co2) / result.co2_estimate) * 100);
                return (
                  <div
                    key={index}
                    className="border-3 border-black p-5 rounded-xl bg-neoBackground shadow-neoSm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="sprout icon">🌿</span>
                        <h4 className="font-display font-bold text-lg">{alt.name}</h4>
                      </div>
                      <p className="text-sm font-bold text-neoDark">
                        {alt.desc}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        <span className="text-neoGreen">★ Better because: </span>{alt.better_because}
                      </p>
                    </div>

                    <div className="bg-white border-3 border-black p-3 rounded-lg text-center shadow-neoSm min-w-[120px] w-full md:w-auto">
                      <p className="text-xs font-bold text-gray-400">Carbon Footprint</p>
                      <p className="text-xl font-display font-bold text-neoGreen">
                        {alt.co2.toFixed(1)} <span className="text-xs font-sans">kg</span>
                      </p>
                      <span className="inline-block bg-neoGreen text-black text-[10px] px-1.5 py-0.5 rounded font-bold border border-black mt-1">
                        -{savingsPct}% CO₂
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
