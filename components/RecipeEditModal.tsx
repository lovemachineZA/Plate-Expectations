'use client';

import React, { useState } from 'react';
import { Recipe, UserRole } from '@/lib/types';
import { X, Save, Star, Trash2, Plus } from 'lucide-react';

interface RecipeEditModalProps {
  recipe: Recipe | null; // null if creating new
  activeUser: UserRole;
  availableTags?: string[];
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onAddCustomTag?: (tag: string) => void;
  onDelete?: (recipeId: string) => void;
}

const DEFAULT_TAGS = [
  'QUICK < 30 MIN',
  'HIGH-PROTEIN',
  'VEGETARIAN',
  'COMFORT',
  'SEAFOOD',
  'GLUTEN-FREE',
  'MEAL PREP',
  'KID-FRIENDLY',
];

const SAMPLE_IMAGES = [
  { name: 'Salmon Bowl', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80' },
  { name: 'Pasta', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&auto=format&fit=crop&q=80' },
  { name: 'Steak', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80' },
  { name: 'Grain Bowl', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&auto=format&fit=crop&q=80' },
  { name: 'Shakshuka', url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1000&auto=format&fit=crop&q=80' },
  { name: 'Chicken', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1000&auto=format&fit=crop&q=80' },
  { name: 'Curry', url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1000&auto=format&fit=crop&q=80' },
];

export function RecipeEditModal({
  recipe,
  activeUser,
  availableTags = DEFAULT_TAGS,
  onClose,
  onSave,
  onAddCustomTag,
  onDelete,
}: RecipeEditModalProps) {
  const isEditing = !!recipe;

  const [name, setName] = useState(recipe?.name || '');
  const [ingredients, setIngredients] = useState(recipe?.ingredients || '');
  const [instructions, setInstructions] = useState(recipe?.instructions || '');
  const [cookTimeMins, setCookTimeMins] = useState(recipe?.cookTimeMins || 25);
  const [calories, setCalories] = useState(recipe?.calories || 450);
  const [servings, setServings] = useState(recipe?.servings || 2);
  const [ratingAatish, setRatingAatish] = useState(recipe?.ratingAatish ?? recipe?.ratingHusband ?? 4);
  const [ratingFaeeza, setRatingFaeeza] = useState(recipe?.ratingFaeeza ?? recipe?.ratingWife ?? 4);
  const [tags, setTags] = useState<string[]>(recipe?.tags || ['QUICK < 30 MIN']);
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [newTagInput, setNewTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState(
    recipe?.imageUrl ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80'
  );

  const allAvailableTags = Array.from(new Set([...DEFAULT_TAGS, ...availableTags]));

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim().toUpperCase();
    if (!cleanTag) return;

    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    if (onAddCustomTag) {
      onAddCustomTag(cleanTag);
    }
    setNewTagInput('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedRecipe: Recipe = {
      id: recipe?.id || `rec-${Date.now()}`,
      name: name.trim(),
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
      cookTimeMins: Number(cookTimeMins) || 20,
      calories: Number(calories) || 400,
      servings: Number(servings) || 2,
      ratingAatish: Number(ratingAatish),
      ratingFaeeza: Number(ratingFaeeza),
      ratingHusband: Number(ratingAatish),
      ratingWife: Number(ratingFaeeza),
      tags: tags.length > 0 ? tags : ['COMFORT'],
      notes: notes.trim(),
      imageUrl: imageUrl.trim(),
      lastCookedDate: recipe?.lastCookedDate || new Date().toISOString().split('T')[0],
      createdBy: recipe?.createdBy || activeUser,
      lastEditedBy: activeUser,
      lastEditedTimestamp: new Date().toISOString(),
    };

    onSave(updatedRecipe);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#F9F8F3] w-full max-w-lg rounded-3xl border border-[#E5E4DE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFFFFF] border-b border-[#E5E4DE] flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#1C1C1E]">
            {isEditing ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#7C7C80] hover:text-[#1C1C1E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Recipe Name */}
          <div>
            <label className="block text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
              Recipe Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lemon Herb Salmon Bowl"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-medium text-[#1C1C1E] focus:ring-1 focus:ring-[#4A6B5D] focus:outline-none"
            />
          </div>

          {/* Quick Metrics (Cook Time, Calories, Servings) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#5C5C60] uppercase tracking-wider mb-1">
                Cook Time (Mins)
              </label>
              <input
                type="number"
                min="1"
                value={cookTimeMins}
                onChange={(e) => setCookTimeMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-medium text-[#1C1C1E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5C5C60] uppercase tracking-wider mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-medium text-[#1C1C1E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5C5C60] uppercase tracking-wider mb-1">
                Servings
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-medium text-[#1C1C1E]"
              />
            </div>
          </div>

          {/* Dual User Ratings */}
          <div className="grid grid-cols-2 gap-4 bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#E5E4DE]">
            <div>
              <span className="text-xs font-bold text-[#1C1C1E] flex items-center gap-1 mb-1">
                🧔🏽 Aatish Rating: {ratingAatish}★
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`ea-${star}`}
                    type="button"
                    onClick={() => setRatingAatish(star)}
                    className="text-lg"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratingAatish
                          ? 'fill-[#C8A060] text-[#C8A060]'
                          : 'text-[#DCDAD2]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#1C1C1E] flex items-center gap-1 mb-1">
                👩🏽 Faeeza Rating: {ratingFaeeza}★
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`ef-${star}`}
                    type="button"
                    onClick={() => setRatingFaeeza(star)}
                    className="text-lg"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratingFaeeza
                          ? 'fill-[#C8A060] text-[#C8A060]'
                          : 'text-[#DCDAD2]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ingredients (Line separated) */}
          <div>
            <label className="block text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
              Ingredients (line separated) *
            </label>
            <textarea
              rows={4}
              required
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="2 Salmon Fillets (6oz)&#10;1 cup Quinoa&#10;1 Lemon&#10;2 tbsp Fresh Dill"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-normal text-[#1C1C1E] focus:outline-none focus:ring-1 focus:ring-[#4A6B5D]"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
              Instructions
            </label>
            <textarea
              rows={5}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step 1. Cook quinoa...&#10;Step 2. Sear salmon..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-normal text-[#1C1C1E] focus:outline-none focus:ring-1 focus:ring-[#4A6B5D]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Faeeza prefers without cilantro&#10;Kids love extra dipping sauce&#10;Bake at 400F for crispier skin"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs text-[#1C1C1E] focus:outline-none focus:ring-1 focus:ring-[#4A6B5D]"
            />
          </div>

          {/* Photo URL & Sample Picker (Moved to bottom) */}
          <div>
            <label className="block text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
              Photo URL
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs text-[#1C1C1E] focus:outline-none"
              />
            </div>
            {/* Sample image quick pick */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[10px] text-[#7C7C80] whitespace-nowrap">Presets:</span>
              {SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5E4DE] text-[#5C5C60] hover:border-[#4A6B5D] whitespace-nowrap"
                >
                  {img.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tags with "Add tag" input and "+ Add" button (Moved to bottom) */}
          <div>
            <label className="block text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {allAvailableTags.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                      active
                        ? 'bg-[#4A6B5D] text-white border-[#4A6B5D]'
                        : 'bg-[#FFFFFF] text-[#5C5C60] border-[#E5E4DE] hover:bg-[#F2F1EA]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag input with + Add button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Add custom tag (e.g. AIR FRYER)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs text-[#1C1C1E] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddNewTag}
                className="px-3 py-1.5 rounded-xl bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D] transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add</span>
              </button>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-3 border-t border-[#E5E4DE] flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this recipe?')) {
                    onDelete(recipe.id);
                  }
                }}
                className="text-xs font-bold text-[#E05A47] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-semibold text-[#5C5C60]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D] flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Recipe</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
