'use client';

import React, { useState } from 'react';
import { Recipe, MealPlanDay } from '@/lib/types';
import { X, Search } from 'lucide-react';

interface RecipePickerModalProps {
  isOpen: boolean;
  dayOfWeek: MealPlanDay['dayOfWeek'] | null;
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  recipes: Recipe[];
  onClose: () => void;
  onSelectRecipe: (dayOfWeek: MealPlanDay['dayOfWeek'], recipe: Recipe, mealType?: 'breakfast' | 'lunch' | 'dinner') => void;
}

export function RecipePickerModal({
  isOpen,
  dayOfWeek,
  mealType = 'dinner',
  recipes,
  onClose,
  onSelectRecipe,
}: RecipePickerModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen || !dayOfWeek) return null;

  const mealTitle = mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Dinner';

  const filtered = recipes.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.ingredients.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#F9F8F3] w-full max-w-md rounded-3xl border border-[#E5E4DE] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFFFF] border-b border-[#E5E4DE] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1C1C1E]">
              Pick {mealTitle} for {dayOfWeek}
            </h3>
            <span className="text-[11px] text-[#7C7C80]">
              Select a recipe from your collection
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#7C7C80] hover:text-[#1C1C1E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-[#FFFFFF] border-b border-[#E5E4DE]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes, tags, ingredients..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E4DE] text-xs text-[#1C1C1E] focus:outline-none"
            />
          </div>
        </div>

        {/* List of recipes */}
        <div className="p-3 overflow-y-auto divide-y divide-[#F0EFEA] space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7C7C80]">
              No recipes match your search.
            </div>
          ) : (
            filtered.map((recipe) => {
              const rA = recipe.ratingAatish ?? recipe.ratingHusband ?? 4;
              const rF = recipe.ratingFaeeza ?? recipe.ratingWife ?? 4;
              return (
                <div
                  key={recipe.id}
                  onClick={() => {
                    onSelectRecipe(dayOfWeek, recipe, mealType);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#FFFFFF] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#F2EFE8]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#1C1C1E] line-clamp-1">
                        {recipe.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#7C7C80] mt-0.5">
                        <span>{recipe.cookTimeMins}m</span>
                        <span>•</span>
                        <span>🧔🏽 {rA}★ 👩🏽 {rF}★</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-[#4A6B5D] bg-[#EAF2EE] px-2.5 py-1 rounded-full">
                    Select
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
