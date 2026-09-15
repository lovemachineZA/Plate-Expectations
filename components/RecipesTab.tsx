'use client';

import React, { useState, useMemo } from 'react';
import { Recipe, UserRole } from '@/lib/types';
import { Search, Plus, Clock } from 'lucide-react';

interface RecipesTabProps {
  recipes: Recipe[];
  activeUser: UserRole;
  availableTags?: string[];
  onOpenRecipeDetail: (recipeId: string) => void;
  onAddNewRecipe: () => void;
}

export function RecipesTab({
  recipes,
  activeUser,
  availableTags = ['ALL RECIPES', 'QUICK < 30 MIN', 'HIGH-PROTEIN', 'VEGETARIAN', 'COMFORT', 'SEAFOOD'],
  onOpenRecipeDetail,
  onAddNewRecipe,
}: RecipesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL RECIPES');

  const categories = useMemo(() => {
    const defaultList = ['ALL RECIPES', 'QUICK < 30 MIN', 'HIGH-PROTEIN', 'VEGETARIAN', 'COMFORT', 'SEAFOOD'];
    const merged = Array.from(new Set([...defaultList, ...availableTags]));
    return merged;
  }, [availableTags]);

  // Real-time zero-latency search & filtering
  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return recipes.filter((rec) => {
      // Category tag filter
      if (selectedTag !== 'ALL RECIPES') {
        const matchesTag = rec.tags.some(
          (t) => t.toUpperCase() === selectedTag.toUpperCase()
        );
        if (!matchesTag) return false;
      }

      // Search query filter (title, ingredients, notes, tags)
      if (!q) return true;
      const titleMatch = rec.name.toLowerCase().includes(q);
      const ingMatch = rec.ingredients.toLowerCase().includes(q);
      const tagMatch = rec.tags.some((t) => t.toLowerCase().includes(q));
      const noteMatch = rec.notes.toLowerCase().includes(q);

      return titleMatch || ingMatch || tagMatch || noteMatch;
    });
  }, [recipes, searchQuery, selectedTag]);

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4">
      {/* Top Header & Search Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1C1C1E] tracking-tight">
            Recipes
          </h2>
          <span className="text-xs text-[#7C7C80] font-medium">
            {recipes.length} family dishes in collection
          </span>
        </div>

        <button
          id="btn-add-recipe"
          onClick={onAddNewRecipe}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D] transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Recipe</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by recipe, ingredient, or tag..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs text-[#1C1C1E] placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#4A6B5D] focus:border-[#4A6B5D] transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8E93] hover:text-[#1C1C1E] bg-[#F2EFE8] rounded-full w-5 h-5 flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4 -mx-1 px-1">
        {categories.map((cat) => {
          const isSelected = selectedTag === cat;
          return (
            <button
              key={cat}
              id={`cat-chip-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedTag(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all uppercase ${
                isSelected
                  ? 'bg-[#4A6B5D] text-white shadow-xs'
                  : 'bg-[#FFFFFF] border border-[#E5E4DE] text-[#5C5C60] hover:bg-[#F2F1EA]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 2-Column Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredRecipes.map((recipe) => {
            const primaryTag = recipe.tags[0] || 'FAVORITE';
            const rAatish = recipe.ratingAatish ?? recipe.ratingHusband ?? 4;
            const rFaeeza = recipe.ratingFaeeza ?? recipe.ratingWife ?? 4;

            return (
              <div
                key={recipe.id}
                onClick={() => onOpenRecipeDetail(recipe.id)}
                className="group relative bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Photo container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F2EFE8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Cook time badge */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{recipe.cookTimeMins}m</span>
                  </div>
                </div>

                {/* Dark Banner / Card Content */}
                <div className="p-2.5 bg-[#1C1C1E] text-white flex-1 flex flex-col justify-between">
                  <h4 className="font-serif text-xs font-bold leading-tight mb-2 line-clamp-2 text-[#FFFFFF]">
                    {recipe.name}
                  </h4>

                  <div>
                    {/* Primary Tag badge */}
                    <div className="inline-block border border-[#C87A50] text-[#E5A075] text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase mb-2">
                      {primaryTag}
                    </div>

                    {/* Dual ratings footer for Aatish & Faeeza */}
                    <div className="flex items-center justify-between text-[10px] text-[#A09F99] pt-1.5 border-t border-white/10">
                      <span className="flex items-center gap-0.5">
                        🧔🏽 <span className="text-white font-medium">{rAatish}★</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        👩🏽 <span className="text-white font-medium">{rFaeeza}★</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-8 text-center mt-4">
          <p className="text-xs text-[#7C7C80] mb-3">No recipes match &quot;{searchQuery}&quot;.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('ALL RECIPES');
            }}
            className="text-xs font-semibold text-[#4A6B5D] underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
