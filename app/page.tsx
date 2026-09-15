'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  Recipe,
  PantryItem,
  MealPlanDay,
  UserRole,
} from '@/lib/types';
import {
  INITIAL_RECIPES,
  INITIAL_PANTRY,
  INITIAL_MEAL_PLAN,
} from '@/lib/initial-data';
import { Header } from '@/components/Header';
import { Navbar, TabType } from '@/components/Navbar';
import { PlanTab } from '@/components/PlanTab';
import { RecipesTab } from '@/components/RecipesTab';
import { GroceriesTab } from '@/components/GroceriesTab';
import { StatsTab } from '@/components/StatsTab';
import { RecipeDetailModal } from '@/components/RecipeDetailModal';
import { RecipeEditModal } from '@/components/RecipeEditModal';
import { RecipePickerModal } from '@/components/RecipePickerModal';
import { SettingsModal } from '@/components/SettingsModal';
import { compileGroceryList } from '@/lib/planner-utils';

const STORAGE_KEYS = {
  RECIPES: 'mise_recipes_v3',
  PANTRY: 'mise_pantry_v3',
  MEALPLAN: 'mise_mealplan_v3',
  TAGS: 'mise_tags_v3',
  ACTIVE_USER: 'mise_active_user_v3',
  SCRIPT_URL: 'mise_gas_url_v3',
  LAST_SYNC: 'mise_last_sync_v3',
};

const DEFAULT_TAGS = [
  'ALL RECIPES',
  'QUICK < 30 MIN',
  'HIGH-PROTEIN',
  'VEGETARIAN',
  'COMFORT',
  'SEAFOOD',
  'GLUTEN-FREE',
  'MEAL-PREP',
  'KID-FRIENDLY',
];

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Home() {
  const isMounted = useIsMounted();
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [activeUser, setActiveUser] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'Aatish';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (saved === 'Husband' || saved === 'Aatish') return 'Aatish';
      if (saved === 'Wife' || saved === 'Faeeza') return 'Faeeza';
      return (saved as UserRole) || 'Aatish';
    } catch {
      return 'Aatish';
    }
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    if (typeof window === 'undefined') return INITIAL_RECIPES;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return saved ? JSON.parse(saved) : INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  });

  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PANTRY;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PANTRY);
      return saved ? JSON.parse(saved) : INITIAL_PANTRY;
    } catch {
      return INITIAL_PANTRY;
    }
  });

  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(() => {
    if (typeof window === 'undefined') return INITIAL_MEAL_PLAN;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEALPLAN);
      return saved ? JSON.parse(saved) : INITIAL_MEAL_PLAN;
    } catch {
      return INITIAL_MEAL_PLAN;
    }
  });

  const [tags, setTags] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_TAGS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAGS);
      return saved ? JSON.parse(saved) : DEFAULT_TAGS;
    } catch {
      return DEFAULT_TAGS;
    }
  });

  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(STORAGE_KEYS.SCRIPT_URL) || '';
    } catch {
      return '';
    }
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch {
      return null;
    }
  });

  // Modals & View State
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/#recipe=([^&]+)/);
      if (match && match[1]) return match[1];
    }
    return null;
  });
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState<boolean>(false);
  const [pickerDay, setPickerDay] = useState<MealPlanDay['dayOfWeek'] | null>(null);
  const [pickerMealType, setPickerMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantry));
      localStorage.setItem(STORAGE_KEYS.MEALPLAN, JSON.stringify(mealPlan));
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, activeUser);
      if (scriptUrl) localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, scriptUrl);
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }, [recipes, pantry, mealPlan, tags, activeUser, scriptUrl]);

  // Background sync helper
  const syncWithBackend = useCallback(
    async (
      currentRecipes = recipes,
      currentPantry = pantry,
      currentMealPlan = mealPlan,
      currentTags = tags,
      url = scriptUrl
    ) => {
      if (!url || !url.startsWith('http')) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('syncing');
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'SYNC_ALL',
            payload: {
              recipes: currentRecipes,
              pantry: currentPantry,
              mealPlan: currentMealPlan,
              tags: currentTags,
              groceryList: compileGroceryList(currentMealPlan, currentRecipes, currentPantry),
            },
          }),
        });

        const resData = await response.json();
        if (resData.status === 'success') {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setSyncStatus('synced');
          setLastSyncTime(time);
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, time);
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Sync failed:', err);
        setSyncStatus('offline');
      }
    },
    [recipes, pantry, mealPlan, tags, scriptUrl]
  );

  // Test backend connection
  const handleTestConnection = async (testUrl: string): Promise<boolean> => {
    try {
      const res = await fetch(testUrl);
      const data = await res.json();
      return data.status === 'success';
    } catch {
      return false;
    }
  };

  // Tag Operations
  const handleAddTag = (newTag: string) => {
    const clean = newTag.trim().toUpperCase();
    if (!clean) return;
    if (!tags.includes(clean)) {
      const nextTags = [...tags, clean];
      setTags(nextTags);
      syncWithBackend(recipes, pantry, mealPlan, nextTags);
    }
  };

  const handleEditTag = (oldTag: string, newTag: string) => {
    const clean = newTag.trim().toUpperCase();
    if (!clean || clean === oldTag) return;
    const nextTags = tags.map((t) => (t === oldTag ? clean : t));
    setTags(nextTags);

    // Also update any recipes using this tag
    const nextRecipes = recipes.map((r) => {
      if (r.tags.includes(oldTag)) {
        return {
          ...r,
          tags: r.tags.map((t) => (t === oldTag ? clean : t)),
        };
      }
      return r;
    });
    setRecipes(nextRecipes);
    syncWithBackend(nextRecipes, pantry, mealPlan, nextTags);
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const nextTags = tags.filter((t) => t !== tagToDelete);
    setTags(nextTags);
    syncWithBackend(recipes, pantry, mealPlan, nextTags);
  };

  // Recipe Operations
  const handleSaveRecipe = (updated: Recipe) => {
    let nextRecipes: Recipe[];
    const exists = recipes.some((r) => r.id === updated.id);
    if (exists) {
      nextRecipes = recipes.map((r) => (r.id === updated.id ? updated : r));
    } else {
      nextRecipes = [updated, ...recipes];
    }
    setRecipes(nextRecipes);
    setEditingRecipe(null);
    setIsCreatingRecipe(false);
    setSelectedRecipeId(updated.id);
    syncWithBackend(nextRecipes, pantry, mealPlan, tags);
  };

  const handleDeleteRecipe = (id: string) => {
    const nextRecipes = recipes.filter((r) => r.id !== id);
    setRecipes(nextRecipes);
    setEditingRecipe(null);
    setSelectedRecipeId(null);
    syncWithBackend(nextRecipes, pantry, mealPlan, tags);
  };

  const handleRateRecipe = (recipeId: string, user: UserRole, rating: number) => {
    const nextRecipes = recipes.map((r) => {
      if (r.id === recipeId) {
        const isAatish = user === 'Aatish';
        return {
          ...r,
          ratingAatish: isAatish ? rating : (r.ratingAatish ?? r.ratingHusband ?? 4),
          ratingFaeeza: !isAatish ? rating : (r.ratingFaeeza ?? r.ratingWife ?? 4),
          ratingHusband: isAatish ? rating : (r.ratingAatish ?? r.ratingHusband ?? 4),
          ratingWife: !isAatish ? rating : (r.ratingFaeeza ?? r.ratingWife ?? 4),
          lastEditedBy: user,
          lastEditedTimestamp: new Date().toISOString(),
        };
      }
      return r;
    });
    setRecipes(nextRecipes);
    syncWithBackend(nextRecipes, pantry, mealPlan, tags);
  };

  // Meal Plan Operations
  const handleUpdatePlanDay = (updatedDay: MealPlanDay) => {
    const nextPlan = mealPlan.map((d) => (d.dayOfWeek === updatedDay.dayOfWeek ? updatedDay : d));
    setMealPlan(nextPlan);
    syncWithBackend(recipes, pantry, nextPlan, tags);
  };

  const handleUpdateFullPlan = (newPlan: MealPlanDay[]) => {
    setMealPlan(newPlan);
    syncWithBackend(recipes, pantry, newPlan, tags);
  };

  const handleScheduleForDay = (
    recipe: Recipe,
    dayOfWeek?: MealPlanDay['dayOfWeek'],
    mealSlot: 'breakfast' | 'lunch' | 'dinner' = 'dinner'
  ) => {
    const targetDay = dayOfWeek
      ? mealPlan.find((d) => d.dayOfWeek === dayOfWeek) || mealPlan[0]
      : mealPlan[0];

    let updatedDay: MealPlanDay;
    if (mealSlot === 'breakfast') {
      updatedDay = {
        ...targetDay,
        breakfastRecipeId: recipe.id,
        breakfastRecipeName: recipe.name,
      };
    } else if (mealSlot === 'lunch') {
      updatedDay = {
        ...targetDay,
        lunchRecipeId: recipe.id,
        lunchRecipeName: recipe.name,
      };
    } else {
      updatedDay = {
        ...targetDay,
        recipeId: recipe.id,
        recipeName: recipe.name,
        isLeftoverOrOut: false,
        leftoverType: 'none',
      };
    }
    handleUpdatePlanDay(updatedDay);
    setSelectedRecipeId(null);
    setActiveTab('plan');
  };

  // Pantry Operations
  const handleUpdatePantryItem = (updatedItem: PantryItem) => {
    const nextPantry = pantry.map((p) => (p.id === updatedItem.id ? updatedItem : p));
    setPantry(nextPantry);
    syncWithBackend(recipes, nextPantry, mealPlan, tags);
  };

  const handleAddPantryItem = (newItem: PantryItem) => {
    const nextPantry = [newItem, ...pantry];
    setPantry(nextPantry);
    syncWithBackend(recipes, nextPantry, mealPlan, tags);
  };

  const handleDeletePantryItem = (id: string) => {
    const nextPantry = pantry.filter((p) => p.id !== id);
    setPantry(nextPantry);
    syncWithBackend(recipes, nextPantry, mealPlan, tags);
  };

  // Reset to initial starter data
  const handleResetData = () => {
    setRecipes(INITIAL_RECIPES);
    setPantry(INITIAL_PANTRY);
    setMealPlan(INITIAL_MEAL_PLAN);
    setTags(DEFAULT_TAGS);
    localStorage.clear();
    setSyncStatus('synced');
  };

  // Grocery badge count
  const groceryCount = compileGroceryList(mealPlan, recipes, pantry).filter((i) => !i.isInPantry).length;

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || null;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F9F8F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#4A6B5D] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-serif font-semibold text-[#5C5C60] tracking-wider uppercase">
            Plate Expectations
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#1C1C1E] flex flex-col font-sans selection:bg-[#4A6B5D]/20">
      {/* Top Fixed Header */}
      <Header
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onManualSync={() => syncWithBackend()}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full">
        {activeTab === 'plan' && (
          <PlanTab
            mealPlan={mealPlan}
            recipes={recipes}
            pantry={pantry}
            onUpdateDay={handleUpdatePlanDay}
            onUpdateFullPlan={handleUpdateFullPlan}
            onOpenRecipeDetail={(id) => setSelectedRecipeId(id)}
            onOpenRecipePicker={(day, mType = 'dinner') => {
              setPickerDay(day);
              setPickerMealType(mType);
            }}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesTab
            recipes={recipes}
            activeUser={activeUser}
            availableTags={tags}
            onOpenRecipeDetail={(id) => setSelectedRecipeId(id)}
            onAddNewRecipe={() => setIsCreatingRecipe(true)}
          />
        )}

        {activeTab === 'groceries' && (
          <GroceriesTab
            mealPlan={mealPlan}
            recipes={recipes}
            pantry={pantry}
            onUpdatePantryItem={handleUpdatePantryItem}
            onAddPantryItem={handleAddPantryItem}
            onDeletePantryItem={handleDeletePantryItem}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            recipes={recipes}
            mealPlan={mealPlan}
            onOpenRecipeDetail={(id) => setSelectedRecipeId(id)}
          />
        )}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        groceryCount={groceryCount}
      />

      {/* ================= MODALS ================= */}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          activeUser={activeUser}
          onClose={() => setSelectedRecipeId(null)}
          onEdit={(r) => {
            setSelectedRecipeId(null);
            setEditingRecipe(r);
          }}
          onRateRecipe={handleRateRecipe}
          onScheduleForDay={handleScheduleForDay}
          onDeleteRecipe={handleDeleteRecipe}
        />
      )}

      {/* Recipe Edit / Add Modal */}
      {(editingRecipe || isCreatingRecipe) && (
        <RecipeEditModal
          recipe={editingRecipe}
          activeUser={activeUser}
          availableTags={tags}
          onClose={() => {
            setEditingRecipe(null);
            setIsCreatingRecipe(false);
          }}
          onSave={handleSaveRecipe}
          onAddCustomTag={handleAddTag}
          onDelete={handleDeleteRecipe}
        />
      )}

      {/* Recipe Picker for Day Modal */}
      <RecipePickerModal
        isOpen={!!pickerDay}
        dayOfWeek={pickerDay}
        mealType={pickerMealType}
        recipes={recipes}
        onClose={() => setPickerDay(null)}
        onSelectRecipe={(day, recipe, mType = 'dinner') => {
          const currentDayObj = mealPlan.find((d) => d.dayOfWeek === day);
          if (currentDayObj) {
            if (mType === 'breakfast') {
              handleUpdatePlanDay({
                ...currentDayObj,
                breakfastRecipeId: recipe.id,
                breakfastRecipeName: recipe.name,
                breakfastAssignedTo: currentDayObj.breakfastAssignedTo || 'Aatish',
              });
            } else if (mType === 'lunch') {
              handleUpdatePlanDay({
                ...currentDayObj,
                lunchRecipeId: recipe.id,
                lunchRecipeName: recipe.name,
                lunchAssignedTo: currentDayObj.lunchAssignedTo || 'Faeeza',
              });
            } else {
              handleUpdatePlanDay({
                ...currentDayObj,
                recipeId: recipe.id,
                recipeName: recipe.name,
                isLeftoverOrOut: false,
                leftoverType: 'none',
              });
            }
          }
        }}
      />

      {/* Apps Script Settings & Tags Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scriptUrl={scriptUrl}
        onSaveScriptUrl={(url) => {
          setScriptUrl(url);
          localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, url);
        }}
        onTestConnection={handleTestConnection}
        onForceSync={() => syncWithBackend(recipes, pantry, mealPlan, tags, scriptUrl)}
        onResetData={handleResetData}
        tags={tags}
        onAddTag={handleAddTag}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
      />
    </div>
  );
}
