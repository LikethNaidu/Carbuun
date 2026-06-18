export interface FootprintInput {
  travel_dist: number;
  transport_mode: string;
  electricity_bill: number;
  food_preference: string;
  shopping_freq: string;
  household_size: number;
}

export interface FootprintData extends FootprintInput {
  id: number;
  user_id: string;
  co2_transport: number;
  co2_electricity: number;
  co2_food: number;
  co2_shopping: number;
  co2_total: number;
  sustainability_score: number;
  created_at: string;
}

export interface RecommendationItem {
  category: string;
  text: string;
  carbon_saving: number;
  cost_saving: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface CarbonBudget {
  budget_transport: number;
  budget_electricity: number;
  budget_food: number;
  budget_shopping: number;
  updated_at?: string;
}

export interface SimulationResult {
  original_co2: number;
  new_co2: number;
  reduction_pct: number;
  annual_saving_co2: number;
  annual_saving_cost: number;
}

export interface ShoppingAlternative {
  name: string;
  co2: number;
  desc: string;
  better_because: string;
}

export interface ShoppingAdvice {
  category: string;
  estimated_impact: string;
  co2_estimate: number;
  explanation: string;
  alternatives: ShoppingAlternative[];
}

export interface CommunityStats {
  total_users: number;
  average_score: number;
  total_carbon_saved: number;
}

export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  insights?: string[];
  timestamp: Date;
}
