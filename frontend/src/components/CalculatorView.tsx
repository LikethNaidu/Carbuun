import React, { useState } from "react";
import type { FootprintInput, FootprintData } from "../types";

interface CalculatorViewProps {
  onCalculate: (data: FootprintInput) => Promise<FootprintData | null>;
  latestData: FootprintData | null;
  loading: boolean;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  onCalculate,
  latestData,
  loading,
}) => {
  const [formData, setFormData] = useState<FootprintInput>({
    travel_dist: latestData?.travel_dist ?? 15,
    transport_mode: latestData?.transport_mode ?? "car_petrol",
    electricity_bill: latestData?.electricity_bill ?? 80,
    food_preference: latestData?.food_preference ?? "meat_medium",
    shopping_freq: latestData?.shopping_freq ?? "medium",
    household_size: latestData?.household_size ?? 2,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "travel_dist" ||
        name === "electricity_bill" ||
        name === "household_size"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Security: Input validation
    if (formData.travel_dist < 0) {
      setValidationError("Travel distance cannot be negative.");
      return;
    }
    if (formData.electricity_bill < 0) {
      setValidationError("Electricity bill cannot be negative.");
      return;
    }
    if (formData.household_size < 1) {
      setValidationError("Household size must be at least 1.");
      return;
    }

    await onCalculate(formData);
  };

  // Calculate percentages for chart/visual breakdown
  const transportPct = latestData
    ? Math.round((latestData.co2_transport / latestData.co2_total) * 100)
    : 0;
  const electricityPct = latestData
    ? Math.round((latestData.co2_electricity / latestData.co2_total) * 100)
    : 0;
  const foodPct = latestData
    ? Math.round((latestData.co2_food / latestData.co2_total) * 100)
    : 0;
  const shoppingPct = latestData
    ? Math.round((latestData.co2_shopping / latestData.co2_total) * 100)
    : 0;

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-neoGreen";
    if (score >= 65) return "bg-neoYellow";
    if (score >= 45) return "bg-neoBlue text-white";
    return "bg-neoOrange text-white";
  };

  const getScoreBadgeText = (score: number) => {
    if (score >= 85) return "🏆 Climate Hero";
    if (score >= 65) return "🌳 Carbon Champion";
    if (score >= 45) return "🌿 Eco Explorer";
    return "🌱 Green Starter";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo relative">
        <h2 className="text-2xl font-display font-bold mb-6 border-b-3 border-black pb-2 bg-neoYellow px-2 -mx-6 -mt-6 rounded-t-lg">
          Calculate Your Footprint
        </h2>
        {validationError && (
          <div className="bg-neoOrange text-white border-3 border-black p-3 rounded-lg shadow-neoSm mb-4 font-semibold">
            ⚠️ {validationError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="travel_dist"
              className="block font-bold mb-1 text-sm text-neoDark"
            >
              Daily Travel Distance (km)
            </label>
            <input
              id="travel_dist"
              name="travel_dist"
              type="number"
              min="0"
              step="any"
              value={formData.travel_dist}
              onChange={handleChange}
              className="w-full border-3 border-black p-2.5 rounded-lg focus:outline-none focus:bg-yellow-50 font-bold"
              required
            />
          </div>

          <div>
            <label
              htmlFor="transport_mode"
              className="block font-bold mb-1 text-sm text-neoDark"
            >
              Mode of Transportation
            </label>
            <select
              id="transport_mode"
              name="transport_mode"
              value={formData.transport_mode}
              onChange={handleChange}
              className="w-full border-3 border-black p-2.5 rounded-lg focus:outline-none focus:bg-yellow-50 font-bold bg-white"
            >
              <option value="car_petrol">🚗 Petrol Car</option>
              <option value="car_diesel">🚗 Diesel Car</option>
              <option value="car_ev">⚡ Electric Vehicle (EV)</option>
              <option value="public_transport">🚌 Public Transport (Bus/Train)</option>
              <option value="bicycle">🚲 Bicycle</option>
              <option value="walk">🚶 Walking</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="electricity_bill"
              className="block font-bold mb-1 text-sm text-neoDark"
            >
              Monthly Electricity Bill ($ or local equivalent)
            </label>
            <input
              id="electricity_bill"
              name="electricity_bill"
              type="number"
              min="0"
              step="any"
              value={formData.electricity_bill}
              onChange={handleChange}
              className="w-full border-3 border-black p-2.5 rounded-lg focus:outline-none focus:bg-yellow-50 font-bold"
              required
            />
          </div>

          <div>
            <label
              htmlFor="food_preference"
              className="block font-bold mb-1 text-sm text-neoDark"
            >
              Diet / Food Preference
            </label>
            <select
              id="food_preference"
              name="food_preference"
              value={formData.food_preference}
              onChange={handleChange}
              className="w-full border-3 border-black p-2.5 rounded-lg focus:outline-none focus:bg-yellow-50 font-bold bg-white"
            >
              <option value="meat_heavy">🥩 Heavy Meat Eater</option>
              <option value="meat_medium">🍖 Average Meat/Fish Eater</option>
              <option value="vegetarian">🥗 Vegetarian (No Meat/Fish)</option>
              <option value="vegan">🌱 Vegan (Strictly Plant-Based)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="shopping_freq"
              className="block font-bold mb-1 text-sm text-neoDark"
            >
              Shopping Frequency (Clothing, Electronics, Goods)
            </label>
            <select
              id="shopping_freq"
              name="shopping_freq"
              value={formData.shopping_freq}
              onChange={handleChange}
              className="w-full border-3 border-black p-2.5 rounded-lg focus:outline-none focus:bg-yellow-50 font-bold bg-white"
            >
              <option value="high">🛍️ High (Frequent purchases/fast fashion)</option>
              <option value="medium">🛒 Medium (Average consumer buying habits)</option>
              <option value="low">📦 Low (Minimalist / buy only essentials)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="household_size"
              className="block font-bold mb-1 text-sm text-neoDark"
            >
              Household Size (Number of occupants)
            </label>
            <input
              id="household_size"
              name="household_size"
              type="number"
              min="1"
              value={formData.household_size}
              onChange={handleChange}
              className="w-full border-3 border-black p-2.5 rounded-lg focus:outline-none focus:bg-yellow-50 font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neoGreen text-black border-3 border-black font-display font-bold py-3 rounded-lg shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all active:translate-x-0 active:translate-y-0 active:shadow-neo disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Calculate Carbon Footprint →"}
          </button>
        </form>
      </div>

      {/* Results View */}
      <div className="flex flex-col justify-between">
        {latestData ? (
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo h-full flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold mb-6 border-b-3 border-black pb-2 bg-neoBlue text-white px-2 -mx-6 -mt-6 rounded-t-lg">
                Your Environmental Impact
              </h2>

              {/* Total Footprint */}
              <div className="bg-neoBackground border-3 border-black p-4 rounded-lg shadow-neoSm mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-gray-500">Total Monthly Footprint</p>
                  <p className="text-4xl font-display font-bold text-neoDark">
                    {latestData.co2_total.toFixed(1)} <span className="text-lg">kg CO₂</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold uppercase text-gray-500">Eco Score</p>
                  <span className={`inline-block border-3 border-black px-3 py-1 font-bold rounded-lg shadow-neoSm ${getScoreBadgeColor(latestData.sustainability_score)}`}>
                    {latestData.sustainability_score}
                  </span>
                </div>
              </div>

              {/* Score Level Badge */}
              <div className="mb-6">
                <p className="text-sm font-bold uppercase text-gray-500 mb-2">Sustainability Level</p>
                <div className={`text-center font-display font-bold text-xl border-3 border-black p-3 rounded-lg shadow-neoSm bg-neoGreen`}>
                  {getScoreBadgeText(latestData.sustainability_score)}
                </div>
              </div>

              {/* Category Breakdown list */}
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase text-gray-500">Category Breakdown</p>

                {/* Transportation */}
                <div>
                  <div className="flex justify-between font-bold text-sm mb-1">
                    <span>🚗 Transportation ({transportPct}%)</span>
                    <span>{latestData.co2_transport.toFixed(1)} kg CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 border-3 border-black h-6 rounded-md overflow-hidden">
                    <div
                      className="bg-neoOrange h-full border-r-3 border-black transition-all"
                      style={{ width: `${transportPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Electricity */}
                <div>
                  <div className="flex justify-between font-bold text-sm mb-1">
                    <span>⚡ Electricity ({electricityPct}%)</span>
                    <span>{latestData.co2_electricity.toFixed(1)} kg CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 border-3 border-black h-6 rounded-md overflow-hidden">
                    <div
                      className="bg-neoYellow h-full border-r-3 border-black transition-all"
                      style={{ width: `${electricityPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Food */}
                <div>
                  <div className="flex justify-between font-bold text-sm mb-1">
                    <span>🥩 Diet & Food ({foodPct}%)</span>
                    <span>{latestData.co2_food.toFixed(1)} kg CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 border-3 border-black h-6 rounded-md overflow-hidden">
                    <div
                      className="bg-neoGreen h-full border-r-3 border-black transition-all"
                      style={{ width: `${foodPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Shopping */}
                <div>
                  <div className="flex justify-between font-bold text-sm mb-1">
                    <span>🛍️ Consumer Shopping ({shoppingPct}%)</span>
                    <span>{latestData.co2_shopping.toFixed(1)} kg CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 border-3 border-black h-6 rounded-md overflow-hidden">
                    <div
                      className="bg-neoBlue h-full border-r-3 border-black transition-all"
                      style={{ width: `${shoppingPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t-3 border-dashed border-black pt-4 text-xs font-bold text-gray-500">
              💡 Tip: Head over to the **AI Recommendations** or **Digital Twin Simulator** tabs to see how minor changes can slash your footprint and save you money!
            </div>
          </div>
        ) : (
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo h-full flex flex-col justify-center items-center text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-display font-bold mb-2">No Carbon Data Yet</h3>
            <p className="font-bold text-gray-500 max-w-sm">
              Fill out the questionnaire on the left to calculate your footprint and activate personalized sustainability guidance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
