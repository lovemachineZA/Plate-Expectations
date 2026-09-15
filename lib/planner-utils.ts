import { Recipe, PantryItem, MealPlanDay, GroceryItem } from './types';

// Aisle classification helper with Fruit&Veg and General categories
export function categorizeIngredient(ingredientName: string): string {
  const lower = ingredientName.toLowerCase();
  if (
    lower.includes('lemon') ||
    lower.includes('lime') ||
    lower.includes('avocado') ||
    lower.includes('dill') ||
    lower.includes('arugula') ||
    lower.includes('spinach') ||
    lower.includes('broccoli') ||
    lower.includes('pepper') ||
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('sweet potato') ||
    lower.includes('cilantro') ||
    lower.includes('parsley') ||
    lower.includes('tomato') ||
    lower.includes('rosemary') ||
    lower.includes('cabbage') ||
    lower.includes('asparagus') ||
    lower.includes('zucchini') ||
    lower.includes('peas') ||
    lower.includes('basil') ||
    lower.includes('banana') ||
    lower.includes('blueberries') ||
    lower.includes('raspberries') ||
    lower.includes('berries') ||
    lower.includes('fruit') ||
    lower.includes('apple') ||
    lower.includes('kale') ||
    lower.includes('cucumber') ||
    lower.includes('lettuce') ||
    lower.includes('ginger')
  ) {
    return 'Fruit&Veg';
  }
  if (
    lower.includes('salmon') ||
    lower.includes('shrimp') ||
    lower.includes('chicken') ||
    lower.includes('steak') ||
    lower.includes('ribeye') ||
    lower.includes('cod') ||
    lower.includes('halibut') ||
    lower.includes('beef') ||
    lower.includes('pork') ||
    lower.includes('fish') ||
    lower.includes('meat') ||
    lower.includes('turkey') ||
    lower.includes('lamb')
  ) {
    return 'Meat & Seafood';
  }
  if (
    lower.includes('yogurt') ||
    lower.includes('egg') ||
    lower.includes('butter') ||
    lower.includes('parmesan') ||
    lower.includes('cream') ||
    lower.includes('cheese') ||
    lower.includes('feta') ||
    lower.includes('milk')
  ) {
    return 'Dairy & Eggs';
  }
  if (
    lower.includes('bread') ||
    lower.includes('sourdough') ||
    lower.includes('tortilla') ||
    lower.includes('bun') ||
    lower.includes('pita') ||
    lower.includes('bagel') ||
    lower.includes('rice') ||
    lower.includes('quinoa') ||
    lower.includes('farro') ||
    lower.includes('linguine') ||
    lower.includes('pasta') ||
    lower.includes('noodle')
  ) {
    return 'Bakery & Grains';
  }
  if (
    lower.includes('paprika') ||
    lower.includes('cumin') ||
    lower.includes('chili') ||
    lower.includes('curry') ||
    lower.includes('soy sauce') ||
    lower.includes('tamari') ||
    lower.includes('mayo') ||
    lower.includes('mayonnaise') ||
    lower.includes('tahini') ||
    lower.includes('vinegar') ||
    lower.includes('olive oil') ||
    lower.includes('honey') ||
    lower.includes('maple') ||
    lower.includes('salt')
  ) {
    return 'Spices & Condiments';
  }
  if (
    lower.includes('frozen') ||
    lower.includes('ice cream')
  ) {
    return 'Frozen';
  }
  if (
    lower.includes('paper') ||
    lower.includes('foil') ||
    lower.includes('bag') ||
    lower.includes('sponge') ||
    lower.includes('wrap') ||
    lower.includes('soap')
  ) {
    return 'General';
  }
  return 'Pantry Staples';
}

// Generate smart shopping list from all planned meals (Dinner, Breakfast, Lunch)
export function compileGroceryList(
  mealPlan: MealPlanDay[],
  recipes: Recipe[],
  pantry: PantryItem[],
  existingCheckedState: Record<string, boolean> = {},
  existingItems: GroceryItem[] = []
): GroceryItem[] {
  const itemMap = new Map<string, { quantityArr: string[]; category: string; store?: string; sourceRecipes: Set<string>; inPantry: boolean }>();

  // Helper to process a recipe's ingredients into the list
  const addRecipeIngredients = (recipeId: string | undefined, mealLabel: string) => {
    if (!recipeId) return;
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const rawLines = recipe.ingredients.split(/,|\n/).map((s) => s.trim()).filter(Boolean);

    rawLines.forEach((line) => {
      const cleanName = line
        .replace(/^[\d\s/½¼¾⅓⅔.-]+(cups?|tbsp|tsp|lbs?|oz|g|cloves?|sprigs?|can|cans|block|scoop|bunch|fillets?|breasts?|stalks?)?/i, '')
        .trim();
      const baseKey = cleanName.toLowerCase() || line.toLowerCase();

      const pantryMatch = pantry.find((p) => {
        const pLower = p.itemName.toLowerCase();
        return baseKey.includes(pLower) || pLower.includes(baseKey);
      });
      const isInPantry = !!(pantryMatch && pantryMatch.inStock);
      const category = pantryMatch?.category || categorizeIngredient(line);

      if (!itemMap.has(baseKey)) {
        itemMap.set(baseKey, {
          quantityArr: [line],
          category,
          sourceRecipes: new Set([`${recipe.name} (${mealLabel})`]),
          inPantry: isInPantry,
        });
      } else {
        const current = itemMap.get(baseKey)!;
        current.quantityArr.push(line);
        current.sourceRecipes.add(`${recipe.name} (${mealLabel})`);
      }
    });
  };

  mealPlan.forEach((day) => {
    // 1. Breakfast (if scheduled)
    if (day.breakfastRecipeId) {
      addRecipeIngredients(day.breakfastRecipeId, `${day.dayOfWeek} Breakfast`);
    }
    // 2. Lunch (if scheduled)
    if (day.lunchRecipeId) {
      addRecipeIngredients(day.lunchRecipeId, `${day.dayOfWeek} Lunch`);
    }
    // 3. Dinner (if not leftover / take out)
    if (!day.isLeftoverOrOut && day.recipeId) {
      addRecipeIngredients(day.recipeId, `${day.dayOfWeek} Dinner`);
    }
  });

  const groceryList: GroceryItem[] = [];
  let idx = 1;

  itemMap.forEach((val, key) => {
    const displayName = key.charAt(0).toUpperCase() + key.slice(1);
    const id = `groc-${idx++}-${key.replace(/\s+/g, '-').slice(0, 10)}`;
    const isChecked = !!existingCheckedState[id] || !!existingCheckedState[key];
    const existing = existingItems.find((item) => item.itemName.toLowerCase() === displayName.toLowerCase());

    groceryList.push({
      id,
      itemName: displayName,
      quantity: val.quantityArr.length > 1 ? `${val.quantityArr.length}x needed` : val.quantityArr[0],
      category: val.category,
      store: existing?.store,
      checked: isChecked,
      sourceRecipeNames: Array.from(val.sourceRecipes),
      isInPantry: val.inPantry,
    });
  });

  // Preserve any manually added grocery items that aren't tied to recipes
  existingItems.forEach((manual) => {
    const exists = groceryList.some((g) => g.itemName.toLowerCase() === manual.itemName.toLowerCase());
    if (!exists) {
      groceryList.push(manual);
    }
  });

  return groceryList;
}

// Auto-generate meal plan based on ratings, pantry "UseFirst", and variety
export function autoGeneratePlan(
  currentPlan: MealPlanDay[],
  recipes: Recipe[],
  pantry: PantryItem[]
): MealPlanDay[] {
  if (recipes.length === 0) return currentPlan;

  const useFirstItems = pantry.filter((p) => p.useFirst).map((p) => p.itemName.toLowerCase());

  const scoredRecipes = recipes.map((rec) => {
    const rAatish = rec.ratingAatish ?? rec.ratingHusband ?? 4;
    const rFaeeza = rec.ratingFaeeza ?? rec.ratingWife ?? 4;
    const avgRating = (rAatish + rFaeeza) / 2;
    let score = avgRating * 3;

    const ingLower = rec.ingredients.toLowerCase();
    const hasUseFirst = useFirstItems.some((item) => ingLower.includes(item));
    if (hasUseFirst) {
      score += 4;
    }

    if (rec.lastCookedDate) {
      const daysAgo = Math.max(0, (new Date().getTime() - new Date(rec.lastCookedDate).getTime()) / (1000 * 3600 * 24));
      score += Math.min(daysAgo / 5, 5);
    } else {
      score += 3;
    }

    return { recipe: rec, score };
  });

  scoredRecipes.sort((a, b) => b.score - a.score);

  const usedRecipeIds = new Set<string>();
  currentPlan.forEach((d) => {
    if (d.isLocked && d.recipeId) {
      usedRecipeIds.add(d.recipeId);
    }
  });

  const updatedPlan = currentPlan.map((day) => {
    if (day.isLocked) return day;

    let candidate = scoredRecipes.find((s) => !usedRecipeIds.has(s.recipe.id));
    if (!candidate) {
      candidate = scoredRecipes[Math.floor(Math.random() * scoredRecipes.length)];
    }

    if (candidate) {
      usedRecipeIds.add(candidate.recipe.id);
      return {
        ...day,
        recipeId: candidate.recipe.id,
        recipeName: candidate.recipe.name,
        isLeftoverOrOut: false,
        leftoverType: 'none' as const,
        notes: candidate.score > 12 ? 'High match (ratings & pantry items)' : '',
      };
    }
    return day;
  });

  return updatedPlan;
}

// Generate RFC 5545 .ics Calendar file
export function generateICSCalendar(mealPlan: MealPlanDay[], recipes: Recipe[], originUrl?: string): string {
  const baseUrl = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://plate-expectations.app');
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Plate Expectations//Meal Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Plate Expectations Dinners',
    'X-WR-TIMEZONE:UTC',
  ];

  mealPlan.forEach((day, index) => {
    if (day.isLeftoverOrOut) {
      const summary = day.leftoverType === 'take_out' ? 'Dinner: Take out' : 'Dinner: No plan';
      const eventDate = day.date.replace(/-/g, '');
      const dtStart = `${eventDate}T183000Z`;
      const dtEnd = `${eventDate}T193000Z`;
      const uid = `plate-plan-${day.dayOfWeek}-${index}-${Date.now()}@plate.app`;

      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:Scheduled dinner note: ${day.notes || 'Family dinner'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
      return;
    }

    const recipe = recipes.find((r) => r.id === day.recipeId);
    const dishName = recipe ? recipe.name : day.recipeName || 'Scheduled Dinner';
    const eventDate = day.date.replace(/-/g, '');
    const dtStart = `${eventDate}T183000Z`;
    const dtEnd = `${eventDate}T193000Z`;
    const uid = `plate-recipe-${day.recipeId || index}-${Date.now()}@plate.app`;
    const deepLink = `${baseUrl}/#recipe=${day.recipeId}`;

    const cookBadge = day.assignedTo === 'Aatish' ? 'Aatish' : day.assignedTo === 'Faeeza' ? 'Faeeza' : 'Together';
    const cookTime = recipe ? `${recipe.cookTimeMins} mins` : '30 mins';
    const ingredients = recipe ? recipe.ingredients.replace(/\n/g, ', ') : '';
    const desc = `Cook: ${cookBadge} | Prep Time: ${cookTime}\\n\\nIngredients: ${ingredients}\\n\\nOpen in Plate Expectations: ${deepLink}`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Dinner: ${dishName}`,
      `DESCRIPTION:${desc}`,
      `URL:${deepLink}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

// Trigger calendar file download
export function downloadICSFile(icsContent: string, filename = 'plate-expectations-meal-plan.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
