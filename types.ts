export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  servings: string;
  prepTime: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}
