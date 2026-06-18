import { useState, useEffect, useCallback } from "react";
import type {
  FootprintInput,
  FootprintData,
  RecommendationItem,
  CarbonBudget,
  SimulationResult,
  ShoppingAdvice,
  CommunityStats,
  ChatMessage,
} from "./types";
import { CalculatorView } from "./components/CalculatorView";
import { RecommendationsView } from "./components/RecommendationsView";
import { SimulatorView } from "./components/SimulatorView";
import { BudgetView } from "./components/BudgetView";
import { ShoppingView } from "./components/ShoppingView";
import { AssistantView } from "./components/AssistantView";
import { ProgressView } from "./components/ProgressView";
import { CommunityView } from "./components/CommunityView";

const API_BASE_URL = "http://localhost:8000/api";

function App() {
  const [activeTab, setActiveTab] = useState<string>("calculator");
  const [history, setHistory] = useState<FootprintData[]>([]);
  const [latestFootprint, setLatestFootprint] = useState<FootprintData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [budget, setBudget] = useState<CarbonBudget | null>(null);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [loading, setLoading] = useState<Record<string, boolean>>({
    calculator: false,
    recommendations: false,
    budget: false,
    community: false,
    chat: false,
    shopping: false,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch footprint history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
      if (data.length > 0) {
        setLatestFootprint(data[data.length - 1]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Unreachable server. Please ensure Python FastAPI backend is running.");
    }
  }, []);

  // Fetch carbon budget
  const fetchBudget = useCallback(async () => {
    setLoading((prev) => ({ ...prev, budget: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/budget`);
      if (!res.ok) throw new Error("Failed to fetch budget");
      const data = await res.json();
      setBudget(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, budget: false }));
    }
  }, []);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    setLoading((prev) => ({ ...prev, recommendations: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/recommendations`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, recommendations: false }));
    }
  }, []);

  // Fetch community stats
  const fetchCommunityStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, community: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/community`);
      if (!res.ok) throw new Error("Failed to fetch community stats");
      const data = await res.json();
      setCommunityStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, community: false }));
    }
  }, []);

  // On mount, fetch initial data
  useEffect(() => {
    fetchHistory();
    fetchBudget();
    fetchRecommendations();
    fetchCommunityStats();
  }, [fetchHistory, fetchBudget, fetchRecommendations, fetchCommunityStats]);

  // Handle calculator submission
  const handleCalculate = async (input: FootprintInput): Promise<FootprintData | null> => {
    setLoading((prev) => ({ ...prev, calculator: true }));
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to calculate footprint");
      const data = await res.json();
      
      // Update history list and latest footprint
      setHistory((prev) => {
        // If updating or re-calculating, we append or update
        const exists = prev.some((x) => x.id === data.id);
        if (exists) {
          return prev.map((x) => (x.id === data.id ? data : x));
        }
        return [...prev, data];
      });
      setLatestFootprint(data);
      
      // Refresh recommendations and budget since user profile changed
      fetchRecommendations();
      fetchCommunityStats();
      return data;
    } catch (err) {
      console.error(err);
      setErrorMsg("Calculation failed. Backend server connection error.");
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, calculator: false }));
    }
  };

  // Handle budget limit updates
  const handleUpdateBudget = async (newBudget: CarbonBudget): Promise<CarbonBudget | null> => {
    setLoading((prev) => ({ ...prev, budget: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/budget`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBudget),
      });
      if (!res.ok) throw new Error("Failed to update budget");
      const data = await res.json();
      setBudget(data);
      return data;
    } catch (err) {
      console.error(err);
      setErrorMsg("Budget update failed.");
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, budget: false }));
    }
  };

  // Handle simulation requests
  const handleSimulate = async (inputs: {
    public_transport_days: number;
    electricity_reduction_pct: number;
    vegetarian_days: number;
  }): Promise<SimulationResult | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error("Simulation request failed");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Handle Shopping Advice query
  const handleGetShoppingAdvice = async (category: string): Promise<ShoppingAdvice | null> => {
    setLoading((prev) => ({ ...prev, shopping: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/shopping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error("Shopping advisor request failed");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, shopping: false }));
    }
  };

  // Handle chatbot messages
  const handleSendChatMessage = async (
    message: string
  ): Promise<{ reply: string; insights: string[] } | null> => {
    setLoading((prev) => ({ ...prev, chat: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      return await res.json();
    } catch (err) {
      console.error(err);
      return {
        reply: "Sorry, I am having trouble connecting to my reasoning engine. Please verify the backend is online.",
        insights: ["Connection offline"],
      };
    } finally {
      setLoading((prev) => ({ ...prev, chat: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <header className="bg-neoYellow border-3 border-black p-6 rounded-xl shadow-neo flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neoDark">
            GreenGuide AI
          </h1>
          <p className="font-bold text-neoDark/80 text-sm mt-1">
            Intelligent Sustainability Assistant & Digital Twin
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-white border-2 border-black px-3 py-1 font-bold text-xs rounded-lg shadow-neoSm">
            🌱 Carbon Coach
          </span>
          <span className="bg-neoGreen border-2 border-black px-3 py-1 font-bold text-xs rounded-lg shadow-neoSm">
            ⚡ Offline-First Mode
          </span>
        </div>
      </header>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="bg-neoOrange text-white border-3 border-black p-4 rounded-xl shadow-neo flex justify-between items-center font-bold">
          <div>⚠️ {errorMsg}</div>
          <button
            onClick={() => {
              setErrorMsg(null);
              fetchHistory();
              fetchBudget();
              fetchRecommendations();
              fetchCommunityStats();
            }}
            className="bg-white text-black border-2 border-black px-3 py-1 rounded text-xs hover:bg-gray-100 shadow-neoSm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-3">
        {[
          { id: "calculator", label: "🌍 Calculator", color: "hover:bg-neoYellow" },
          { id: "recommendations", label: "💡 Recommendations", color: "hover:bg-neoGreen" },
          { id: "simulator", label: "⚡ Simulator (Twin)", color: "hover:bg-neoOrange hover:text-white" },
          { id: "budget", label: "📊 Carbon Budget", color: "hover:bg-neoBlue hover:text-white" },
          { id: "assistant", label: "🤖 Smart Coach", color: "hover:bg-neoGreen" },
          { id: "shopping", label: "🛍️ Shop Advisor", color: "hover:bg-neoYellow" },
          { id: "trends", label: "📈 Trends & Goals", color: "hover:bg-neoBlue hover:text-white" },
          { id: "community", label: "👥 Community Hub", color: "hover:bg-neoOrange hover:text-white" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-3 border-black px-4 py-2.5 font-display font-bold rounded-lg shadow-neoSm transition-all active:translate-x-0 active:translate-y-0 active:shadow-neoSm ${
                isActive
                  ? "bg-neoDark text-white translate-x-0.5 translate-y-0.5 shadow-none"
                  : `bg-white text-neoDark hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo ${tab.color}`
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main View Shell */}
      <main className="min-h-[500px]">
        {activeTab === "calculator" && (
          <CalculatorView
            onCalculate={handleCalculate}
            latestData={latestFootprint}
            loading={loading.calculator}
          />
        )}
        {activeTab === "recommendations" && (
          <RecommendationsView
            recommendations={recommendations}
            loading={loading.recommendations}
          />
        )}
        {activeTab === "simulator" && (
          <SimulatorView
            onSimulate={handleSimulate}
            latestFootprint={latestFootprint}
          />
        )}
        {activeTab === "budget" && (
          <BudgetView
            budget={budget}
            latestFootprint={latestFootprint}
            onUpdateBudget={handleUpdateBudget}
            loading={loading.budget}
          />
        )}
        {activeTab === "assistant" && (
          <AssistantView
            onSendMessage={handleSendChatMessage}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            loading={loading.chat}
          />
        )}
        {activeTab === "shopping" && (
          <ShoppingView
            onGetAdvice={handleGetShoppingAdvice}
            loading={loading.shopping}
          />
        )}
        {activeTab === "trends" && (
          <ProgressView
            history={history}
            loading={loading.calculator}
          />
        )}
        {activeTab === "community" && (
          <CommunityView
            stats={communityStats}
            loading={loading.community}
          />
        )}
      </main>
    </div>
  );
}

export default App;
