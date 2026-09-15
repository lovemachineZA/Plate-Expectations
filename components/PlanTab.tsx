'use client';

import React, { useState } from 'react';
import { MealPlanDay, Recipe, PantryItem, AssignedCook, LeftoverType } from '@/lib/types';
import {
  Sparkles,
  Download,
  Lock,
  Unlock,
  RefreshCw,
  Flame,
  ChevronRight,
  Plus,
  Coffee,
  Sun,
  Moon,
  Trash2,
  UtensilsCrossed
} from 'lucide-react';
import { autoGeneratePlan, generateICSCalendar, downloadICSFile } from '@/lib/planner-utils';

interface PlanTabProps {
  mealPlan: MealPlanDay[];
  recipes: Recipe[];
  pantry: PantryItem[];
  onUpdateDay: (updatedDay: MealPlanDay) => void;
  onUpdateFullPlan: (newPlan: MealPlanDay[]) => void;
  onOpenRecipeDetail: (recipeId: string) => void;
  onOpenRecipePicker: (dayOfWeek: MealPlanDay['dayOfWeek'], mealType?: 'breakfast' | 'lunch' | 'dinner') => void;
}

export function PlanTab({
  mealPlan,
  recipes,
  pantry,
  onUpdateDay,
  onUpdateFullPlan,
  onOpenRecipeDetail,
  onOpenRecipePicker,
}: PlanTabProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Default to Wednesday
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedDay = mealPlan[selectedDayIndex] || mealPlan[0];
  const selectedDinnerRecipe = recipes.find((r) => r.id === selectedDay?.recipeId);
  const selectedBreakfastRecipe = recipes.find((r) => r.id === selectedDay?.breakfastRecipeId);
  const selectedLunchRecipe = recipes.find((r) => r.id === selectedDay?.lunchRecipeId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auto-generate plan handler
  const handleAutoGenerate = () => {
    const newPlan = autoGeneratePlan(mealPlan, recipes, pantry);
    onUpdateFullPlan(newPlan);
    showToast('Weekly plan refreshed using ratings & Use-First pantry items!');
  };

  // Lock toggle handler
  const handleToggleLock = (day: MealPlanDay, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateDay({
      ...day,
      isLocked: !day.isLocked,
    });
  };

  // Swap / Reroll dinner
  const handleRerollDay = (day: MealPlanDay, e: React.MouseEvent) => {
    e.stopPropagation();
    if (day.isLocked) {
      showToast('Unlock this day first to reroll.');
      return;
    }
    const assignedIds = new Set(mealPlan.map((d) => d.recipeId).filter(Boolean));
    const available = recipes.filter((r) => r.id !== day.recipeId && !assignedIds.has(r.id));
    const pool = available.length > 0 ? available : recipes.filter((r) => r.id !== day.recipeId);

    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      onUpdateDay({
        ...day,
        recipeId: picked.id,
        recipeName: picked.name,
        isLeftoverOrOut: false,
        leftoverType: 'none',
      });
      showToast(`Dinner swapped to ${picked.name}`);
    }
  };

  // Cook assignment
  const handleAssignCook = (day: MealPlanDay, cook: AssignedCook, meal: 'breakfast' | 'lunch' | 'dinner', e: React.MouseEvent) => {
    e.stopPropagation();
    if (meal === 'breakfast') {
      onUpdateDay({ ...day, breakfastAssignedTo: cook });
    } else if (meal === 'lunch') {
      onUpdateDay({ ...day, lunchAssignedTo: cook });
    } else {
      onUpdateDay({ ...day, assignedTo: cook });
    }
  };

  // Leftover / Eat out toggle
  const handleToggleLeftoverType = (day: MealPlanDay, type: LeftoverType) => {
    onUpdateDay({
      ...day,
      isLeftoverOrOut: type !== 'none',
      leftoverType: type,
    });
  };

  // Clear optional meal
  const handleClearOptionalMeal = (day: MealPlanDay, meal: 'breakfast' | 'lunch') => {
    if (meal === 'breakfast') {
      onUpdateDay({
        ...day,
        breakfastRecipeId: undefined,
        breakfastRecipeName: undefined,
        breakfastAssignedTo: undefined,
      });
      showToast('Breakfast removed.');
    } else {
      onUpdateDay({
        ...day,
        lunchRecipeId: undefined,
        lunchRecipeName: undefined,
        lunchAssignedTo: undefined,
      });
      showToast('Lunch removed.');
    }
  };

  // Google Calendar .ics export
  const handleExportCalendar = () => {
    setIsExporting(true);
    try {
      const ics = generateICSCalendar(mealPlan, recipes);
      downloadICSFile(ics, `plate-expectations-week-${selectedDay.date}.ics`);
      showToast('Calendar (.ics) downloaded! Open to add to Google Calendar or Apple iCal.');
    } catch (err) {
      console.error(err);
      showToast('Error exporting calendar.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#A3C9B8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Day of Week Horizontal Selector with 3 Meal Lines per day (Breakfast, Lunch, Dinner) */}
      <div className="bg-[#EFECE3] p-2.5 rounded-2xl mb-6 shadow-xs border border-[#E5E4DE]">
        <div className="grid grid-cols-7 gap-1.5">
          {mealPlan.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            const hasBreakfast = !!day.breakfastRecipeId;
            const hasLunch = !!day.lunchRecipeId;
            const hasDinner = (!!day.recipeId && !day.isLeftoverOrOut) || day.isLeftoverOrOut;
            const dayInitial = day.dayOfWeek.charAt(0);

            return (
              <button
                key={day.dayOfWeek}
                id={`day-selector-${day.dayOfWeek}`}
                onClick={() => setSelectedDayIndex(idx)}
                className={`relative flex flex-col items-center justify-between py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[#4A6B5D] text-white shadow-sm scale-102'
                    : 'bg-transparent text-[#5C5C60] hover:bg-[#E5E2D8]'
                }`}
              >
                <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-[#7C7C80]'}`}>
                  {dayInitial}
                </span>

                {/* 3 lines representing Breakfast, Lunch, Dinner (dark if planned) */}
                <div className="flex flex-col gap-1 my-1.5 items-center w-full px-1">
                  {/* Line 1: Breakfast */}
                  <div
                    title={hasBreakfast ? 'Breakfast Planned' : 'No Breakfast'}
                    className={`w-full max-w-[20px] h-[3px] rounded-full transition-colors ${
                      isSelected
                        ? hasBreakfast
                          ? 'bg-white'
                          : 'bg-white/30'
                        : hasBreakfast
                        ? 'bg-[#4A6B5D]'
                        : 'bg-[#D8D6CE]'
                    }`}
                  />
                  {/* Line 2: Lunch */}
                  <div
                    title={hasLunch ? 'Lunch Planned' : 'No Lunch'}
                    className={`w-full max-w-[20px] h-[3px] rounded-full transition-colors ${
                      isSelected
                        ? hasLunch
                          ? 'bg-white'
                          : 'bg-white/30'
                        : hasLunch
                        ? 'bg-[#4A6B5D]'
                        : 'bg-[#D8D6CE]'
                    }`}
                  />
                  {/* Line 3: Dinner */}
                  <div
                    title={hasDinner ? 'Dinner Planned' : 'No Dinner'}
                    className={`w-full max-w-[20px] h-[3px] rounded-full transition-colors ${
                      isSelected
                        ? hasDinner
                          ? 'bg-white'
                          : 'bg-white/30'
                        : day.isLeftoverOrOut
                        ? day.leftoverType === 'take_out'
                          ? 'bg-[#C87A50]'
                          : 'bg-[#C8A060]'
                        : hasDinner
                        ? 'bg-[#4A6B5D]'
                        : 'bg-[#D8D6CE]'
                    }`}
                  />
                </div>

                {/* Small indicator dot for active day */}
                <div
                  className={`w-1 h-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Headline & Calorie Summary */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1C1C1E] tracking-tight">
            {selectedDay.dayName}
          </h2>
          <span className="text-xs text-[#7C7C80] font-medium">
            {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C5C60] bg-[#FFFFFF] px-3 py-1.5 rounded-full border border-[#E5E4DE] shadow-xs">
          <Flame className="w-3.5 h-3.5 text-[#C87A50]" />
          <span>
            {((selectedBreakfastRecipe?.calories || 0) +
              (selectedLunchRecipe?.calories || 0) +
              (!selectedDay.isLeftoverOrOut && selectedDinnerRecipe?.calories
                ? selectedDinnerRecipe.calories
                : 0)) > 0
              ? `${
                  (selectedBreakfastRecipe?.calories || 0) +
                  (selectedLunchRecipe?.calories || 0) +
                  (!selectedDay.isLeftoverOrOut && selectedDinnerRecipe?.calories
                    ? selectedDinnerRecipe.calories
                    : 0)
                } kcal`
              : '0 kcal'}
          </span>
        </div>
      </div>

      {/* ================= OPTIONAL BREAKFAST SECTION ================= */}
      <div className="mb-4 bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-[#C8A060]" />
            <span className="text-xs font-bold text-[#1C1C1E]">Breakfast</span>
            <span className="text-[10px] text-[#A09F99] font-medium">(Optional)</span>
          </div>
          {selectedBreakfastRecipe ? (
            <button
              onClick={() => handleClearOptionalMeal(selectedDay, 'breakfast')}
              className="text-[#A09F99] hover:text-[#C87A50] transition-colors p-1"
              title="Remove breakfast"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {selectedBreakfastRecipe ? (
          <div className="flex items-center justify-between gap-3 bg-[#F9F8F3] p-2.5 rounded-xl border border-[#E5E4DE]">
            <div
              onClick={() => onOpenRecipeDetail(selectedBreakfastRecipe.id)}
              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedBreakfastRecipe.imageUrl}
                alt={selectedBreakfastRecipe.name}
                className="w-10 h-10 rounded-lg object-cover bg-[#EAE8E0]"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1C1C1E] truncate">
                  {selectedBreakfastRecipe.name}
                </h4>
                <span className="text-[10px] text-[#7C7C80]">
                  {selectedBreakfastRecipe.cookTimeMins}m • {selectedBreakfastRecipe.calories || 300} kcal
                </span>
              </div>
            </div>

            {/* Cook selector for breakfast */}
            <div className="flex items-center bg-[#FFFFFF] rounded-full p-0.5 border border-[#E5E4DE] text-[10px] shrink-0">
              <button
                onClick={(e) => handleAssignCook(selectedDay, 'Aatish', 'breakfast', e)}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  selectedDay.breakfastAssignedTo === 'Aatish'
                    ? 'bg-[#4A6B5D] text-white'
                    : 'text-[#5C5C60]'
                }`}
              >
                🧔🏽 Aatish
              </button>
              <button
                onClick={(e) => handleAssignCook(selectedDay, 'Faeeza', 'breakfast', e)}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  selectedDay.breakfastAssignedTo === 'Faeeza'
                    ? 'bg-[#4A6B5D] text-white'
                    : 'text-[#5C5C60]'
                }`}
              >
                👩🏽 Faeeza
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onOpenRecipePicker(selectedDay.dayOfWeek, 'breakfast')}
            className="w-full py-2 border border-dashed border-[#D5D3CB] rounded-xl text-xs font-semibold text-[#7C7C80] hover:text-[#4A6B5D] hover:border-[#4A6B5D] flex items-center justify-center gap-1.5 transition-colors bg-[#FAF9F5]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Breakfast</span>
          </button>
        )}
      </div>

      {/* ================= OPTIONAL LUNCH SECTION ================= */}
      <div className="mb-6 bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-[#E68A00]" />
            <span className="text-xs font-bold text-[#1C1C1E]">Lunch</span>
            <span className="text-[10px] text-[#A09F99] font-medium">(Optional)</span>
          </div>
          {selectedLunchRecipe ? (
            <button
              onClick={() => handleClearOptionalMeal(selectedDay, 'lunch')}
              className="text-[#A09F99] hover:text-[#C87A50] transition-colors p-1"
              title="Remove lunch"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {selectedLunchRecipe ? (
          <div className="flex items-center justify-between gap-3 bg-[#F9F8F3] p-2.5 rounded-xl border border-[#E5E4DE]">
            <div
              onClick={() => onOpenRecipeDetail(selectedLunchRecipe.id)}
              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedLunchRecipe.imageUrl}
                alt={selectedLunchRecipe.name}
                className="w-10 h-10 rounded-lg object-cover bg-[#EAE8E0]"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1C1C1E] truncate">
                  {selectedLunchRecipe.name}
                </h4>
                <span className="text-[10px] text-[#7C7C80]">
                  {selectedLunchRecipe.cookTimeMins}m • {selectedLunchRecipe.calories || 400} kcal
                </span>
              </div>
            </div>

            {/* Cook selector for lunch */}
            <div className="flex items-center bg-[#FFFFFF] rounded-full p-0.5 border border-[#E5E4DE] text-[10px] shrink-0">
              <button
                onClick={(e) => handleAssignCook(selectedDay, 'Aatish', 'lunch', e)}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  selectedDay.lunchAssignedTo === 'Aatish'
                    ? 'bg-[#4A6B5D] text-white'
                    : 'text-[#5C5C60]'
                }`}
              >
                🧔🏽 Aatish
              </button>
              <button
                onClick={(e) => handleAssignCook(selectedDay, 'Faeeza', 'lunch', e)}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  selectedDay.lunchAssignedTo === 'Faeeza'
                    ? 'bg-[#4A6B5D] text-white'
                    : 'text-[#5C5C60]'
                }`}
              >
                👩🏽 Faeeza
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onOpenRecipePicker(selectedDay.dayOfWeek, 'lunch')}
            className="w-full py-2 border border-dashed border-[#D5D3CB] rounded-xl text-xs font-semibold text-[#7C7C80] hover:text-[#4A6B5D] hover:border-[#4A6B5D] flex items-center justify-center gap-1.5 transition-colors bg-[#FAF9F5]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lunch</span>
          </button>
        )}
      </div>

      {/* ================= PRIMARY DINNER SECTION ================= */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-[#4A6B5D]" />
            <span className="text-xs font-bold tracking-wider text-[#1C1C1E] uppercase">
              Scheduled Dinner
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleToggleLock(selectedDay, e)}
              className={`p-1.5 rounded-full border text-xs font-medium transition-colors ${
                selectedDay.isLocked
                  ? 'bg-[#4A6B5D]/10 border-[#4A6B5D] text-[#4A6B5D]'
                  : 'bg-[#FFFFFF] border-[#E5E4DE] text-[#7C7C80] hover:text-[#1C1C1E]'
              }`}
              title={selectedDay.isLocked ? 'Day locked' : 'Lock day'}
            >
              {selectedDay.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => handleRerollDay(selectedDay, e)}
              className="p-1.5 rounded-full bg-[#FFFFFF] border border-[#E5E4DE] text-[#7C7C80] hover:text-[#1C1C1E] transition-colors"
              title="Reroll dinner"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dinner Card Item */}
        {selectedDay.isLeftoverOrOut ? (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-6 shadow-xs text-center">
            <div className="w-12 h-12 rounded-full bg-[#F2EFE8] flex items-center justify-center mx-auto mb-3 text-2xl">
              {selectedDay.leftoverType === 'take_out' ? '🥡' : '🍽️'}
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1C1E] mb-1">
              {selectedDay.leftoverType === 'take_out' ? 'Take out' : 'No plan'}
            </h3>
            <p className="text-xs text-[#7C7C80] mb-4">
              {selectedDay.notes || (selectedDay.leftoverType === 'take_out' ? 'Ordering takeout tonight!' : 'No cooking planned for dinner.')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleToggleLeftoverType(selectedDay, 'none')}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-[#4A6B5D] text-white hover:bg-[#3F5E4D] transition-colors"
              >
                Switch to Recipe
              </button>
            </div>
          </div>
        ) : selectedDinnerRecipe ? (
          <div
            onClick={() => onOpenRecipeDetail(selectedDinnerRecipe.id)}
            className="group relative bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {/* Image Banner */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#F2EFE8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedDinnerRecipe.imageUrl}
                alt={selectedDinnerRecipe.name}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="bg-[#1C1C1E]/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {selectedDinnerRecipe.cookTimeMins} MIN
                </span>
                {selectedDinnerRecipe.calories && (
                  <span className="bg-[#1C1C1E]/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {selectedDinnerRecipe.calories} KCAL
                  </span>
                )}
              </div>

              {/* Lock Badge */}
              {selectedDay.isLocked && (
                <div className="absolute top-3 right-3 bg-[#4A6B5D] text-white p-1.5 rounded-full shadow-xs">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Bottom text inside banner */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-xs">
                  {selectedDinnerRecipe.name}
                </h3>
              </div>
            </div>

            {/* Card Body & Assigned Cook Controls */}
            <div className="p-4 bg-[#FFFFFF]">
              <div className="flex items-center justify-between gap-2 mb-3">
                {/* Dual Ratings summary for Aatish & Faeeza */}
                <div className="flex items-center gap-2 text-xs text-[#5C5C60]">
                  <span className="flex items-center gap-1 font-medium">
                    🧔🏽 {selectedDinnerRecipe.ratingAatish ?? selectedDinnerRecipe.ratingHusband ?? 4}★
                  </span>
                  <span className="text-[#D0CFCA]">|</span>
                  <span className="flex items-center gap-1 font-medium">
                    👩🏽 {selectedDinnerRecipe.ratingFaeeza ?? selectedDinnerRecipe.ratingWife ?? 4}★
                  </span>
                </div>

                {/* Assigned Cook Selector */}
                <div className="flex items-center bg-[#F4F3ED] rounded-full p-0.5 text-[11px] font-medium">
                  <button
                    onClick={(e) => handleAssignCook(selectedDay, 'Aatish', 'dinner', e)}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      selectedDay.assignedTo === 'Aatish'
                        ? 'bg-[#4A6B5D] text-white font-semibold'
                        : 'text-[#5C5C60] hover:text-[#1C1C1E]'
                    }`}
                  >
                    🧔🏽 Aatish
                  </button>
                  <button
                    onClick={(e) => handleAssignCook(selectedDay, 'Faeeza', 'dinner', e)}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      selectedDay.assignedTo === 'Faeeza'
                        ? 'bg-[#4A6B5D] text-white font-semibold'
                        : 'text-[#5C5C60] hover:text-[#1C1C1E]'
                    }`}
                  >
                    👩🏽 Faeeza
                  </button>
                  <button
                    onClick={(e) => handleAssignCook(selectedDay, 'Together', 'dinner', e)}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      selectedDay.assignedTo === 'Together'
                        ? 'bg-[#4A6B5D] text-white font-semibold'
                        : 'text-[#5C5C60] hover:text-[#1C1C1E]'
                    }`}
                  >
                    🤝🏽 Together
                  </button>
                </div>
              </div>

              {/* Recipe tags and quick action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F0EFEA]">
                <div className="flex flex-wrap gap-1">
                  {selectedDinnerRecipe.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-semibold text-[#4A6B5D] bg-[#F1F6F3] border border-[#D9E6DF] px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#4A6B5D] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Recipe <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] rounded-2xl border-2 border-dashed border-[#DCDAD2] p-8 text-center">
            <UtensilsCrossed className="w-8 h-8 text-[#A09F99] mx-auto mb-2 stroke-[1.5]" />
            <h4 className="font-serif text-lg font-bold text-[#1C1C1E] mb-1">No Dinner Scheduled</h4>
            <p className="text-xs text-[#7C7C80] mb-4">Choose a recipe from your collection or roll randomly.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onOpenRecipePicker(selectedDay.dayOfWeek, 'dinner')}
                className="px-4 py-2 rounded-full bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D] transition-colors"
              >
                Pick Dinner
              </button>
              <button
                onClick={(e) => handleRerollDay(selectedDay, e)}
                className="px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-semibold text-[#2C2C2E] hover:bg-[#F2F1EA] transition-colors"
              >
                Roll Random
              </button>
            </div>
          </div>
        )}

        {/* Quick No plan or Take out Options */}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <button
            onClick={() => handleToggleLeftoverType(selectedDay, 'no_plan')}
            className={`text-[11px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              selectedDay.leftoverType === 'no_plan'
                ? 'bg-[#C8A060] text-white border-[#C8A060]'
                : 'bg-[#FFFFFF] text-[#7C7C80] border-[#E5E4DE] hover:text-[#1C1C1E]'
            }`}
          >
            🍽️ No plan
          </button>
          <button
            onClick={() => handleToggleLeftoverType(selectedDay, 'take_out')}
            className={`text-[11px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              selectedDay.leftoverType === 'take_out'
                ? 'bg-[#C87A50] text-white border-[#C87A50]'
                : 'bg-[#FFFFFF] text-[#7C7C80] border-[#E5E4DE] hover:text-[#1C1C1E]'
            }`}
          >
            🥡 Take out
          </button>
          <button
            onClick={() => onOpenRecipePicker(selectedDay.dayOfWeek, 'dinner')}
            className="text-[11px] font-medium px-3.5 py-1.5 rounded-full bg-[#FFFFFF] text-[#4A6B5D] border border-[#E5E4DE] hover:bg-[#F2F1EA] transition-colors"
          >
            🔄 Swap Recipe
          </button>
        </div>
      </div>

      {/* Week Planner Action Buttons (Smart Auto-Generate & Calendar Export) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        <button
          id="btn-auto-generate-plan"
          onClick={handleAutoGenerate}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#4A6B5D]/30 text-[#4A6B5D] font-semibold text-xs shadow-xs hover:bg-[#F1F6F3] transition-colors"
        >
          <Sparkles className="w-4 h-4 text-[#4A6B5D]" />
          <span>Auto-Generate Plan</span>
        </button>

        <button
          id="btn-export-calendar"
          onClick={handleExportCalendar}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#4A6B5D] text-white font-semibold text-xs shadow-sm hover:bg-[#3F5E4D] transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Plan to Calendar (.ics)</span>
        </button>
      </div>

      {/* 7-Day Plan Summary List */}
      <div className="mt-8">
        <h3 className="font-serif text-lg font-bold text-[#1C1C1E] mb-3">
          7-Day Week Overview
        </h3>
        <div className="space-y-2">
          {mealPlan.map((day, idx) => {
            const dinnerRecipe = recipes.find((r) => r.id === day.recipeId);
            const isSelected = selectedDayIndex === idx;

            const cookLabel =
              day.assignedTo === 'Aatish'
                ? '🧔🏽 Aatish'
                : day.assignedTo === 'Faeeza'
                ? '👩🏽 Faeeza'
                : '🤝🏽 Together';

            return (
              <div
                key={day.dayOfWeek}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#4A6B5D] shadow-xs ring-1 ring-[#4A6B5D]'
                    : 'bg-[#FFFFFF] border-[#E5E4DE] hover:bg-[#FBFBF9]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-[#4A6B5D] text-white' : 'bg-[#F2EFE8] text-[#5C5C60]'
                    }`}
                  >
                    {day.dayOfWeek}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1C1E]">
                      {day.isLeftoverOrOut
                        ? day.leftoverType === 'take_out'
                          ? '🥡 Take out'
                          : '🍽️ No plan'
                        : dinnerRecipe?.name || 'Unassigned'}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-[#7C7C80]">
                      <span>Dinner Cook: {cookLabel}</span>
                      {day.breakfastRecipeName && (
                        <span>• ☕ Breakfast</span>
                      )}
                      {day.lunchRecipeName && (
                        <span>• ☀️ Lunch</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {day.isLocked && (
                    <Lock className="w-3.5 h-3.5 text-[#4A6B5D]" />
                  )}
                  {dinnerRecipe && (
                    <span className="text-[10px] font-semibold text-[#5C5C60] bg-[#F2EFE8] px-2 py-0.5 rounded-full">
                      {dinnerRecipe.cookTimeMins}m
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
