'use client';

import React, { useState } from 'react';
import { Recipe, UserRole } from '@/lib/types';
import {
  ArrowLeft,
  X,
  Heart,
  Clock,
  Flame,
  Users,
  Star,
  Edit3,
  Calendar,
  Check,
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  activeUser: UserRole;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onRateRecipe: (recipeId: string, user: UserRole, rating: number) => void;
  onScheduleForDay: (
    recipe: Recipe,
    dayOfWeek?: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun',
    mealSlot?: 'breakfast' | 'lunch' | 'dinner'
  ) => void;
  onDeleteRecipe?: (recipeId: string) => void;
}

const WEEKDAYS: { key: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'; label: string; full: string }[] = [
  { key: 'Mon', label: 'Mon', full: 'Monday' },
  { key: 'Tue', label: 'Tue', full: 'Tuesday' },
  { key: 'Wed', label: 'Wed', full: 'Wednesday' },
  { key: 'Thu', label: 'Thu', full: 'Thursday' },
  { key: 'Fri', label: 'Fri', full: 'Friday' },
  { key: 'Sat', label: 'Sat', full: 'Saturday' },
  { key: 'Sun', label: 'Sun', full: 'Sunday' },
];

export function RecipeDetailModal({
  recipe,
  activeUser,
  onClose,
  onEdit,
  onRateRecipe,
  onScheduleForDay,
}: RecipeDetailModalProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedDayKey, setSelectedDayKey] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [selectedMealSlot, setSelectedMealSlot] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner');

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDaySelector) {
          setShowDaySelector(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDaySelector, onClose]);

  if (!recipe) return null;

  const ingredientList = recipe.ingredients
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleRatingClick = (user: UserRole, ratingValue: number) => {
    onRateRecipe(recipe.id, user, ratingValue);
  };

  const handleConfirmSchedule = () => {
    onScheduleForDay(recipe, selectedDayKey, selectedMealSlot);
    setShowDaySelector(false);
  };

  const rAatish = recipe.ratingAatish ?? recipe.ratingHusband ?? 4;
  const rFaeeza = recipe.ratingFaeeza ?? recipe.ratingWife ?? 4;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#F9F8F3] w-full max-w-xl min-h-screen pb-24 shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Navigation Bar with Prominent 'X' Close Button */}
        <div className="sticky top-0 left-0 right-0 z-30 px-4 py-3 bg-[#F9F8F3]/90 backdrop-blur-md border-b border-[#E5E4DE]/60 flex items-center justify-between shadow-xs">
          <button
            id="btn-back-recipe-detail"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] text-[#1C1C1E] border border-[#E5E4DE] shadow-xs text-xs font-semibold hover:bg-[#F2F1EA] transition-all active:scale-95"
            title="Back to recipes"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-9 h-9 rounded-full bg-[#FFFFFF] text-[#1C1C1E] border border-[#E5E4DE] flex items-center justify-center shadow-xs hover:bg-[#F2F1EA] transition-transform active:scale-95"
              title="Favorite dish"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-[#E05A47] text-[#E05A47]' : 'text-[#1C1C1E]'
                }`}
              />
            </button>
            <button
              onClick={() => onEdit(recipe)}
              className="w-9 h-9 rounded-full bg-[#FFFFFF] text-[#1C1C1E] border border-[#E5E4DE] flex items-center justify-center shadow-xs hover:bg-[#F2F1EA] transition-transform active:scale-95"
              title="Edit Recipe"
            >
              <Edit3 className="w-4 h-4 text-[#4A6B5D]" />
            </button>
            {/* Prominent 'X' Close Button */}
            <button
              id="btn-close-recipe-detail-x"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center shadow-sm hover:bg-[#3A3A3C] transition-all active:scale-95"
              aria-label="Close modal"
              title="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#F2EFE8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Recipe Body Container */}
        <div className="px-5 pt-6 flex-1">
          {/* Main Dish Serif Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1C1E] leading-tight mb-3">
            {recipe.name}
          </h1>

          {/* Quick Stats Row */}
          <div className="flex items-center gap-4 text-xs font-semibold text-[#5C5C60] mb-6 pb-4 border-b border-[#E5E4DE]">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#C87A50]" />
              <span>{recipe.calories || 450} KCAL</span>
            </div>
            <span className="text-[#D0CFCA]">|</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#4A6B5D]" />
              <span>{recipe.cookTimeMins} MIN</span>
            </div>
            <span className="text-[#D0CFCA]">|</span>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#7C7C80]" />
              <span>SERVES {recipe.servings || 2}</span>
            </div>
          </div>

          {/* Dual User Ratings Section for Aatish & Faeeza */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-4 mb-6 shadow-xs">
            <h4 className="text-[11px] font-bold tracking-wider text-[#7C7C80] uppercase mb-3">
              Family Ratings
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Aatish Rating */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#1C1C1E] flex items-center gap-1">
                    🧔🏽 Aatish
                  </span>
                  <span className="text-xs font-bold text-[#4A6B5D]">
                    {rAatish} / 5
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`a-${star}`}
                      onClick={() => handleRatingClick('Aatish', star)}
                      className="p-0.5 text-lg transition-transform hover:scale-115"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rAatish
                            ? 'fill-[#C8A060] text-[#C8A060]'
                            : 'text-[#DCDAD2]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Faeeza Rating */}
              <div className="flex flex-col border-l border-[#F0EFEA] pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#1C1C1E] flex items-center gap-1">
                    👩🏽 Faeeza
                  </span>
                  <span className="text-xs font-bold text-[#4A6B5D]">
                    {rFaeeza} / 5
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`f-${star}`}
                      onClick={() => handleRatingClick('Faeeza', star)}
                      className="p-0.5 text-lg transition-transform hover:scale-115"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rFaeeza
                            ? 'fill-[#C8A060] text-[#C8A060]'
                            : 'text-[#DCDAD2]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Stamp Metadata */}
          <div className="text-[11px] text-[#8E8E93] bg-[#EFECE3] px-3 py-2 rounded-xl mb-6 flex items-center justify-between">
            <span>
              Added by <strong className="text-[#5C5C60]">{recipe.createdBy || 'Aatish'}</strong>
            </span>
            <span>
              Last edited by <strong className="text-[#5C5C60]">{recipe.lastEditedBy || 'Faeeza'}</strong>
            </span>
          </div>

          {/* Ingredients Checklist */}
          <div className="mb-6">
            <h3 className="font-serif text-xl font-bold text-[#1C1C1E] mb-3">
              Ingredients
            </h3>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] divide-y divide-[#F0EFEA] overflow-hidden shadow-xs">
              {ingredientList.map((ing, idx) => {
                const isChecked = !!checkedIngredients[idx];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className="flex items-center justify-between p-3.5 hover:bg-[#FAF9F5] transition-colors cursor-pointer select-none"
                  >
                    <span
                      className={`text-xs ${
                        isChecked
                          ? 'line-through text-[#A09F99]'
                          : 'text-[#2C2C2E] font-medium'
                      }`}
                    >
                      {ing}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#4A6B5D] border-[#4A6B5D] text-white'
                          : 'border-[#C8C7C0] bg-[#FFFFFF]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="mb-6">
            <h3 className="font-serif text-xl font-bold text-[#1C1C1E] mb-3">
              Instructions
            </h3>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-4 text-xs text-[#2C2C2E] leading-relaxed whitespace-pre-line shadow-xs font-normal">
              {recipe.instructions}
            </div>
          </div>

          {/* Notes Section (Multiline support) */}
          {recipe.notes && (
            <div className="mb-8">
              <h4 className="text-[11px] font-bold tracking-wider text-[#7C7C80] uppercase mb-2">
                Family Notes & Tips
              </h4>
              <div className="bg-[#F4F3ED] rounded-xl p-3.5 text-xs text-[#5C5C60] whitespace-pre-line border border-[#E5E4DE]">
                {recipe.notes}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Fixed Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5E4DE] flex items-center gap-3 z-20">
          <button
            id="btn-open-schedule-selector"
            onClick={() => setShowDaySelector(true)}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#4A6B5D] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-[#3F5E4D] transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule in Meal Plan</span>
          </button>
          <button
            onClick={() => onEdit(recipe)}
            className="py-3 px-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] text-[#2C2C2E] font-semibold text-xs hover:bg-[#F2F1EA] transition-colors"
          >
            Edit
          </button>
        </div>

        {/* Weekday Selector Sheet / Popover */}
        {showDaySelector && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-[#FFFFFF] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#E5E4DE] shadow-2xl p-5 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EFEA]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1C1E]">
                    Schedule Dish
                  </h3>
                  <p className="text-xs text-[#7C7C80] truncate max-w-[260px]">
                    {recipe.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDaySelector(false)}
                  className="w-8 h-8 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#7C7C80] hover:text-[#1C1C1E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-[11px] font-bold text-[#5C5C60] uppercase tracking-wider mb-2">
                  Select Day of the Week
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((d) => {
                    const isSelected = selectedDayKey === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDayKey(d.key)}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#4A6B5D] text-white shadow-xs font-bold scale-102'
                            : 'bg-[#F9F8F3] text-[#5C5C60] border border-[#E5E4DE] hover:bg-[#EFECE3]'
                        }`}
                      >
                        <span className="text-[11px] font-bold">{d.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-center mt-1.5 text-xs font-semibold text-[#4A6B5D]">
                  {WEEKDAYS.find((d) => d.key === selectedDayKey)?.full}
                </div>
              </div>

              {/* Meal Slot Selection (Breakfast, Lunch, Dinner) */}
              <div>
                <label className="block text-[11px] font-bold text-[#5C5C60] uppercase tracking-wider mb-2">
                  Meal Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { slot: 'dinner' as const, label: '🍽️ Dinner' },
                    { slot: 'lunch' as const, label: '🥗 Lunch' },
                    { slot: 'breakfast' as const, label: '☕ Breakfast' },
                  ].map((item) => (
                    <button
                      key={item.slot}
                      type="button"
                      onClick={() => setSelectedMealSlot(item.slot)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                        selectedMealSlot === item.slot
                          ? 'bg-[#4A6B5D] text-white shadow-xs'
                          : 'bg-[#F9F8F3] text-[#5C5C60] border border-[#E5E4DE] hover:bg-[#EFECE3]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm / Action */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDaySelector(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5E4DE] text-xs font-semibold text-[#5C5C60] hover:bg-[#F2EFE8]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-schedule-day"
                  onClick={handleConfirmSchedule}
                  className="flex-2 py-2.5 rounded-xl bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D] shadow-xs"
                >
                  Schedule for {WEEKDAYS.find((d) => d.key === selectedDayKey)?.label} {selectedMealSlot.charAt(0).toUpperCase() + selectedMealSlot.slice(1)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
