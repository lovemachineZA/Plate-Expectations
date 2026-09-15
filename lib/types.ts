export type UserRole = 'Aatish' | 'Faeeza';
export type AssignedCook = 'Aatish' | 'Faeeza' | 'Together';
export type LeftoverType = 'none' | 'no_plan' | 'take_out';

export type PantryCategory =
  | 'Fruit&Veg'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry Staples'
  | 'Bakery & Grains'
  | 'Spices & Condiments'
  | 'General'
  | 'Frozen'
  | 'Other';

export interface Recipe {
  id: string;
  name: string;
  ingredients: string; // comma or line separated
  instructions: string;
  cookTimeMins: number;
  ratingAatish: number; // 1-5
  ratingFaeeza: number; // 1-5
  // Compatibility helpers
  ratingHusband?: number;
  ratingWife?: number;
  tags: string[];
  notes: string;
  imageUrl: string;
  lastCookedDate: string; // YYYY-MM-DD
  createdBy: UserRole;
  lastEditedBy: UserRole;
  lastEditedTimestamp: string;
  calories?: number;
  servings?: number;
}

export interface PantryItem {
  id: string;
  itemName: string;
  category: string;
  inStock: boolean;
  useFirst: boolean;
  expiry?: string; // dd-mm format
  addedDate: string; // dd-mm format
}

export interface MealPlanDay {
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dayName: string;
  date: string; // YYYY-MM-DD
  // Breakfast (Optional)
  breakfastRecipeId?: string;
  breakfastRecipeName?: string;
  breakfastAssignedTo?: AssignedCook;
  // Lunch (Optional)
  lunchRecipeId?: string;
  lunchRecipeName?: string;
  lunchAssignedTo?: AssignedCook;
  // Dinner (Primary)
  recipeId: string;
  recipeName: string;
  assignedTo: AssignedCook;
  isLeftoverOrOut: boolean;
  leftoverType: LeftoverType;
  isLocked: boolean;
  notes: string;
}

export interface GroceryItem {
  id: string;
  itemName: string;
  quantity: string;
  category: string;
  store?: string; // Optional store field (e.g. Costco, Trader Joe's)
  checked: boolean;
  sourceRecipeNames?: string[];
  isInPantry?: boolean;
}

export interface AppState {
  recipes: Recipe[];
  pantry: PantryItem[];
  mealPlan: MealPlanDay[];
  groceries: GroceryItem[];
  availableTags: string[];
  activeUser: UserRole;
  scriptUrl: string;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: string | null;
}
