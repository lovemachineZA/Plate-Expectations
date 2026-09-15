'use client';

import React, { useMemo } from 'react';
import { Recipe, MealPlanDay } from '@/lib/types';
import {
  Trophy,
  Scale,
  Users,
  Clock,
  Star,
  HeartHandshake,
} from 'lucide-react';

interface StatsTabProps {
  recipes: Recipe[];
  mealPlan: MealPlanDay[];
  onOpenRecipeDetail: (recipeId: string) => void;
}

export function StatsTab({ recipes, mealPlan, onOpenRecipeDetail }: StatsTabProps) {
  // 1. Most Popular Recipes (Highest combined rating)
  const topRated = useMemo(() => {
    return [...recipes]
      .map((r) => {
        const rA = r.ratingAatish ?? r.ratingHusband ?? 4;
        const rF = r.ratingFaeeza ?? r.ratingWife ?? 4;
        return {
          ...r,
          rA,
          rF,
          avgRating: (rA + rF) / 2,
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 4);
  }, [recipes]);

  // 2. Rating Alignment (High agreement vs Divergence)
  const alignmentData = useMemo(() => {
    const perfectMatches = recipes.filter((r) => {
      const rA = r.ratingAatish ?? r.ratingHusband ?? 4;
      const rF = r.ratingFaeeza ?? r.ratingWife ?? 4;
      return rA === rF && rA >= 4;
    });
    const divergent = [...recipes]
      .map((r) => {
        const rA = r.ratingAatish ?? r.ratingHusband ?? 4;
        const rF = r.ratingFaeeza ?? r.ratingWife ?? 4;
        return {
          ...r,
          rA,
          rF,
          diff: Math.abs(rA - rF),
        };
      })
      .sort((a, b) => b.diff - a.diff)
      .filter((r) => r.diff >= 1)
      .slice(0, 3);

    return { perfectMatches, divergent };
  }, [recipes]);

  // 3. Prep Duty Breakdown from current schedule & total
  const prepStats = useMemo(() => {
    let aatishCount = 0;
    let faeezaCount = 0;
    let togetherCount = 0;

    mealPlan.forEach((d) => {
      const cook = d.assignedTo;
      if (cook === 'Aatish') aatishCount++;
      else if (cook === 'Faeeza') faeezaCount++;
      else togetherCount++;
    });

    const total = mealPlan.length || 7;
    return {
      aatish: aatishCount,
      faeeza: faeezaCount,
      together: togetherCount,
      aatishPct: Math.round((aatishCount / total) * 100),
      faeezaPct: Math.round((faeezaCount / total) * 100),
      togetherPct: Math.round((togetherCount / total) * 100),
    };
  }, [mealPlan]);

  // 4. Tag Distributions
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    recipes.forEach((r) => {
      r.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [recipes]);

  // 5. Least recently cooked favorites (ready for a comeback)
  const reviveFavorites = useMemo(() => {
    return [...recipes]
      .filter((r) => {
        const rA = r.ratingAatish ?? r.ratingHusband ?? 4;
        const rF = r.ratingFaeeza ?? r.ratingWife ?? 4;
        return rA >= 4 && rF >= 4;
      })
      .sort((a, b) => {
        const dateA = new Date(a.lastCookedDate || '2000-01-01').getTime();
        const dateB = new Date(b.lastCookedDate || '2000-01-01').getTime();
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [recipes]);

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4 space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#1C1C1E] tracking-tight">
          Family Analytics
        </h2>
        <span className="text-xs text-[#7C7C80] font-medium">
          Insights across recipes, ratings & cooking duties
        </span>
      </div>

      {/* 1. Prep Duty Breakdown */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4A6B5D]" />
            <h3 className="font-serif text-base font-bold text-[#1C1C1E]">
              Weekly Prep Duty Breakdown
            </h3>
          </div>
          <span className="text-xs text-[#7C7C80]">Active Week</span>
        </div>

        {/* Multi-color stacked progress bar */}
        <div className="w-full h-3 bg-[#F2EFE8] rounded-full overflow-hidden flex mb-4">
          <div
            style={{ width: `${prepStats.aatishPct}%` }}
            className="bg-[#4A6B5D] h-full transition-all"
            title={`Aatish: ${prepStats.aatish} meals`}
          />
          <div
            style={{ width: `${prepStats.faeezaPct}%` }}
            className="bg-[#8CA899] h-full transition-all"
            title={`Faeeza: ${prepStats.faeeza} meals`}
          />
          <div
            style={{ width: `${prepStats.togetherPct}%` }}
            className="bg-[#D29B71] h-full transition-all"
            title={`Together: ${prepStats.together} meals`}
          />
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-[#F6F9F7] border border-[#E2EFE9]">
            <span className="text-[11px] font-bold text-[#4A6B5D] block">🧔🏽 Aatish</span>
            <span className="text-lg font-bold text-[#1C1C1E]">{prepStats.aatish}</span>
            <span className="text-[10px] text-[#7C7C80] block">{prepStats.aatishPct}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F6F9F7] border border-[#E2EFE9]">
            <span className="text-[11px] font-bold text-[#5B7B6C] block">👩🏽 Faeeza</span>
            <span className="text-lg font-bold text-[#1C1C1E]">{prepStats.faeeza}</span>
            <span className="text-[10px] text-[#7C7C80] block">{prepStats.faeezaPct}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FCF7F3] border border-[#F4E6DC]">
            <span className="text-[11px] font-bold text-[#C87A50] block">🤝🏽 Together</span>
            <span className="text-lg font-bold text-[#1C1C1E]">{prepStats.together}</span>
            <span className="text-[10px] text-[#7C7C80] block">{prepStats.togetherPct}%</span>
          </div>
        </div>
      </div>

      {/* 2. Most Popular Recipes (Highest Average Dual Rating) */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-[#C8A060]" />
          <h3 className="font-serif text-base font-bold text-[#1C1C1E]">
            Most Popular Recipes
          </h3>
        </div>

        <div className="space-y-2.5">
          {topRated.map((r, i) => (
            <div
              key={r.id}
              onClick={() => onOpenRecipeDetail(r.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9F8F3] hover:bg-[#F2EFE8] transition-colors cursor-pointer border border-[#E5E4DE]"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E5E4DE] text-[#5C5C60] font-bold text-xs flex items-center justify-center">
                  #{i + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1C1E]">{r.name}</h4>
                  <span className="text-[10px] text-[#7C7C80]">
                    🧔🏽 {r.rA}★ | 👩🏽 {r.rF}★
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#4A6B5D]">
                <Star className="w-3.5 h-3.5 fill-[#C8A060] text-[#C8A060]" />
                <span>{r.avgRating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Rating Alignment & Taste Harmony */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Perfect Harmony */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-[#4A6B5D]">
            <HeartHandshake className="w-4 h-4" />
            <h4 className="font-serif text-xs font-bold text-[#1C1C1E]">
              Mutual 5-Star Favorites
            </h4>
          </div>
          <div className="space-y-1.5">
            {alignmentData.perfectMatches.slice(0, 3).map((r) => (
              <div
                key={r.id}
                onClick={() => onOpenRecipeDetail(r.id)}
                className="text-xs p-2 rounded-lg bg-[#F5F9F7] text-[#1C1C1E] font-medium cursor-pointer hover:underline"
              >
                ⭐ {r.name}
              </div>
            ))}
          </div>
        </div>

        {/* Divergent Taste Dishes */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-[#C87A50]">
            <Scale className="w-4 h-4" />
            <h4 className="font-serif text-xs font-bold text-[#1C1C1E]">
              Fun Taste Debates
            </h4>
          </div>
          <div className="space-y-1.5">
            {alignmentData.divergent.map((r) => (
              <div
                key={r.id}
                onClick={() => onOpenRecipeDetail(r.id)}
                className="text-xs p-2 rounded-lg bg-[#FCF7F3] text-[#1C1C1E] font-medium cursor-pointer flex justify-between items-center"
              >
                <span className="truncate pr-2">{r.name}</span>
                <span className="text-[10px] text-[#7C7C80] whitespace-nowrap">
                  🧔🏽 {r.rA}★ vs 👩🏽 {r.rF}★
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Least-Recently Cooked Favorites */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-[#4A6B5D]" />
          <h3 className="font-serif text-base font-bold text-[#1C1C1E]">
            Ready for a Comeback
          </h3>
        </div>
        <p className="text-xs text-[#7C7C80] mb-3">
          High-rated dishes you haven&apos;t cooked recently:
        </p>

        <div className="space-y-2">
          {reviveFavorites.map((r) => (
            <div
              key={r.id}
              onClick={() => onOpenRecipeDetail(r.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9F8F3] hover:bg-[#F2EFE8] transition-colors cursor-pointer border border-[#E5E4DE]"
            >
              <div>
                <h4 className="text-xs font-bold text-[#1C1C1E]">{r.name}</h4>
                <span className="text-[10px] text-[#7C7C80]">
                  Last made: {r.lastCookedDate || 'A while ago'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#4A6B5D] bg-[#EAF2EE] px-2.5 py-1 rounded-full">
                Plan This Week
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Tag Distribution Chips */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-5 shadow-xs">
        <h3 className="font-serif text-base font-bold text-[#1C1C1E] mb-3">
          Recipe Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {tagCounts.map(([tag, count]) => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F2EFE8] text-[#5C5C60] border border-[#E5E4DE] flex items-center gap-1.5"
            >
              <span>{tag}</span>
              <span className="bg-[#FFFFFF] text-[#4A6B5D] font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {count}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
