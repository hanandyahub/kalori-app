export type FoodItem = {
  name: string;
  estimatedGrams: number;
  calories: number;
};

export type FoodAnalysis = {
  summary: string;
  items: FoodItem[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
};

export type FoodLogEntry = FoodAnalysis & {
  id: string;
  userId: string;
  imageDataUrl: string;
  createdAt: number;
};
