import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { FootprintData } from "../types";

interface ProgressViewProps {
  history: FootprintData[];
  loading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-3 border-black p-3.5 rounded-lg shadow-neo font-bold text-xs text-neoDark">
        <p className="border-b-2 border-black pb-1 mb-2 font-display text-sm">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color }} className="mb-0.5">
            {item.name}: {item.value.toFixed(1)} kg CO₂
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ProgressView: React.FC<ProgressViewProps> = ({ history, loading }) => {
  // Format history data for Recharts
  const chartData = history.map((entry) => {
    const date = new Date(entry.created_at);
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}`;
    
    return {
      name: formattedDate,
      Transport: entry.co2_transport,
      Electricity: entry.co2_electricity,
      Food: entry.co2_food,
      Shopping: entry.co2_shopping,
      Total: entry.co2_total,
    };
  });

  // Calculate some summary stats
  const initialFootprint = history.length > 0 ? history[0].co2_total : 0;
  const latestFootprint = history.length > 0 ? history[history.length - 1].co2_total : 0;
  const carbonSaved = Math.max(0, initialFootprint - latestFootprint);
  const carbonSavedPct =
    initialFootprint > 0 ? Math.round((carbonSaved / initialFootprint) * 100) : 0;



  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo">
        <h2 className="text-3xl font-display font-bold mb-2">Footprint Trends & Goals</h2>
        <p className="font-bold text-gray-500">
          Track your progress over time. View your history breakdown to evaluate your carbon reduction journey.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 font-bold">Loading historical records...</div>
      ) : history.length === 0 ? (
        <div className="bg-white border-3 border-black p-12 rounded-xl text-center shadow-neo">
          <span className="text-5xl mb-4" role="img" aria-label="chart increasing icon">📈</span>
          <h3 className="text-xl font-bold mb-2">No historical trends yet</h3>
          <p className="text-gray-500 font-bold">
            Create your first carbon calculation in the Calculator tab to activate history logs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carbon Progress Stat Cards */}
          <div className="space-y-6 lg:col-span-1">
            {/* Stat Card 1: Initial vs Latest */}
            <div className="bg-white border-3 border-black p-5 rounded-xl shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all">
              <h3 className="font-display font-bold text-lg mb-3">Emission Change</h3>
              <div className="grid grid-cols-2 gap-4 text-center font-bold">
                <div className="border-3 border-black p-2 bg-gray-100 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase">Initial</p>
                  <p className="text-lg tabular-nums">{initialFootprint.toFixed(1)} kg</p>
                </div>
                <div className="border-3 border-black p-2 bg-neoGreen rounded-lg">
                  <p className="text-[10px] text-neoDark uppercase">Current</p>
                  <p className="text-lg tabular-nums">{latestFootprint.toFixed(1)} kg</p>
                </div>
              </div>
            </div>

            {/* Stat Card 2: Saved amount */}
            <div className="bg-white border-3 border-black p-5 rounded-xl shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all bg-neoGreen">
              <h3 className="font-display font-bold text-lg text-black mb-1">Carbon Reduction</h3>
              <p className="text-4xl font-display font-bold text-black tabular-nums">
                -{carbonSaved.toFixed(1)} <span className="text-lg font-sans">kg/mo</span>
              </p>
              <span className="inline-block bg-white text-black border-2 border-black px-2 py-0.5 rounded text-xs font-bold mt-2 shadow-neoSm">
                ✓ Reduced by {carbonSavedPct}%
              </span>
            </div>

            {/* Achievements Log */}
            <div className="bg-white border-3 border-black p-5 rounded-xl shadow-neo">
              <h3 className="font-display font-bold text-lg mb-3">Goal Checklist</h3>
              <div className="space-y-3 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={history.length >= 1}
                    readOnly
                    className="w-4 h-4 accent-neoGreen border-2 border-black rounded"
                  />
                  <span className={history.length >= 1 ? "line-through text-gray-400" : ""}>
                    Calculate initial footprint
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={carbonSavedPct > 0}
                    readOnly
                    className="w-4 h-4 accent-neoGreen border-2 border-black rounded"
                  />
                  <span className={carbonSavedPct > 0 ? "line-through text-gray-400" : ""}>
                    Reduce emissions from baseline
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={latestFootprint < 300 && latestFootprint > 0}
                    readOnly
                    className="w-4 h-4 accent-neoGreen border-2 border-black rounded"
                  />
                  <span className={latestFootprint < 300 && latestFootprint > 0 ? "line-through text-gray-400" : ""}>
                    Keep total emissions under 300 kg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={history.length >= 4}
                    readOnly
                    className="w-4 h-4 accent-neoGreen border-2 border-black rounded"
                  />
                  <span className={history.length >= 4 ? "line-through text-gray-400" : ""}>
                    Maintain logs for 4 entries
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Recharts Graph */}
          <div className="bg-white border-3 border-black p-5 rounded-xl shadow-neo lg:col-span-2 flex flex-col justify-between h-[420px]">
            <h3 className="font-display font-bold text-lg mb-4">Emissions Breakdown Trend</h3>
            
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="name" stroke="#000" tickLine={{ stroke: "#000", strokeWidth: 2 }} />
                  <YAxis stroke="#000" tickLine={{ stroke: "#000", strokeWidth: 2 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontWeight: "bold", paddingTop: 10 }} />
                  <Bar dataKey="Transport" stackId="a" fill="#FF6B35" stroke="#000" strokeWidth={2} />
                  <Bar dataKey="Electricity" stackId="a" fill="#FFE500" stroke="#000" strokeWidth={2} />
                  <Bar dataKey="Food" stackId="a" fill="#00FF88" stroke="#000" strokeWidth={2} />
                  <Bar dataKey="Shopping" stackId="a" fill="#0099FF" stroke="#000" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
