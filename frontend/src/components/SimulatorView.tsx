import React, { useState, useEffect } from "react";
import type { SimulationResult, FootprintData } from "../types";

interface SimulatorViewProps {
  onSimulate: (inputs: {
    public_transport_days: number;
    electricity_reduction_pct: number;
    vegetarian_days: number;
  }) => Promise<SimulationResult | null>;
  latestFootprint: FootprintData | null;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  onSimulate,
  latestFootprint,
}) => {
  const [inputs, setInputs] = useState({
    public_transport_days: 0,
    electricity_reduction_pct: 0,
    vegetarian_days: 0,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Run simulation initially and when inputs change
    const runSimulation = async () => {
      setLoading(true);
      const res = await onSimulate(inputs);
      if (res) {
        setResult(res);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      runSimulation();
    }, 250); // Debounce API calls by 250ms for smooth slider feel

    return () => clearTimeout(debounceTimer);
  }, [inputs, onSimulate, latestFootprint]);

  const handleSliderChange = (name: string, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Simulator Inputs */}
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo relative">
        <h2 className="text-2xl font-display font-bold mb-6 border-b-3 border-black pb-2 bg-neoGreen px-2 -mx-6 -mt-6 rounded-t-lg">
          Configure Your Digital Twin
        </h2>
        <p className="font-bold text-gray-500 mb-6">
          Adjust the sliders below to simulate alternative lifestyle choices and predict your future environmental and financial savings.
        </p>

        <div className="space-y-6">
          {/* Slider 1: Public Transit */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="public_transport_days" className="font-bold text-neoDark">
                🚌 Commute by Public Transport
              </label>
              <span className="bg-neoOrange text-white border-3 border-black px-2 py-0.5 rounded-lg text-sm font-bold shadow-neoSm">
                {inputs.public_transport_days} days/week
              </span>
            </div>
            <input
              id="public_transport_days"
              type="range"
              min="0"
              max="7"
              value={inputs.public_transport_days}
              onChange={(e) =>
                handleSliderChange("public_transport_days", parseInt(e.target.value))
              }
              className="w-full accent-neoOrange h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer border-3 border-black"
            />
            <p className="text-xs text-gray-400 mt-1 font-bold">
              Original commute: {latestFootprint?.transport_mode.replace("_", " ")} ({latestFootprint?.travel_dist} km/day)
            </p>
          </div>

          {/* Slider 2: Electricity Reduction */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="electricity_reduction_pct" className="font-bold text-neoDark">
                ⚡ Reduce Electricity Usage
              </label>
              <span className="bg-neoYellow text-black border-3 border-black px-2 py-0.5 rounded-lg text-sm font-bold shadow-neoSm">
                {inputs.electricity_reduction_pct}% reduction
              </span>
            </div>
            <input
              id="electricity_reduction_pct"
              type="range"
              min="0"
              max="100"
              value={inputs.electricity_reduction_pct}
              onChange={(e) =>
                handleSliderChange("electricity_reduction_pct", parseInt(e.target.value))
              }
              className="w-full accent-neoYellow h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer border-3 border-black"
            />
            <p className="text-xs text-gray-400 mt-1 font-bold">
              E.g., Turn off standby power, optimize AC/heating, use solar.
            </p>
          </div>

          {/* Slider 3: Vegetarian Meals */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="vegetarian_days" className="font-bold text-neoDark">
                🥗 Vegetarian Days
              </label>
              <span className="bg-neoGreen text-black border-3 border-black px-2 py-0.5 rounded-lg text-sm font-bold shadow-neoSm">
                {inputs.vegetarian_days} days/week
              </span>
            </div>
            <input
              id="vegetarian_days"
              type="range"
              min="0"
              max="7"
              value={inputs.vegetarian_days}
              onChange={(e) =>
                handleSliderChange("vegetarian_days", parseInt(e.target.value))
              }
              className="w-full accent-neoGreen h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer border-3 border-black"
            />
            <p className="text-xs text-gray-400 mt-1 font-bold">
              Substitute meat meals with plant-based alternatives.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Results */}
      <div className="flex flex-col justify-between">
        {result ? (
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo h-full flex flex-col justify-between relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center font-bold text-lg">
                Calculating simulation...
              </div>
            )}
            <div>
              <h2 className="text-2xl font-display font-bold mb-6 border-b-3 border-black pb-2 bg-neoBlue text-white px-2 -mx-6 -mt-6 rounded-t-lg">
                Simulated Forecast
              </h2>

              {/* Reduction Percentage */}
              <div className="bg-neoBackground border-3 border-black p-4 rounded-lg shadow-neoSm mb-6 text-center">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Carbon Reduction</p>
                <p className="text-5xl font-display font-bold text-neoGreen">
                  {result.reduction_pct}%
                </p>
                <p className="text-sm font-bold text-gray-500 mt-1">
                  from your current lifestyle baseline
                </p>
              </div>

              {/* Footprint Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-3 border-black p-3 rounded-lg shadow-neoSm bg-gray-100">
                  <p className="text-xs font-bold uppercase text-gray-400">Current Monthly</p>
                  <p className="text-xl font-display font-bold text-gray-500">
                    {result.original_co2.toFixed(1)} <span className="text-xs font-bold">kg CO₂</span>
                  </p>
                </div>
                <div className="border-3 border-black p-3 rounded-lg shadow-neo bg-neoGreen">
                  <p className="text-xs font-bold uppercase text-neoDark">Predicted Monthly</p>
                  <p className="text-xl font-display font-bold text-neoDark">
                    {result.new_co2.toFixed(1)} <span className="text-xs font-bold">kg CO₂</span>
                  </p>
                </div>
              </div>

              {/* Annual Savings */}
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase text-gray-500">Predicted Annual Impact</p>
                
                {/* Carbon Saved */}
                <div className="flex items-center justify-between border-3 border-black p-3 rounded-lg shadow-neoSm bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌳</span>
                    <div>
                      <p className="font-bold text-sm">Carbon Saved Yearly</p>
                      <p className="text-xs text-gray-400 font-bold">Equivalent to planting {Math.round(result.annual_saving_co2 / 22)} trees</p>
                    </div>
                  </div>
                  <span className="font-display font-bold text-xl text-neoGreen">
                    -{result.annual_saving_co2.toFixed(0)} kg CO₂
                  </span>
                </div>

                {/* Money Saved */}
                <div className="flex items-center justify-between border-3 border-black p-3 rounded-lg shadow-neoSm bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-bold text-sm">Money Saved Yearly</p>
                      <p className="text-xs text-gray-400 font-bold">Estimated utility & fuel cost savings</p>
                    </div>
                  </div>
                  <span className="font-display font-bold text-xl text-neoYellow">
                    +${result.annual_saving_cost.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t-3 border-dashed border-black pt-4 text-xs font-bold text-gray-500">
              ⚡ This simulator replicates a digital twin of your carbon output. By taking action on these variables in your real life, you can match these outcomes!
            </div>
          </div>
        ) : (
          <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo h-full flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-bold mb-2">Awaiting Carbon Data</h3>
            <p className="text-gray-500 font-bold max-w-sm">
              Please enter your carbon footprint details in the Calculator tab first to activate the digital twin simulation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
