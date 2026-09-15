'use client';

import React, { useState, useMemo } from 'react';
import { MealPlanDay, Recipe, PantryItem, GroceryItem } from '@/lib/types';
import { compileGroceryList } from '@/lib/planner-utils';
import {
  ShoppingBag,
  PackageCheck,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Store,
  Calendar,
  Layers,
} from 'lucide-react';

interface GroceriesTabProps {
  mealPlan: MealPlanDay[];
  recipes: Recipe[];
  pantry: PantryItem[];
  onUpdatePantryItem: (item: PantryItem) => void;
  onAddPantryItem: (item: PantryItem) => void;
  onDeletePantryItem: (id: string) => void;
}

const CATEGORY_OPTIONS: PantryItem['category'][] = [
  'Fruit&Veg',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry Staples',
  'Bakery',
  'Frozen',
  'General',
];

// Helper to format date as dd-mm
const formatDDMM = (dateObj: Date = new Date()) => {
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}`;
};

export function GroceriesTab({
  mealPlan,
  recipes,
  pantry,
  onUpdatePantryItem,
  onAddPantryItem,
  onDeletePantryItem,
}: GroceriesTabProps) {
  const [activeSegment, setActiveSegment] = useState<'shopping' | 'pantry'>('shopping');
  const [showPantryInList, setShowPantryInList] = useState(false);
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<GroceryItem[]>([]);

  // Add to Grocery List Form State
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<PantryItem['category']>('Fruit&Veg');
  const [newCustomStore, setNewCustomStore] = useState('');
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);

  // Add to In Pantry Form State
  const [newPantryName, setNewPantryName] = useState('');
  const [newPantryCategory, setNewPantryCategory] = useState<PantryItem['category']>('Fruit&Veg');
  const [newPantryExpiry, setNewPantryExpiry] = useState('');
  const [newPantryUseFirst, setNewPantryUseFirst] = useState(false);
  const [showAddPantryForm, setShowAddPantryForm] = useState(false);

  // Collapsed categories state (map of category -> isCollapsed)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Compile smart list
  const compiledList = useMemo(() => {
    const base = compileGroceryList(mealPlan, recipes, pantry, checkedState);
    return [...base, ...customItems];
  }, [mealPlan, recipes, pantry, checkedState, customItems]);

  // Filter based on pantry visibility
  const displayedGroceryList = useMemo(() => {
    if (showPantryInList) return compiledList;
    return compiledList.filter((item) => !item.isInPantry);
  }, [compiledList, showPantryInList]);

  // Group Grocery List by Category
  const groupedGroceries = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    displayedGroceryList.forEach((item) => {
      let cat = item.category || 'General';
      if (cat === 'Produce') cat = 'Fruit&Veg';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [displayedGroceryList]);

  // Group In Pantry by Category
  const groupedPantry = useMemo(() => {
    const groups: Record<string, PantryItem[]> = {};
    pantry.forEach((item) => {
      let cat = item.category || 'General';
      if (cat === 'Produce') cat = 'Fruit&Veg';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [pantry]);

  // Stats
  const totalItems = displayedGroceryList.length;
  const checkedCount = displayedGroceryList.filter((i) => checkedState[i.id]).length;

  const toggleCheck = (id: string) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCustomGroceryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;
    const newItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      itemName: newCustomName.trim(),
      quantity: '1 item',
      category: newCustomCategory,
      store: newCustomStore.trim() || undefined,
      checked: false,
      sourceRecipeNames: ['Custom entry'],
      isInPantry: false,
    };
    setCustomItems([...customItems, newItem]);
    setNewCustomName('');
    setNewCustomStore('');
    setShowAddCustomForm(false);
  };

  const handleCreatePantryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPantryName.trim()) return;
    const newItem: PantryItem = {
      id: `pan-${Date.now()}`,
      itemName: newPantryName.trim(),
      category: newPantryCategory,
      inStock: true,
      useFirst: newPantryUseFirst,
      expiry: newPantryExpiry.trim() || undefined,
      addedDate: formatDDMM(),
    };
    onAddPantryItem(newItem);
    setNewPantryName('');
    setNewPantryExpiry('');
    setNewPantryUseFirst(false);
    setShowAddPantryForm(false);
  };

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1C1C1E] tracking-tight">
            Groceries & Pantry
          </h2>
          <span className="text-xs text-[#7C7C80] font-medium">
            Smart ingredients & kitchen inventory
          </span>
        </div>
      </div>

      {/* Segmented Control (Grocery List vs In Pantry) */}
      <div className="bg-[#FFFFFF] p-1 rounded-2xl border border-[#E5E4DE] flex items-center mb-5 shadow-xs">
        <button
          id="tab-segment-shopping"
          onClick={() => setActiveSegment('shopping')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSegment === 'shopping'
              ? 'bg-[#4A6B5D] text-white shadow-xs'
              : 'text-[#5C5C60] hover:text-[#1C1C1E]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Grocery List ({totalItems})</span>
        </button>
        <button
          id="tab-segment-pantry"
          onClick={() => setActiveSegment('pantry')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSegment === 'pantry'
              ? 'bg-[#4A6B5D] text-white shadow-xs'
              : 'text-[#5C5C60] hover:text-[#1C1C1E]'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>In Pantry ({pantry.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. GROCERY LIST VIEW */}
      {/* ========================================================================= */}
      {activeSegment === 'shopping' && (
        <div>
          {/* Progress & Pantry Toggle Controls */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-4 mb-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1C1C1E]">
                Shopping Progress
              </span>
              <span className="text-xs font-semibold text-[#4A6B5D]">
                {checkedCount} of {totalItems} items acquired
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#F2EFE8] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-[#4A6B5D] transition-all duration-300 rounded-full"
                style={{
                  width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%`,
                }}
              />
            </div>

            {/* In-Pantry Exclusion Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F0EFEA] text-xs">
              <span className="text-[#5C5C60]">
                {showPantryInList
                  ? 'Showing items in pantry'
                  : 'Hiding items already in pantry'}
              </span>
              <button
                onClick={() => setShowPantryInList(!showPantryInList)}
                className="text-xs font-semibold text-[#4A6B5D] flex items-center gap-1 hover:underline"
              >
                {showPantryInList ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPantryInList ? 'Hide in-stock' : 'Show in-stock'}</span>
              </button>
            </div>
          </div>

          {/* Quick Add Custom Item Button & Form with Optional Store Field */}
          <div className="mb-4">
            {!showAddCustomForm ? (
              <button
                onClick={() => setShowAddCustomForm(true)}
                className="w-full py-2.5 px-4 bg-[#FFFFFF] border border-[#E5E4DE] rounded-xl text-xs font-semibold text-[#4A6B5D] hover:bg-[#F2F1EA] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to Grocery List</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddCustomGroceryItem}
                className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#4A6B5D] shadow-sm space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1C1E]">
                    Add to Grocery List
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomForm(false)}
                    className="text-xs text-[#7C7C80] hover:text-[#1C1C1E]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={newCustomName}
                    onChange={(e) => setNewCustomName(e.target.value)}
                    placeholder="Item name (e.g. Greek Yogurt, Sourdough)..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E4DE] text-xs text-[#1C1C1E] focus:outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#7C7C80] block mb-1 uppercase">
                        Category
                      </label>
                      <select
                        value={newCustomCategory}
                        onChange={(e) => setNewCustomCategory(e.target.value as any)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E4DE] text-xs text-[#1C1C1E]"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#7C7C80] block mb-1 uppercase">
                        Store (Optional)
                      </label>
                      <div className="relative">
                        <Store className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                        <input
                          type="text"
                          value={newCustomStore}
                          onChange={(e) => setNewCustomStore(e.target.value)}
                          placeholder="e.g. Costco, TJs"
                          className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E4DE] text-xs text-[#1C1C1E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomForm(false)}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E4DE] text-xs text-[#5C5C60]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D]"
                  >
                    Add to List
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Grouped Collapsible Categories for Grocery List */}
          {Object.keys(groupedGroceries).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(groupedGroceries).map(([category, items]) => {
                const isCollapsed = !!collapsedCategories[category];
                const checkedInCat = items.filter((i) => checkedState[i.id]).length;

                return (
                  <div
                    key={category}
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] overflow-hidden shadow-xs transition-all"
                  >
                    {/* Collapsible Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(category)}
                      className="w-full px-4 py-3 bg-[#F7F6F0] border-b border-[#E5E4DE] flex items-center justify-between hover:bg-[#EFECE3] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-[#4A6B5D]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#4A6B5D]" />
                        )}
                        <span className="text-xs font-bold tracking-wider text-[#4A6B5D] uppercase">
                          {category}
                        </span>
                        <span className="text-[10px] font-semibold text-[#7C7C80] bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E5E4DE]">
                          {items.length}
                        </span>
                      </div>

                      <div className="text-[11px] font-medium text-[#7C7C80]">
                        {checkedInCat > 0 && `${checkedInCat}/${items.length} bought`}
                      </div>
                    </button>

                    {/* Items List (if not collapsed) */}
                    {!isCollapsed && (
                      <div className="divide-y divide-[#F0EFEA]">
                        {items.map((item) => {
                          const isChecked = !!checkedState[item.id];
                          return (
                            <label
                              key={item.id}
                              onClick={() => toggleCheck(item.id)}
                              className="flex items-center justify-between p-3.5 hover:bg-[#FAF9F5] transition-colors cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? 'bg-[#4A6B5D] border-[#4A6B5D] text-white'
                                      : 'border-[#C8C7C0] bg-[#FFFFFF]'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                </div>
                                <div>
                                  <span
                                    className={`text-xs font-medium block ${
                                      isChecked
                                        ? 'line-through text-[#A09F99]'
                                        : 'text-[#1C1C1E]'
                                    }`}
                                  >
                                    {item.itemName}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-[#7C7C80] mt-0.5">
                                    <span>{item.quantity}</span>
                                    {item.store && (
                                      <span className="flex items-center gap-0.5 text-[#4A6B5D] font-medium bg-[#EAF2EE] px-1.5 py-0.2 rounded">
                                        <Store className="w-2.5 h-2.5" />
                                        {item.store}
                                      </span>
                                    )}
                                    {item.sourceRecipeNames && (
                                      <span className="text-[#A09F99] truncate max-w-[150px]">
                                        ({item.sourceRecipeNames.join(', ')})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {item.isInPantry && (
                                <span className="text-[9px] font-bold text-[#4A6B5D] bg-[#EAF2EE] border border-[#D0E2D8] px-2 py-0.5 rounded-full">
                                  In Pantry
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] p-8 text-center">
              <CheckCheck className="w-8 h-8 text-[#4A6B5D] mx-auto mb-2" />
              <h4 className="font-serif text-lg font-bold text-[#1C1C1E] mb-1">
                All Set for the Week!
              </h4>
              <p className="text-xs text-[#7C7C80]">
                All needed ingredients are either in your pantry or already acquired.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IN PANTRY VIEW */}
      {/* ========================================================================= */}
      {activeSegment === 'pantry' && (
        <div>
          {/* Quick Add Pantry Item Button & Form with Optional Expiry (dd-mm) and Auto Added Date */}
          <div className="mb-4">
            {!showAddPantryForm ? (
              <button
                onClick={() => setShowAddPantryForm(true)}
                className="w-full py-2.5 px-4 bg-[#FFFFFF] border border-[#E5E4DE] rounded-xl text-xs font-semibold text-[#4A6B5D] hover:bg-[#F2F1EA] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to In Pantry</span>
              </button>
            ) : (
              <form
                onSubmit={handleCreatePantryItem}
                className="bg-[#FFFFFF] rounded-2xl border border-[#4A6B5D] p-4 shadow-sm space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1C1E]">
                    Add New Pantry Item
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddPantryForm(false)}
                    className="text-xs text-[#7C7C80] hover:text-[#1C1C1E]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={newPantryName}
                    onChange={(e) => setNewPantryName(e.target.value)}
                    placeholder="Item name (e.g. Fresh Dill, Avocados)..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E4DE] text-xs text-[#1C1C1E] focus:outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#7C7C80] block mb-1 uppercase">
                        Category
                      </label>
                      <select
                        value={newPantryCategory}
                        onChange={(e) => setNewPantryCategory(e.target.value as any)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E4DE] text-xs text-[#5C5C60]"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#7C7C80] block mb-1 uppercase">
                        Expiry dd-mm (Optional)
                      </label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                        <input
                          type="text"
                          maxLength={5}
                          value={newPantryExpiry}
                          onChange={(e) => setNewPantryExpiry(e.target.value)}
                          placeholder="e.g. 18-09"
                          className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E4DE] text-xs text-[#1C1C1E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#5C5C60] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPantryUseFirst}
                      onChange={(e) => setNewPantryUseFirst(e.target.checked)}
                      className="rounded text-[#4A6B5D]"
                    />
                    <span>Flag as &quot;Use First&quot;</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPantryForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-[#E5E4DE] text-xs text-[#5C5C60]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D]"
                    >
                      Save to Pantry
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Grouped Collapsible Categories for In Pantry */}
          <div className="space-y-3">
            {Object.entries(groupedPantry).map(([category, items]) => {
              const isCollapsed = !!collapsedCategories[`pantry_${category}`];
              const inStockCount = items.filter((i) => i.inStock).length;

              return (
                <div
                  key={category}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#E5E4DE] overflow-hidden shadow-xs"
                >
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategoryCollapse(`pantry_${category}`)}
                    className="w-full px-4 py-3 bg-[#F7F6F0] border-b border-[#E5E4DE] flex items-center justify-between hover:bg-[#EFECE3] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-[#4A6B5D]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#4A6B5D]" />
                      )}
                      <span className="text-xs font-bold tracking-wider text-[#4A6B5D] uppercase">
                        {category}
                      </span>
                      <span className="text-[10px] font-semibold text-[#7C7C80] bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E5E4DE]">
                        {items.length}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-[#7C7C80]">
                      {inStockCount} in stock
                    </span>
                  </button>

                  {/* Items list */}
                  {!isCollapsed && (
                    <div className="divide-y divide-[#F0EFEA]">
                      {items.map((item) => {
                        const addedDateFormatted = item.addedDate || '14-09';
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* In-Stock Check Toggle */}
                              <button
                                onClick={() =>
                                  onUpdatePantryItem({
                                    ...item,
                                    inStock: !item.inStock,
                                  })
                                }
                                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                                  item.inStock
                                    ? 'bg-[#4A6B5D] border-[#4A6B5D] text-white'
                                    : 'border-[#C8C7C0] bg-[#F2EFE8] text-transparent'
                                }`}
                                title={item.inStock ? 'In stock' : 'Out of stock'}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              <div>
                                <span
                                  className={`text-xs font-semibold block ${
                                    item.inStock ? 'text-[#1C1C1E]' : 'text-[#8E8E93] line-through'
                                  }`}
                                >
                                  {item.itemName}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-[#7C7C80] mt-0.5">
                                  <span>Added {addedDateFormatted}</span>
                                  {item.expiry && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#C87A50] font-medium">
                                        Exp: {item.expiry}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Use First Badge Toggle */}
                              <button
                                onClick={() =>
                                  onUpdatePantryItem({
                                    ...item,
                                    useFirst: !item.useFirst,
                                  })
                                }
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                  item.useFirst
                                    ? 'bg-[#E05A47] text-white border-[#E05A47]'
                                    : 'bg-[#FFFFFF] text-[#7C7C80] border-[#E5E4DE] hover:text-[#1C1C1E]'
                                }`}
                              >
                                {item.useFirst ? '⚠️ Use First' : 'Use First'}
                              </button>

                              {/* Delete Item */}
                              <button
                                onClick={() => onDeletePantryItem(item.id)}
                                className="p-1 text-[#8E8E93] hover:text-[#E05A47] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
