import React, { useState, useEffect } from "react";
import type { CarbonBudget, FootprintData } from "../types";

interface BudgetViewProps {
  budget: CarbonBudget | null;
  latestFootprint: FootprintData | null;
  onUpdateBudget: (newBudget: CarbonBudget) => Promise<CarbonBudget | null>;
  loading: boolean;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  latestFootprint,
  onUpdateBudget,
  loading,
}) => {
  const [formData, setFormData] = useState<CarbonBudget>({
    budget_transport: 150,
    budget_electricity: 100,
    budget_food: 100,
    budget_shopping: 50,
  });

  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (budget) {
      setFormData({
        budget_transport: budget.budget_transport,
        budget_electricity: budget.budget_electricity,
        budget_food: budget.budget_food,
        budget_shopping: budget.budget_shopping,
      });
    }
  }, [budget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Math.max(0, parseFloat(value) || 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await onUpdateBudget(formData);
    if (updated) {
      setSuccessMsg("Carbon budget updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Get current usage from latest footprint or 0 if none
  const currentUsage = {
    transport: latestFootprint?.co2_transport ?? 0,
    electricity: latestFootprint?.co2_electricity ?? 0,
    food: latestFootprint?.co2_food ?? 0,
    shopping: latestFootprint?.co2_shopping ?? 0,
  };

  const categories = [
    {
      id: "transport" as const,
      label: "Transportation",
      usage: currentUsage.transport,
      budgetLimit: formData.budget_transport,
      icon: "🚗",
      color: "bg-neoOrange",
    },
    {
      id: "electricity" as const,
      label: "Electricity",
      usage: currentUsage.electricity,
      budgetLimit: formData.budget_electricity,
      icon: "⚡",
      color: "bg-neoYellow",
    },
    {
      id: "food" as const,
      label: "Diet & Food",
      usage: currentUsage.food,
      budgetLimit: formData.budget_food,
      icon: "🥩",
      color: "bg-neoGreen",
    },
    {
      id: "shopping" as const,
      label: "Shopping",
      usage: currentUsage.shopping,
      budgetLimit: formData.budget_shopping,
      icon: "🛍️",
      color: "bg-neoBlue",
    },
  ];

  const getProgressColor = (usage: number, limit: number) => {
    const ratio = usage / Math.max(1, limit);
    if (ratio >= 1.0) return "bg-neoOrange";
    if (ratio >= 0.85) return "bg-neoYellow";
    return "bg-neoGreen";
  };

  const totalBudget =
    formData.budget_transport +
    formData.budget_electricity +
    formData.budget_food +
    formData.budget_shopping;
  const totalUsage =
    currentUsage.transport +
    currentUsage.electricity +
    currentUsage.food +
    currentUsage.shopping;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Budget Status List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo">
          <h2 className="text-3xl font-display font-bold mb-2">Monthly Carbon Budget</h2>
          <p className="font-bold text-gray-500">
            Set and track monthly emission allowance limits. Exceeding limits triggers warnings, urging you to optimize consumption.
          </p>
        </div>

        {successMsg && (
          <div className="bg-neoGreen text-black border-3 border-black p-3 rounded-lg shadow-neoSm font-bold">
            ✅ {successMsg}
          </div>
        )}

        {/* Total Summary */}
        <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="w-full md:w-auto">
            <p className="text-xs uppercase font-bold text-gray-500">Total Progress</p>
            <p className="text-2xl font-display font-bold">
              {totalUsage.toFixed(1)} / {totalBudget.toFixed(0)} <span className="text-sm font-sans font-bold">kg CO₂</span>
            </p>
          </div>
          <div className="w-full flex-1">
            <div className="w-full bg-gray-200 border-3 border-black h-8 rounded-lg overflow-hidden flex">
              <div
                className={`h-full border-r-3 border-black transition-all ${
                  totalUsage > totalBudget ? "bg-neoOrange" : "bg-neoGreen"
                }`}
                style={{ width: `${Math.min(100, (totalUsage / Math.max(1, totalBudget)) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center font-bold">
            {totalUsage > totalBudget ? (
              <span className="text-neoOrange text-sm">⚠️ Over Budget!</span>
            ) : (
              <span className="text-neoGreen text-sm">✓ Under Budget</span>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const isOver = cat.usage > cat.budgetLimit;
            const remaining = cat.budgetLimit - cat.usage;
            const pct = Math.min(100, Math.round((cat.usage / Math.max(1, cat.budgetLimit)) * 100));

            return (
              <div
                key={cat.id}
                className="bg-white border-3 border-black p-5 rounded-xl shadow-neo relative hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all"
              >
                {isOver && (
                  <div className="absolute top-2 right-2 bg-neoOrange text-white border-3 border-black px-2 py-0.5 rounded-lg text-xs font-bold shadow-neoSm animate-bounce">
                    🚨 OVER LIMIT!
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="font-display font-bold text-lg">{cat.label}</h3>
                </div>

                {/* Progress stats */}
                <div className="flex justify-between font-bold text-sm mb-2 text-gray-500">
                  <span>Usage: {cat.usage.toFixed(1)} kg</span>
                  <span>Limit: {cat.budgetLimit.toFixed(0)} kg</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 border-3 border-black h-5 rounded-md overflow-hidden mb-4">
                  <div
                    className={`h-full border-r-3 border-black transition-all ${getProgressColor(
                      cat.usage,
                      cat.budgetLimit
                    )}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                {/* Info Text */}
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400">Filled {pct}%</span>
                  <span className={isOver ? "text-neoOrange" : "text-neoGreen"}>
                    {isOver
                      ? `Exceeded by +${Math.abs(remaining).toFixed(1)} kg`
                      : `Remaining: ${remaining.toFixed(1)} kg`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget configuration side panel */}
      <div className="bg-white border-3 border-black p-6 rounded-xl shadow-neo h-fit">
        <h3 className="text-xl font-display font-bold mb-4 border-b-3 border-black pb-2 bg-neoYellow px-2 -mx-6 -mt-6 rounded-t-lg">
          Configure Budget Limits
        </h3>
        
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="budget_transport" className="block text-xs uppercase font-bold text-gray-500 mb-1">
                🚗 Transportation Limit (kg CO₂/mo)
              </label>
              <input
                id="budget_transport"
                name="budget_transport"
                type="number"
                value={formData.budget_transport}
                onChange={handleChange}
                className="w-full border-3 border-black p-2 rounded-lg font-bold focus:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
                required
              />
            </div>
            <div>
              <label htmlFor="budget_electricity" className="block text-xs uppercase font-bold text-gray-500 mb-1">
                ⚡ Electricity Limit (kg CO₂/mo)
              </label>
              <input
                id="budget_electricity"
                name="budget_electricity"
                type="number"
                value={formData.budget_electricity}
                onChange={handleChange}
                className="w-full border-3 border-black p-2 rounded-lg font-bold focus:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
                required
              />
            </div>
            <div>
              <label htmlFor="budget_food" className="block text-xs uppercase font-bold text-gray-500 mb-1">
                🥩 Diet & Food Limit (kg CO₂/mo)
              </label>
              <input
                id="budget_food"
                name="budget_food"
                type="number"
                value={formData.budget_food}
                onChange={handleChange}
                className="w-full border-3 border-black p-2 rounded-lg font-bold focus:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
                required
              />
            </div>
            <div>
              <label htmlFor="budget_shopping" className="block text-xs uppercase font-bold text-gray-500 mb-1">
                🛍️ Shopping Limit (kg CO₂/mo)
              </label>
              <input
                id="budget_shopping"
                name="budget_shopping"
                type="number"
                value={formData.budget_shopping}
                onChange={handleChange}
                className="w-full border-3 border-black p-2 rounded-lg font-bold focus:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
                required
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-neoGreen text-black border-3 border-black font-bold py-2 rounded-lg shadow-neo hover:translate-y-[-1px] transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex-1 bg-gray-200 text-black border-3 border-black font-bold py-2 rounded-lg shadow-neo hover:translate-y-[-1px] transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="font-bold text-sm text-gray-500">
              Customize your monthly allowances. Your current targets are:
            </p>
            <div className="space-y-2 border-3 border-black p-4 bg-neoBackground rounded-lg font-bold">
              <div className="flex justify-between">
                <span>🚗 Transport:</span>
                <span>{formData.budget_transport} kg</span>
              </div>
              <div className="flex justify-between">
                <span>⚡ Electricity:</span>
                <span>{formData.budget_electricity} kg</span>
              </div>
              <div className="flex justify-between">
                <span>🥩 Diet & Food:</span>
                <span>{formData.budget_food} kg</span>
              </div>
              <div className="flex justify-between">
                <span>🛍️ Shopping:</span>
                <span>{formData.budget_shopping} kg</span>
              </div>
              <div className="border-t-3 border-black pt-2 flex justify-between font-display text-lg">
                <span>Total Limit:</span>
                <span>{totalBudget} kg</span>
              </div>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-neoYellow text-black border-3 border-black font-display font-bold py-2.5 rounded-lg shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all active:translate-x-0 active:translate-y-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              ⚙ Edit Budget Targets
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
